/*Maps user input to game functionality. Controls targeting and skill keybinding.*/

game = (function(game){
	
	game.input = game.input||{};
	
	var KEY_1 = 49;
	var KEY_2 = 50;
	var KEY_3 = 51;
	var KEY_4 = 52;
	var KEY_ESC = 27;
	
	//Here, the j in the variable names denote that these are jQuery object references instead of straight DOM references.
	var targetables,
		skillbuttons,
		jSkillSelectButtons,
		jSkillsToSelect,
		jMenus = [],
		skillToSelectSelected = null,
		skillSelectButtonSelected = null,
		skillKeys = {},
		hardTarget = null,
		softTarget = null,
		castingTarget = {};
	
	function init ()
	{
		game.addOnStartEvent(onStart);
		jSkillSelectButtons = $("#skill-select-buttons");
		jSkillsToSelect = $("#skills-to-select");
	}
	
	function onStart ()
	{
		addSkillKeysToDOM();
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

	function registerMenu (jMenu)
	{
		jMenus.push (jMenu);
	}
	
	function hideAllMenus ()
	{
		for (menu in jMenus)
		{
			if (jMenus[menu].hide)
			{
				jMenus[menu].hide();
			}
		}
	}
	
	function onNavigateToSkillSelectionScreen ()
	{
		jSkillsToSelect.empty();
		jSkillSelectButtons.empty();
		
		for (var skill in game.skills)
		{
			if (game.skills[skill] instanceof (game.skills.Skill))
			{
				addSkillToSelectionList (game.skills[skill]);
			}
		}
		for (var i = 0; i < game.skills.NUM_SKILL_BUTTONS; i++)
		{
			addSkillSelectionButton();
		}
		
		setSkillSelectionButtonInteractions();
		setSkillToSelectInteractions();
	}
	
	function addSkillToSelectionList (skill)
	{
		var skillToSelect = document.createElement("span");
		skillToSelect.className = "skill-to-select";
		skillToSelect.style.backgroundImage = skill.getIcon();
		skillToSelect.skill = skill;
		jSkillsToSelect.get(0).appendChild(skillToSelect);
	}
	
	function addSkillSelectionButton ()
	{
		var skillButton = document.createElement("span");
		var keyNumber = jSkillSelectButtons.children().length + 1;
		skillButton.className = "skill-selection-button";
		switch (keyNumber)
		{
			case 1:skillButton.skill = skillKeys[KEY_1];break;
			case 2:skillButton.skill = skillKeys[KEY_2];break;
			case 3:skillButton.skill = skillKeys[KEY_3];break;
			case 4:skillButton.skill = skillKeys[KEY_4];break;
			default:skillButton.skill = skillKeys[KEY_1];break;
		}
		skillButton.keyNumber = keyNumber;
		skillButton.style.backgroundImage = skillButton.skill.getIcon();
		jSkillSelectButtons.get(0).appendChild(skillButton);
	}
	
	function assignSkillToButton (skill, skillNumber)
	{
		switch (skillNumber)
		{
			case 1:skillKeys[KEY_1]=skill;break;
			case 2:skillKeys[KEY_2]=skill;break;
			case 3:skillKeys[KEY_3]=skill;break;
			case 4:skillKeys[KEY_4]=skill;break;
			default:break;
		}
	}
	
	function addSkillKeysToDOM ()
	{
		skillKeys[KEY_1].setCooldownBar(document.getElementById("skill1cooldown"));
		document.getElementById("skill1").skill = skillKeys[KEY_1];
		document.getElementById("skill1").style.backgroundImage = skillKeys[KEY_1].getIcon();
		
		skillKeys[KEY_2].setCooldownBar(document.getElementById("skill2cooldown"));
		document.getElementById("skill2").skill = skillKeys[KEY_2];
		document.getElementById("skill2").style.backgroundImage = skillKeys[KEY_2].getIcon();
		
		skillKeys[KEY_3].setCooldownBar(document.getElementById("skill3cooldown"));
		document.getElementById("skill3").skill = skillKeys[KEY_3];
		document.getElementById("skill3").style.backgroundImage = skillKeys[KEY_3].getIcon();
		
		skillKeys[KEY_4].setCooldownBar(document.getElementById("skill4cooldown"));
		document.getElementById("skill4").skill = skillKeys[KEY_4];
		document.getElementById("skill4").style.backgroundImage = skillKeys[KEY_4].getIcon();
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

	//Set interactions for in-game skill buttons.
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
	
	//Set interactions for skill buttons from skill select screen.
	function setSkillSelectionButtonInteractions ()
	{
		for (var button=0; button<jSkillSelectButtons.children().length; button++)
		{
			jSkillSelectButtons.children().get(button).addEventListener("mouseover", onSkillSelectButtonHover, false);
			jSkillSelectButtons.children().get(button).addEventListener("mouseout", onSkillSelectButtonStopHover, false);
			jSkillSelectButtons.children().get(button).addEventListener("click", onSkillSelectButtonClick, false);
		}
	}
	
	//Set interactions for list of skills to choose from on skill select screen.
	function setSkillToSelectInteractions ()
	{
		for (var skill=0; skill<jSkillsToSelect.children().length; skill++)
		{
			jSkillsToSelect.children().get(skill).addEventListener("mouseover", onSkillToSelectHover, false);
			jSkillsToSelect.children().get(skill).addEventListener("mouseout", onSkillToSelectStopHover, false);
			jSkillsToSelect.children().get(skill).addEventListener("click", onSkillToSelectClick, false);
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
			
	function onSkillSelectButtonHover (hoverEvent)
	{
		var target = hoverEvent.target;
		if (target.className == "skill-selection-button")
		{
			if (target.skill)
			{
				target.skill.showTooltip({x:hoverEvent.clientX+10, y:hoverEvent.clientY+20});	
			}
		}
	}

	function onSkillSelectButtonStopHover (hoverEvent)
	{
		var target = hoverEvent.target;
		if (target.className == "skill-selection-button")
		{
			if (target.skill)
			{
				target.skill.hideTooltip();	
			}
		}
	}

	function onSkillSelectButtonClick (clickEvent)
	{
		var target = clickEvent.target;
		var skillSwapError = false;
		if (target.className == "skill-selection-button")
		{
			if (skillSelectButtonSelected)
			{
				let tempSkillButton = Object.create(target);
				Object.assign(tempSkillButton, target);
				
				assignSkillToButton(target.skill, skillSelectButtonSelected.keyNumber);
				assignSkillToButton(skillSelectButtonSelected.skill, tempSkillButton.keyNumber);
				target.skill = skillSelectButtonSelected.skill;
				target.style.backgroundImage = skillSelectButtonSelected.skill.getIcon();
				skillSelectButtonSelected.skill = tempSkillButton.skill;
				skillSelectButtonSelected.style.backgroundImage = tempSkillButton.skill.getIcon();
				document.getElementById("skill-select-error").innerHTML = "";
				
				$(skillSelectButtonSelected).removeClass("hard-target-highlight");
				skillSelectButtonSelected = null;
			}
			else
			{			
				skillSelectButtonSelected = target;
				$(skillSelectButtonSelected).addClass("hard-target-highlight");
			}
		}
		if (skillSelectButtonSelected &&
			skillToSelectSelected)
		{
			//TODO: add checks for unavailable skills.
			for (let i = 0; i < jSkillSelectButtons.children().length; i++)
			{
				if (jSkillSelectButtons.children().get(i).skill == skillToSelectSelected.skill)
				{
					//TODO: Figure out a more robust solution for error messages. Surprisingly, this was the first one I needed.
					document.getElementById("skill-select-error").innerHTML = "<p>Duplicate skills are not allowed.</p>";
					skillSwapError = true;
				}
			}
			if (!skillSwapError)
			{
				assignSkillToButton(skillToSelectSelected.skill, skillSelectButtonSelected.keyNumber);
				skillSelectButtonSelected.skill = skillToSelectSelected.skill;
				skillSelectButtonSelected.style.backgroundImage = skillSelectButtonSelected.skill.getIcon();
				document.getElementById("skill-select-error").innerHTML = "";
			}
			$(skillToSelectSelected).removeClass("hard-target-highlight");
			$(skillSelectButtonSelected).removeClass("hard-target-highlight");
			skillSelectButtonSelected = skillToSelectSelected = null;
		}
	}
		
	function onSkillToSelectHover (hoverEvent)
	{
		var target = hoverEvent.target;
		if (target.className == "skill-to-select")
		{
			if (target.skill)
			{
				target.skill.showTooltip({x:hoverEvent.clientX+10, y:hoverEvent.clientY+20});	
			}
		}
	}

	function onSkillToSelectStopHover (hoverEvent)
	{
		var target = hoverEvent.target;
		if (target.className == "skill-to-select")
		{
			if (target.skill)
			{
				target.skill.hideTooltip();	
			}
		}
	}

	function onSkillToSelectClick (clickEvent)
	{
		var target = clickEvent.target;
		var skillSwapError = false;
		if (target.className == "skill-to-select")
		{
			if (skillToSelectSelected)
			{
				$(skillToSelectSelected).removeClass("hard-target-highlight");
			}
			skillToSelectSelected = target;
			$(skillToSelectSelected).addClass("hard-target-highlight");
		}
		if (skillSelectButtonSelected &&
			skillToSelectSelected)
		{
			//TODO: add checks for unavailable skills.
			for (let i = 0; i < jSkillSelectButtons.children().length; i++)
			{
				if (jSkillSelectButtons.children().get(i).skill == skillToSelectSelected.skill)
				{
					//TODO: Figure out a more robust solution for error messages. Surprisingly, this was the first one I needed.
					document.getElementById("skill-select-error").innerHTML = "<p>Duplicate skills are not allowed.</p>";
					skillSwapError = true;
				}
			}
			if (!skillSwapError)
			{
				assignSkillToButton(skillToSelectSelected.skill, skillSelectButtonSelected.keyNumber);
				skillSelectButtonSelected.skill = skillToSelectSelected.skill;
				skillSelectButtonSelected.style.backgroundImage = skillSelectButtonSelected.skill.getIcon();
				document.getElementById("skill-select-error").innerHTML = "";
			}
			$(skillToSelectSelected).removeClass("hard-target-highlight");
			$(skillSelectButtonSelected).removeClass("hard-target-highlight");
			skillSelectButtonSelected = skillToSelectSelected = null;
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
	game.input.onNavigateToSkillSelectionScreen = onNavigateToSkillSelectionScreen;
	game.input.hideAllMenus = hideAllMenus;
	game.input.registerMenu = registerMenu;
	
	
	return game;
})(game||{});