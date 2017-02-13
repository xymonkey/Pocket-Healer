/*Creates and initializes the base game object and handles basic menu navigation. Most of the functionality for the game is added through the use of modules.*/

var game = {};

game = (function(game){

	game.currentBoss = game.currentBoss || {};

	function init (bossToInit)
	{
		if (game.state.isBeforeInit() || game.state.isReadyForRestart())
		{		
			if (!bossToInit)
			{
				bossToInit = game.boss.bossTypes.WARWYLF_BOSS
			}
			game.currentBoss = bossToInit;
			game.state.init();
			game.state.hideGameOverDisplay();
			
			game.player.init();
			game.state.setInProgress();
			//Heroes are now initialized in boss.js based on boss type.
			game.skills.init();
			game.boss.init(bossToInit);
			game.input.init();
			
			/*Skill key assignment is handled manually here. Later, this will be handled by a skill selection screen.*/
			game.input.assignSkillToButton(game.skills.heal, 1);
			game.input.assignSkillToButton(game.skills.renew, 2);
			game.input.assignSkillToButton(game.skills.flashHeal, 3);
			game.input.assignSkillToButton(game.skills.shield, 4);
		}
	}

	game.init = init;
	return game;

})(game);

/* Menu navigation is mainly handled here since this will fire when the DOM is ready. These calls should be moved to more appropriate locations in future iterations.*/
$(function(){
	$("#start-button").click(function(){$("#boss-selection-screen").show();$("#start-menu").hide();});
	$("#warwylf-button").click(function(){$("#boss-selection-screen").hide();game.init(game.boss.bossTypes.WARWYLF_BOSS);});
	$("#fenrique-button").click(function(){$("#boss-selection-screen").hide();game.init(game.boss.bossTypes.FENRIQUE_BOSS);});
	$("#how-to-play-button").click(function(){$("#how-to-play").show();$("#game").hide();$("#start-menu").hide();});
	$("#help-back-to-start").click(function(){$("#how-to-play").hide();$("#game").hide();$("#start-menu").show();});
	$("#restart").click(function(){game.init(game.currentBoss);});
	$("#game-back-to-start").click(function(){$("#how-to-play").hide();$("#game").hide();$("#start-menu").show();});
});