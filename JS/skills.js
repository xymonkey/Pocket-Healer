game = (function(game){
	
	/* The assignment of the skill objects to the global game object is somehwat covoluted. The ultimate goal is that we only want
	   to expose the "cast" function and tooltip info for each skill to the global game object. */
	game.skills = game.skills||{};
	game.skills.heal = game.skills.heal||{};
	game.skills.renew = game.skills.renew||{};
	game.skills.flashHeal = game.skills.flashHeal||{};
	game.skills.shield = game.skills.shield||{};
	
	var skills = {};
	
	var buffTypes = game.buff.buffTypes;
	
	var tooltipElement, tooltipNameElement, tooltipDescriptionElement;
	
	/* Skill constructor. Hides all info except for cast function and prototype functions to get the tooltipName and tooltipDescription.
	   Since skills require precise definitions, the constructor is only intended to be invoked by passing an object with the skill's.
	   properties already defined. */
	   
	function Skill (skillToCopy)
	{
		skillToCopy = skillToCopy || {};
		
		//Time until a skill can be used again after it is used.
		var cooldown = skillToCopy.cooldown || 0;
		var onCooldown = skillToCopy.onCooldown || false;
		var castTime = skillToCopy.castTime || 0;
		
		//This should be removed later and moved to a setSkillCooldownBar function or something along those lines.
		var cooldownBar = skillToCopy.cooldownBar || null;
		
		var manaCost = skillToCopy.manaCost || 0;
		var magnitude = skillToCopy.magnitude || 0;
		var tooltipName = skillToCopy.tooltipName || "";
		var tooltipDescription = skillToCopy.tooltipDescription || "";
		
		this.cast = skillToCopy.cast || null;
		
		this.showTooltip = function(skillLocation)
		{
			tooltipNameElement.innerHTML = tooltipName;
			tooltipDescriptionElement.innerHTML = tooltipDescription;
			tooltipElement.style.display = "block";
			tooltipElement.style.left = skillLocation.x;
			tooltipElement.style.top = skillLocation.y
		};

		this.hideTooltip = function(){tooltipElement.style.display = "none";};
	}		
	
	function init ()
	{
		tooltipElement = document.getElementById("spell-tooltip");
		tooltipNameElement = document.getElementById("spell-name");
		tooltipDescriptionElement = document.getElementById("spell-description");
		
		//Skill definitions.
		
		//Heal: Basic, mana efficient heal spell with a medium cast time.
		skills.heal={};
		skills.heal.cooldown=0;
		skills.heal.onCooldown=false;
		skills.heal.castTime=3000;
		
		// TODO: enable us to pass the element (or at least the skill number) we want to assign this to.
		// This should be tied to game.input.assignSkillToButton.
		skills.heal.cooldownBar=document.getElementById("skill1cooldown");
		
		skills.heal.manaCost=10;
		skills.heal.magnitude=30;
		skills.heal.tooltipName = "Heal";
		
		// This is OK for now, but if we want to be able to change these values later, we may need to adjust how we define the tooltip.
		skills.heal.tooltipDescription = "Heals a target for "+skills.heal.magnitude+" HP.<br/><br/>Cast time:"+skills.heal.castTime/1000+"seconds";
		
		skills.heal.cast = heal;
		skills.heal.animateCooldown = animateCooldown;
		
		// Renew: Heals a target gradually over time.
		skills.renew={};
		skills.renew.cooldown=4000;
		skills.renew.onCooldown=false;
		skills.renew.castTime=0;
		skills.renew.cooldownBar=document.getElementById("skill2cooldown");
		skills.renew.manaCost = 20;
		skills.renew.intervalMagnitude=10;
		skills.renew.intervalTick = 2000;
		skills.renew.intervalDuration=12000;
		skills.renew.tooltipName = "Renew";
		skills.renew.tooltipDescription = "Heals a target for "+skills.renew.intervalMagnitude+" HP over "+skills.renew.intervalDuration/1000+" seconds.<br/><br/>Cast time:instant.<br/>Cooldown: "+skills.renew.cooldown/1000+"seconds";
		skills.renew.cast = renew;
		skills.renew.animateCooldown = animateCooldown;
		
		// Flash heal: Fast casting direct heal spell.
		skills.flashHeal={};
		skills.flashHeal.cooldown=0;
		skills.flashHeal.onCooldown=false;
		skills.flashHeal.castTime=1500;
		skills.flashHeal.cooldownBar=document.getElementById("skill3cooldown");
		skills.flashHeal.manaCost=30;
		skills.flashHeal.magnitude=40;
		skills.flashHeal.tooltipName = "Flash Heal";
		skills.flashHeal.tooltipDescription = "Heals a target for "+skills.flashHeal.magnitude+" HP.<br/><br/>Cast time:"+skills.flashHeal.castTime/1000+"seconds";
		skills.flashHeal.cast = flashHeal;
		skills.flashHeal.animateCooldown = animateCooldown;
		
		// Shield: Places a shield on a target that takes a set amount of damage before breaking. Lasts until it breaks or expires.
		skills.shield={};
		skills.shield.cooldown=6000;
		skills.shield.onCooldown=false;
		skills.shield.castTime=0;
		skills.shield.cooldownBar=document.getElementById("skill4cooldown");
		skills.shield.manaCost=40;
		skills.shield.magnitude=40;
		skills.shield.duration=15000;
		skills.shield.tooltipName = "Shield";
		skills.shield.tooltipDescription = "Provides a shield for the target that absorbs "+skills.shield.magnitude+" HP before breaking.<br/><br/>Cast time:instant.<br/>Cooldown: "+skills.shield.cooldown/1000+"seconds";
		skills.shield.cast = shield;
		skills.shield.animateCooldown = animateCooldown;
		
		game.skills.heal = new Skill (skills.heal);
		game.skills.renew = new Skill (skills.renew);
		game.skills.flashHeal = new Skill (skills.flashHeal);
		game.skills.shield = new Skill (skills.shield);
	}
	
	function animateCooldown (currentDuration)
	{
		var delta = this.cooldown/10;
		
		//skillReference needed to call animateCooldown recursively in timeout.
		var skillReference = this;
		if (!currentDuration)
			currentDuration = 0;
		if (this.cooldown - currentDuration < delta)
		{
			currentDuration = this.cooldown;
		}
		else
		{
			currentDuration += delta;
		}
		this.cooldownBar.style.height = parseInt((currentDuration/this.cooldown)*100) + "%";
		this.cooldownBar.style.marginTop = parseInt(100-(currentDuration/this.cooldown)*100) + "%";
		if (currentDuration != this.cooldown)
		{
			setTimeout(function(){skillReference.animateCooldown(currentDuration);}, delta);
		}
		else
		{
			this.cooldownBar.style.height = "0%";
		}
	}
	
	//Spell cast function definitions. These functions fire when a skill is cast. If a skill places a buff on a target, the cast function will also define the buff to pass to the buff constructor and provide an effect function for the associated buff.

	function heal ()
	{
		var target = game.input.getTarget();
		
		if (!target)
			return;
		
		if (!target.alive && game.state.isInProgress())
		{
			return;
		}
		if (typeof(target) != "undefined" && !game.player.isCasting() && game.player.getCurrentMana() > skills.heal.manaCost)
		{
			game.input.setCastingTarget (target);
			setTimeout(function(){game.heroes.healHero(game.input.getCastingTarget(),skills.heal.magnitude);},skills.heal.castTime);
			game.player.fillCastBar (skills.heal.castTime);
			game.player.updateManaBar(-skills.heal.manaCost);
			skills.heal.animateCooldown ();
		}
	}

	function flashHeal ()
	{
		var target = game.input.getTarget();
		
		if (!target)
			return;
		
		if (!target.alive && game.state.isInProgress)
		{
			return;
		}
		if (typeof(target) != "undefined" && !game.player.isCasting() && game.player.getCurrentMana() > skills.flashHeal.manaCost)
		{
			game.input.setCastingTarget(target);
			setTimeout(function(){game.heroes.healHero(game.input.getCastingTarget(),skills.flashHeal.magnitude);},skills.flashHeal.castTime);
			game.player.fillCastBar (skills.flashHeal.castTime);
			game.player.updateManaBar(-skills.flashHeal.manaCost);
			skills.flashHeal.animateCooldown ();
		}
	}

	function renew ()
	{
		var target = game.input.getTarget();
		
		if (!target)
			return;
		
		if (!target.alive && game.state.isInProgress())
		{
			return;
		}
		if (typeof(target) != "undefined" && !game.player.isCasting() && !skills.renew.onCooldown && game.player.getCurrentMana() > skills.renew.manaCost)
		{
			var buff = {};
			buff.effectTick = skills.renew.intervalTick;
			buff.target = target;
			buff.duration = skills.renew.intervalDuration;
			buff.effect = renewEffect;
			buff.name = "Renew"
			buff.icon = "url(./Images/Icons/heal-jade-3.png)";
			
			game.heroes.applyBuff(target, buff);
			
			skills.renew.onCooldown=true;
			setTimeout(function(){skills.renew.onCooldown=false;},skills.renew.cooldown);
			skills.renew.animateCooldown ();
			game.player.updateManaBar(-skills.renew.manaCost);
		}
		
		function renewEffect ()
		{
			var magnitude = skills.renew.intervalMagnitude;
			game.heroes.healHero(this.getTarget(), magnitude);
		}
	}

	function shield ()
	{
		var target = game.input.getTarget();
		
		if (!target)
			return;
		
		if (!target.alive && game.state.isInProgress())
		{
			return;
		}
		if (typeof(target) != "undefined" && !game.player.isCasting() && !skills.shield.onCooldown && game.player.getCurrentMana() > skills.shield.manaCost)
		{
			var buff = {};
			buff.target = target;
			buff.duration = skills.shield.duration;
			buff.effect = shieldEffect;
			buff.name = "Shield";
			buff.types = [];
			buff.types.push(buffTypes.BUFF_TYPE_SHIELD);
			buff.icon = "url(./Images/Icons/protect-blue-3.png)";
			
			buff.statBonuses = [];
			buff.statBonuses["currentShield"] = skills.shield.magnitude;
			buff.statBonuses["maxShield"] = skills.shield.magnitude;
			
			game.heroes.applyBuff(target, buff);
			
			skills.shield.onCooldown=true;
			setTimeout(function(){skills.shield.onCooldown=false;},skills.shield.cooldown);
			skills.shield.animateCooldown ();
			game.player.updateManaBar(-skills.shield.manaCost);
		}
		
		function shieldEffect ()
		{
		}
	}

	game.skills.init = init;
	
	return game;
})(game||{});