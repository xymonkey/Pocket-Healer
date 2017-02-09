/*Maps user input to game functionality. Controls targeting and skill keybinding.*/

game = (function(game){
	
	game.input = game.input||{};
	
	var KEY_1 = 49;
	var KEY_2 = 50;
	var KEY_3 = 51;
	var KEY_4 = 52;
	var KEY_ESC = 27;
	
	var targetables;
	var skillbuttons;
	var skillKeys = {};
	var hardTarget = null;
	var softTarget = null;
	var castingTarget = {};
	
	function init ()
	{
		document.onkeypress = function (e) {
			e = e || window.event;
			switch (e.keyCode)
			{
				case KEY_1:skillKeys[KEY_1].cast();break;
				case KEY_2:skillKeys[KEY_2].cast();break;
				case KEY_3:skillKeys[KEY_3].cast();break;
				case KEY_4:skillKeys[KEY_4].cast();break;
				default:heal();
			}
		};
		
		document.onkeyup = function (e) {
			e = e || window.event;
			switch (e.keyCode)
			{
				case KEY_ESC:cancelAction();break;
				default:;
			}
		};
		
		setTargetables();
		setSkillInteractions();
	}

	function assignSkillToButton (skill, skillNumber)
	{
		document.getElementById("skill"+skillNumber).skill = skill;
		switch (skillNumber)
		{
			case 1:skillKeys[KEY_1]=skill;break;
			case 2:skillKeys[KEY_2]=skill;break;
			case 3:skillKeys[KEY_3]=skill;break;
			case 4:skillKeys[KEY_4]=skill;break;
			default:break;
		}
	}

	//Set all targets that can be healed/damaged by the player.
	function setTargetables ()
	{
		targetables = $(".healthbar").add(".healthcurrent");
		for (target=0; target<targetables.length; target++)
		{
			targetables[target].addEventListener("mouseover", onTargetHover, false);
			targetables[target].addEventListener("mouseout", onStopTargetHover, false);
			targetables[target].addEventListener("click", onTargetClick, false);
		}
	}

	function setSkillInteractions ()
	{
		skillButtons = $(".skill");
		for (skill=0; skill<skillButtons.length; skill++)
		{
			skillButtons[skill].addEventListener("mouseover", onSkillHover, false);
			skillButtons[skill].addEventListener("mouseout", onStopSkillHover, false);
			skillButtons[skill].addEventListener("click", onSkillClick, false);
		}
	}

	function onSkillHover (hoverEvent)
	{
		var target = hoverEvent.target;
		if (target.className != "skill")
		{
			if (target.parentNode.className == "skill")
			{
				target = target.parentNode;
			}
			else
			{
				return
			}
		}
		target.skill.showTooltip({x:hoverEvent.clientX+10, y:hoverEvent.clientY+20});	
	}

	function onStopSkillHover (hoverEvent)
	{
		var target = hoverEvent.target;
		if (target.className != "skill")
		{
			if (target.parentNode.className == "skill")
			{
				target = target.parentNode;
			}
			else
			{
				return
			}
		}
		target.skill.hideTooltip();
	}

	function onSkillClick (clickEvent)
	{
		var target = clickEvent.target;
		if (target.className != "skill")
		{
			if (target.parentNode.className == "skill")
			{
				target = target.parentNode;
			}
			else
			{
				return
			}
		}
		target.skill.cast();
	}
	
	//These onTarget functions' goal is to set the parent hero of a healthBar, healthCurrent, or shieldBar element since these are the elements that the user will usually interact with. We can probably move this parent grabbing code to a seperate utility.
	function onTargetHover (hoverEvent)
	{
		if (!hoverEvent.target.id)
			return;
		var targetId = hoverEvent.target.id;
		var target = $("#"+targetId);
		if(target.hasClass("healthcurrent") || target.hasClass("shield"))
		{
			target = target.parent();
		}
		if(target.hasClass("healthbar"))
		{
			target = target.parent();
		}
		if(target.hasClass("hero"))
		{
			if (softTarget && $(softTarget).removeClass)
			{
				$(softTarget).removeClass("soft-target");
				$(softTarget).children(".healthbar").removeClass("soft-target-highlight");
			}
			target.addClass("soft-target");
			target.children(".healthbar").addClass("soft-target-highlight");
			softTarget = target.get(0);
		}
	}


	function onTargetClick (clickEvent)
	{	if (!clickEvent.target.id)
			return;
		var targetId = clickEvent.target.id;
		var target = $("#"+targetId);
		if(target.hasClass("healthcurrent") || target.hasClass("shield"))
		{
			target = target.parent();
		}
		if(target.hasClass("healthbar"))
		{
			target = target.parent();
		}	
		if(target.hasClass("hero"))
		{
			if (hardTarget && $(hardTarget).removeClass)
			{
				$(hardTarget).removeClass("hard-target");
				$(hardTarget).children(".healthbar").removeClass("hard-target-highlight");
			}
			target.addClass("hard-target");
			target.children(".healthbar").addClass("hard-target-highlight");
			hardTarget = target.get(0);
		}
	}

	function onStopTargetHover (hoverEvent)
	{
		if (!hoverEvent.target.id)
			return;
		var targetId = hoverEvent.target.id;
		var target = $("#"+targetId);
		if(target.hasClass("healthcurrent") || target.hasClass("shield"))
		{
			target = target.parent();
		}
		if(target.hasClass("healthbar"))
		{
			target = target.parent();
		}
		if(target.hasClass("hero"))
		{
			if (softTarget && $(softTarget).removeClass)
			{
				$(softTarget).removeClass("soft-target");
				$(softTarget).children(".healthbar").removeClass("soft-target-highlight");
			}
			softTarget = null;
		}
	}
	
	//Return current intended target based on context (Is a potential target clicked on? Is the player hovering over a potential target?
	function getTarget ()
	{
		if (hardTarget && $(hardTarget).removeClass)
		{
			return hardTarget;
		}
		else
		{
			return softTarget;
		}
	}
	
	//Remove current target.
	//TODO: Add casting cancelation. this will require lots of tweaks to different parts of the code so holding off for now.
	//May want to clean up structure and consolidate objects first.
	function cancelAction ()
	{
		if (hardTarget && $(hardTarget).removeClass)
		{
			$(hardTarget).removeClass("hard-target");
			$(hardTarget).children(".healthbar").removeClass("hard-target-highlight");
			hardTarget = null;
		}
	}
	
	function getCastingTarget ()
	{
		return castingTarget;
	}
	
	function setCastingTarget (target)
	{
		castingTarget = target;
	}
	game.input.init = init;
	game.input.assignSkillToButton = assignSkillToButton;
	game.input.onSkillHover = onSkillHover;
	game.input.onStopSkillHover = onStopSkillHover;
	game.input.onSkillClick = onSkillClick;
	game.input.onTargetHover = onTargetHover;
	game.input.onTargetClick = onTargetClick;
	game.input.onStopTargetHover = onStopTargetHover;
	game.input.getTarget = getTarget;
	game.input.cancelAction = cancelAction;
	game.input.getCastingTarget = getCastingTarget;
	game.input.setCastingTarget = setCastingTarget;
	
	
	return game;
})(game||{});