/*Creates and initializes the base game object and handles basic menu navigation. Most of the functionality for the game is added through the use of modules.*/

var game = {};

game = (function(game){

	var currentBoss,
		onStartEvents;
		
	//jQuery References to menu divs should be declared here and then registered using registerAllMenus.
	var jStartMenu,
		jBossMenu,
		jHowToPlayMenu,
		jSkillSelectMenu,
		jGameMenu;

	function init ()
	{
		if (game.state.isBeforeInit() || game.state.isReadyForRestart())
		{
			jStartMenu = $("#start-menu");
			jBossMenu = $("#boss-selection-screen");
			jHowToPlayMenu = $("#how-to-play");
			jSkillSelectMenu = $("#skill-selection-screen");
			jGameMenu = $("#game");
			
			onStartEvents = [];
			
			registerAllMenus();
			
			game.state.init();
			game.player.init();
			game.skills.init();
			game.input.init();
			
			showStartMenu();
			
			/*Skill key assignment is handled manually here. Later, this will be handled by a skill selection screen.*/
			game.input.assignSkillToButton(game.skills.heal, 1);
			game.input.assignSkillToButton(game.skills.renew, 2);
			game.input.assignSkillToButton(game.skills.flashHeal, 3);
			game.input.assignSkillToButton(game.skills.shield, 4);
		}
	}
	
	function start (bossToInit)
	{
		if (game.state.isBeforeInit() || game.state.isReadyForRestart())
		{
			// Heroes are initialized based on the boss and boss is chosen based on selection.
			// Since we won't know what boss was chosen until right before start, the boss is initialized in the start method.
			if (!bossToInit)
			{
				bossToInit = game.boss.bossTypes.WARWYLF_BOSS
			}
			
			currentBoss = bossToInit;
			
			game.state.setInProgress();
			game.heroes.init();
			game.boss.init();
			
			//Since we're pushing the events to the array like a stack, the elements occur in the reverse order that we pushed while iterating.
			//Since we need to fire the last event (first pushed) first, we start with the last element and work our way down.
			for (var i = onStartEvents.length-1; i >= 0; i--)
			{
				onStartEvents[i]();
			}
			
		}
	}
	
	function registerAllMenus ()
	{
		game.input.registerMenu(jStartMenu);
		game.input.registerMenu(jBossMenu);
		game.input.registerMenu(jHowToPlayMenu);
		game.input.registerMenu(jSkillSelectMenu);
		game.input.registerMenu(jGameMenu);
	}
	
	function setCurrentBoss (boss)
	{
		if (!game.state.isInProgress())
		{
			currentBoss = boss;
		}
	}
	
	function getCurrentBoss ()
	{
		return currentBoss;
	}
	
	function addOnStartEvent (callback)
	{
		if (typeof (callback) === "function")
		{
			onStartEvents.push(callback);
		}
	}
	
	function showStartMenu ()
	{
		game.input.hideAllMenus();
		jStartMenu.show();
	}

	function showSkillSelectMenu ()
	{
		game.input.hideAllMenus();
		jSkillSelectMenu.show();
		game.input.onNavigateToSkillSelectionScreen()
	}

	function showBossMenu ()
	{
		game.input.hideAllMenus();
		jBossMenu.show();
	}

	function showHowToPlayMenu ()
	{
		game.input.hideAllMenus();
		jHowToPlayMenu.show();
	}

	function fightBoss (boss)
	{
		if (!game.state.isInProgress())
		{
			game.input.hideAllMenus();
			game.start(boss);
		}
	}

	game.init = init;
	game.start = start;
	game.setCurrentBoss = setCurrentBoss;
	game.getCurrentBoss = getCurrentBoss;
	game.addOnStartEvent = addOnStartEvent;
	game.showStartMenu = showStartMenu;
	game.showHowToPlayMenu = showHowToPlayMenu;
	game.showSkillSelectMenu = showSkillSelectMenu;
	game.showBossMenu = showBossMenu;
	game.fightBoss = fightBoss;
	return game;

})(game);

/* Menu navigation is mainly handled here since this will fire when the DOM is ready. These calls should be moved to more appropriate locations in future iterations.*/
$(function(){
	$("#start-button").click(function(){game.showBossMenu();});
	$("#warwylf-button").click(function(){game.fightBoss(game.boss.bossTypes.WARWYLF_BOSS);});
	$("#fenrique-button").click(function(){game.fightBoss(game.boss.bossTypes.FENRIQUE_BOSS);});
	$("#how-to-play-button").click(function(){game.showHowToPlayMenu();});
	$("#help-back-to-start").click(function(){game.showStartMenu();});
	$("#restart").click(function(){game.fightBoss(game.getCurrentBoss());});
	$("#game-back-to-start").click(function(){game.showStartMenu();});
	$("#skill-select-button").click(function(){game.showSkillSelectMenu();});
	$("#skill-select-to-start").click(function(){game.showStartMenu();});
	$("#boss-back-to-start").click(function(){game.showStartMenu();});
	game.init();
});