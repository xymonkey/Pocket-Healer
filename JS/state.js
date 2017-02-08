/* Adds and controls state information for the base game object.*/

game = (function(game){
	var BEFORE_INIT = 1;
	var IN_PROGRESS = 2;
	var PLAYER_LOST = 3;
	var PLAYER_WON = 4;
	var READY_FOR_RESTART = 5;
	
	game.state = game.state || {};
	
	var state = BEFORE_INIT;
	var gameOverDisplay,
		gameOverMessage;
	
	function init ()
	{
		gameOverDisplay = document.getElementById("game-over");
		gameOverMessage = document.getElementById("game-over-message");
		$("#game").show();
		$("#how-to-play").hide();
		$("#start-menu").hide();
		$("#restart").click(function(){game.init();});
		$("#game-back-to-start").click(function(){$("#how-to-play").hide();$("#game").hide;$("#start-menu").show;});
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