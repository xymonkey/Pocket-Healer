/*Creates and initializes the base game object and handles basic menu navigation. Most of the functionality for the game is added through the use of modules.*/

var game = {};

game = (function(game){

	var currentBoss,
		onStartEvents;

	function init (bossToInit)
	{
		if (game.state.isBeforeInit() || game.state.isReadyForRestart())
		{
			onStartEvents = [];
			// Heroes are initialized based on the boss and boss is chosen based on selection.
			// Since we won't know what boss was chosen until right before start, the boss is initialized in the start method.
			if (!bossToInit)
			{
				bossToInit = game.boss.bossTypes.WARWYLF_BOSS
			}
			currentBoss = bossToInit;
			game.state.init();
			game.player.init();
			game.skills.init();
			game.input.init();
		}
	}
	
	function start ()
	{
		if (game.state.isBeforeInit() || game.state.isReadyForRestart())
		{
			game.state.setInProgress();
			game.heroes.init();
			game.boss.init();
			
			//Since we're pushing the events to the array like a stack, the elements occur in the reverse order that we pushed while iterating.
			//Since we need to fire the last event (first pushed) first, we start with the last element and work our way down.
			for (var i = onStartEvents.length-1; i >= 0; i--)
			{
				onStartEvents[i]();
			}
			/*Skill key assignment is handled manually here. Later, this will be handled by a skill selection screen.*/
			game.input.assignSkillToButton(game.skills.heal, 1);
			game.input.assignSkillToButton(game.skills.renew, 2);
			game.input.assignSkillToButton(game.skills.flashHeal, 3);
			game.input.assignSkillToButton(game.skills.shield, 4);
		}
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

	game.init = init;
	game.start = start;
	game.setCurrentBoss = setCurrentBoss;
	game.getCurrentBoss = getCurrentBoss;
	game.addOnStartEvent = addOnStartEvent;
	return game;

})(game);

/* Menu navigation is mainly handled here since this will fire when the DOM is ready. These calls should be moved to more appropriate locations in future iterations.*/
$(function(){
	$("#start-button").click(function(){$("#boss-selection-screen").show();$("#start-menu").hide();});
	$("#warwylf-button").click(function(){$("#boss-selection-screen").hide();game.init(game.boss.bossTypes.WARWYLF_BOSS);game.start()});
	$("#fenrique-button").click(function(){$("#boss-selection-screen").hide();game.init(game.boss.bossTypes.FENRIQUE_BOSS);game.start();});
	$("#how-to-play-button").click(function(){$("#how-to-play").show();$("#game").hide();$("#start-menu").hide();});
	$("#help-back-to-start").click(function(){$("#how-to-play").hide();$("#game").hide();$("#start-menu").show();});
	$("#restart").click(function(){game.init(game.getCurrentBoss);game.start();});
	$("#game-back-to-start").click(function(){$("#how-to-play").hide();$("#game").hide();$("#start-menu").show();});
	game.init();
});