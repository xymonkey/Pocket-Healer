//Utility functions for Pocket Healer game.
game = (function(game){
	game.util = game.util||{};
	function getRandomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min)) + min;
	}
	game.util.getRandomInt = getRandomInt;
	return game;
})(game || {});