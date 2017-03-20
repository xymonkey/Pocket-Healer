game = (function(game){
	
	/* The assignment of the skill objects to the global game object is somehwat covoluted. The ultimate goal is that we only want
	   to expose the "cast" function and tooltip info for each skill to the global game object. */
	game.skills = game.skills||{};
	
	game.skills.NUM_SKILL_BUTTONS = 4;
	
	game.skills.heal = game.skills.heal||{};
	game.skills.renew = game.skills.renew||{};
	game.skills.flashHeal = game.skills.flashHeal||{};
	game.skills.shield = game.skills.shield||{};
	game.skills.dispel = game.skills.dispel||{};
	
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
		var icon = skillToCopy.icon || "";
		
		//This should be removed later and moved to a setSkillCooldownBar function or something along those lines.
		var cooldownBar = skillToCopy.cooldownBar || null;
		
		var manaCost = skillToCopy.manaCost || 0;
		var magnitude = skillToCopy.magnitude || 0;
		var tooltipName = skillToCopy.tooltipName || "";
		var tooltipDescription = skillToCopy.tooltipDescription || "";
		
		var duration = skillToCopy.duration || null;
		var intervalMagnitude = skillToCopy.intervalMagnitude || null;
		var intervalTick = skillToCopy.intervalTick || null;
		
		this.cast = skillToCopy.cast || null;
		
		this.showTooltip = function(skillLocation)
		{
			tooltipNameElement.innerHTML = tooltipName;
			tooltipDescriptionElement.innerHTML = tooltipDescription;
			tooltipElement.style.display = "block";
			tooltipElement.style.left = skillLocation.x + "px";
			tooltipElement.style.top = skillLocation.y + "px";
		};
		
		this.getIntervalMagnitude = function(){return intervalMagnitude;};
		
		this.getDuration = function(){return duration;};
		
		this.getIntervalTick = function(){return intervalTick;};

		this.getMagnitude = function(){return magnitude;};
		
		this.getManaCost = function(){return manaCost;};
		
		this.getCastTime = function(){return castTime;};
		
		this.getCooldown = function(){return cooldown;};
		
		this.isOnCooldown = function(){return onCooldown;};
		
		this.setOnCooldown = function()
		{
			onCooldown = true; 
			setTimeout(function(){onCooldown=false;}, cooldown);
		};
		
		this.hideTooltip = function(){tooltipElement.style.display = "none";};
		
		this.getIcon = function(){return icon};
		
		this.setCooldownBar = function (cooldownBar)
		{
			if (cooldownBar.className.indexOf("skill-cooldown") != -1)
			{
				this.cooldownBar = cooldownBar;
			}
		};
		
		this.animateCooldown = function (currentDuration)
		{
			var delta = this.getCooldown()/10;
			
			//skillReference needed to call animateCooldown recursively in timeout.
			var skillReference = this;
			if (!currentDuration)
				currentDuration = 0;
			if (this.getCooldown() - currentDuration < delta)
			{
				currentDuration = this.getCooldown();
			}
			else
			{
				currentDuration += delta;
			}
			this.cooldownBar.style.height = parseInt((currentDuration/this.getCooldown())*100) + "%";
			this.cooldownBar.style.marginTop = parseInt(100-(currentDuration/this.getCooldown())*100) + "%";
			if (currentDuration != this.getCooldown())
			{
				setTimeout(function(){skillReference.animateCooldown(currentDuration);}, delta);
			}
			else
			{
				this.cooldownBar.style.height = "0%";
			}
		};
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
		
		skills.heal.manaCost=10;
		skills.heal.magnitude=30;
		skills.heal.tooltipName = "Heal";
		
		skills.heal.icon = "url(./Images/Icons/heal-sky-3.png)"
		
		// This is OK for now, but if we want to be able to change these values later, we may need to adjust how we define the tooltip.
		skills.heal.tooltipDescription = "Heals a target for "+skills.heal.magnitude+" HP.<br/><br/>Cast time:"+skills.heal.castTime/1000+"seconds";
		
		skills.heal.cast = heal;
		
		// Renew: Heals a target gradually over time.
		skills.renew={};
		skills.renew.cooldown=4000;
		skills.renew.onCooldown=false;
		skills.renew.castTime=0;
		skills.renew.manaCost = 20;
		skills.renew.intervalMagnitude=10;
		skills.renew.intervalTick = 2000;
		skills.renew.duration=12000;
		skills.renew.icon = "url(./Images/Icons/heal-jade-3.png)";
		skills.renew.tooltipName = "Renew";
		skills.renew.tooltipDescription = "Heals a target for "+skills.renew.intervalMagnitude+" HP over "+skills.renew.duration/1000+" seconds.<br/><br/>Cast time:instant.<br/>Cooldown: "+skills.renew.cooldown/1000+"seconds";
		skills.renew.cast = renew;
		
		// Dispel: Remove a debuff from a target. In the future, we may add the ability for this spell to remove a friendly debuff from an enemy (we may also just make this a seperate skill).
		skills.dispel={};
		skills.dispel.cooldown=0;
		skills.dispel.onCooldown=false;
		skills.dispel.castTime=0;
		skills.dispel.manaCost = 20;
		skills.dispel.icon = "url(./Images/Icons/heal-jade-3.png)";
		skills.dispel.tooltipName = "Dispel";
		skills.dispel.tooltipDescription = "Removes a debuff from a friendly target.<br/><br/>Cast time:instant.";
		skills.dispel.cast = dispel;
		
		// Flash heal: Fast casting direct heal spell.
		skills.flashHeal={};
		skills.flashHeal.cooldown=0;
		skills.flashHeal.onCooldown=false;
		skills.flashHeal.castTime=1500;
		skills.flashHeal.manaCost=30;
		skills.flashHeal.magnitude=40;
		skills.flashHeal.icon = "url(./Images/Icons/heal-royal-3.png)";
		skills.flashHeal.tooltipName = "Flash Heal";
		skills.flashHeal.tooltipDescription = "Heals a target for "+skills.flashHeal.magnitude+" HP.<br/><br/>Cast time:"+skills.flashHeal.castTime/1000+"seconds";
		skills.flashHeal.cast = flashHeal;
		
		// Shield: Places a shield on a target that takes a set amount of damage before breaking. Lasts until it breaks or expires.
		skills.shield={};
		skills.shield.cooldown=6000;
		skills.shield.onCooldown=false;
		skills.shield.castTime=0;
		skills.shield.manaCost=40;
		skills.shield.magnitude=40;
		skills.shield.duration=15000;
		skills.shield.icon = "url(./Images/Icons/protect-blue-3.png)";
		skills.shield.tooltipName = "Shield";
		skills.shield.tooltipDescription = "Provides a shield for the target that absorbs "+skills.shield.magnitude+" HP before breaking.<br/><br/>Cast time:instant.<br/>Cooldown: "+skills.shield.cooldown/1000+"seconds";
		skills.shield.cast = shield;
		
		game.skills.heal = new Skill (skills.heal);
		game.skills.renew = new Skill (skills.renew);
		game.skills.flashHeal = new Skill (skills.flashHeal);
		game.skills.shield = new Skill (skills.shield);
		game.skills.dispel = new Skill (skills.dispel);
	}
	
	//Spell cast function definitions. These functions fire when a skill is cast. If a skill places a buff on a target, the cast function will also define the buff to pass to the buff constructor and provide an effect function for the associated buff.

	function heal ()
	{
		var target = game.input.getTarget();
		var skillReference = this;
		if (!target)
			return;
		
		if (!target.alive && game.state.isInProgress())
		{
			return;
		}
		if (typeof(target) != "undefined" && !game.player.isCasting() && game.player.getCurrentMana() > this.getManaCost())
		{
			game.input.setCastingTarget (target);
			setTimeout(function(){game.heroes.healHero(game.input.getCastingTarget(),skillReference.getMagnitude());},this.getCastTime());
			game.player.fillCastBar (this.getCastTime());
			game.player.updateManaBar(-this.getManaCost());
			this.animateCooldown ();
		}
	}

	function flashHeal ()
	{
		var target = game.input.getTarget();
		var skillReference = this;
		
		if (!target)
			return;
		
		if (!target.alive && game.state.isInProgress)
		{
			return;
		}
		if (typeof(target) != "undefined" && !game.player.isCasting() && game.player.getCurrentMana() > this.getManaCost())
		{
			game.input.setCastingTarget(target);
			setTimeout(function(){game.heroes.healHero(game.input.getCastingTarget(),skillReference.getMagnitude());},this.getCastTime());
			game.player.fillCastBar (this.getCastTime());
			game.player.updateManaBar(-this.getManaCost());
			this.animateCooldown ();
		}
	}

	function renew ()
	{
		var target = game.input.getTarget();
		var magnitude = this.getIntervalMagnitude();
		
		if (!target)
			return;
		
		if (!target.alive && game.state.isInProgress())
		{
			return;
		}
		if (typeof(target) != "undefined" && !game.player.isCasting() && !this.isOnCooldown() && game.player.getCurrentMana() > this.getManaCost())
		{
			var buff = {};
			buff.effectTick = this.getIntervalTick();
			buff.target = target;
			buff.duration = this.getDuration();
			buff.effect = renewEffect;
			buff.name = "Renew"
			buff.icon = "url(./Images/Icons/heal-jade-3.png)";
			
			game.heroes.applyBuff(target, buff);
			
			this.setOnCooldown();
			this.animateCooldown();
			game.player.updateManaBar(-this.manaCost);
		}
		
		function renewEffect ()
		{
			game.heroes.healHero(target, magnitude);
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
		if (typeof(target) != "undefined" && !game.player.isCasting() && !this.isOnCooldown() && game.player.getCurrentMana() > this.getManaCost())
		{
			var buff = {};
			buff.target = target;
			buff.duration = this.getDuration();
			buff.effect = shieldEffect;
			buff.name = "Shield";
			buff.types = [];
			buff.types.push(buffTypes.BUFF_TYPE_SHIELD);
			buff.icon = "url(./Images/Icons/protect-blue-3.png)";
			
			buff.statBonuses = [];
			buff.statBonuses["currentShield"] = this.getMagnitude();
			buff.statBonuses["maxShield"] = this.getMagnitude();
			
			game.heroes.applyBuff(target, buff);
			
			this.setOnCooldown();
			this.animateCooldown();
			game.player.updateManaBar(-this.getManaCost());
		}
		
		function shieldEffect ()
		{
		}
	}
	
	function dispel ()
	{
		var target = game.input.getTarget();
		var skillReference = this;
		if (!target)
			return;
		
		if (!target.alive && game.state.isInProgress())
		{
			return;
		}
		if (typeof(target) != "undefined" && !game.player.isCasting() && game.player.getCurrentMana() > this.getManaCost())
		{
			game.input.setCastingTarget (target);
			
			game.heroes.dispelBuff(target);
			
			game.player.updateManaBar(-this.getManaCost());
			this.animateCooldown ();
		}
	}

	game.skills.init = init;
	game.skills.Skill = Skill;
	
	return game;
})(game||{});