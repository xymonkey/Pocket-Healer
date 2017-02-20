/* Adds and controls state information for the base game object.*/

game = (function(game){
	var BEFORE_INIT = 1;
	var IN_PROGRESS = 2;
	var PLAYER_LOST = 3;
	var PLAYER_WON = 4;
	var READY_FOR_RESTART = 5;
	
	game.state = game.state || {};
	
	var state = BEFORE_INIT;
	
	//Here, the j in the variable names denote that these are jQuery object references instead of straight DOM references.
	var gameOverDisplay,
		gameOverMessage,
		jRestartButton,
		jGameBackToStartButton,
		jGameMenu,
		jHowToPlayMenu,
		jStartMenu;
	
	function init ()
	{
		gameOverDisplay = document.getElementById("game-over");
		gameOverMessage = document.getElementById("game-over-message");
		jRestartButton = $("#restart");
		jGameBackToStartButton = $("#game-back-to-start");
		jGameMenu = $("#game");
		jHowToPlayMenu = $("#how-to-play");
		jStartMenu = $("#start-menu")
		
		jRestartButton.click(function(){restartGame();});
		backToStartMenu ();
		
		//This may not work since we may not be able to access the helper functions from the game context. If that happens, call everything directly instead of using helpers or pass a this reference.
		game.addOnStartEvent(onStart);
	}
	
	function onStart ()
	{
		showGameMenu();
		hideGameOverDisplay();
	}
	
	function restartGame ()
	{
		game.init(game.getCurrentBoss);game.start();
	}
	
	function showGameMenu ()
	{
		jGameMenu.show();
		jHowToPlayMenu.hide();
		jStartMenu.hide();
	}
	
	function backToStartMenu ()
	{
		jGameBackToStartButton.click(function(){jHowToPlayMenu.hide();jGameMenu.hide;jStartMenu.show;});
	}
	
	function isBeforeInit ()
	{
		return state == BEFORE_INIT;
	}
	
	function isInProgress ()
	{
		return state == IN_PROGRESS;
	}
	
	function hasPlayerLost ()
	{
		return state == PLAYER_LOST;
	}
	
	function hasPlayerWon ()
	{
		return state == PLAYER_WON;
	}
	
	function isReadyForRestart ()
	{
		return state == READY_FOR_RESTART;
	}
	
	function setReadyForRestart ()
	{
		state = READY_FOR_RESTART;
	}
	
	function setInProgress ()
	{
		if (state == BEFORE_INIT || state == READY_FOR_RESTART)
		{
			state = IN_PROGRESS;
		}
	}
	
	function checkGameState ()
	{
		if (game.heroes.areHeroesDead())
			playerLost();
		else if (!game.boss.isBossAlive())
			playerWon();
	}
	
	function playerLost ()
	{
		state = PLAYER_LOST;	
		gameOverDisplay.style.display = "block";
		gameOverMessage.innerHTML = "You lose!";
		game.heroes.clearDamageInterval();
	}

	function playerWon ()
	{
		state = PLAYER_WON;	
		gameOverDisplay.style.display = "block";
		gameOverMessage.innerHTML = "You win!";
		game.heroes.clearDamageInterval();
	}
	
	function hideGameOverDisplay ()
	{
		gameOverDisplay.style.display = "none";
	}

	game.state.init = init;
	game.state.isBeforeInit = isBeforeInit;
	game.state.isInProgress = isInProgress;
	game.state.setInProgress = setInProgress;
	game.state.hasPlayerLost = hasPlayerLost;
	game.state.hasPlayerWon = hasPlayerWon;
	game.state.isReadyForRestart = isReadyForRestart;
	game.state.setReadyForRestart = setReadyForRestart;
	game.state.checkGameState = checkGameState;
	game.state.hideGameOverDisplay = hideGameOverDisplay;
	
	return game;
})(game||{});