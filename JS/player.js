//Handles player specific attributes and dom elements such as the mana bar and cast bar.

game = (function(game){
	var castBar={};
	var manaBar={};
	
	game.player = game.player || {};
	
	function init ()
	{
		game.addOnStartEvent(onStart);
	}
	
	function onStart()
	{
		castBar = document.getElementById("currentcb");
		castBar.casting = false;
			
		manaBar = document.getElementById("currentmb");
		manaBar.currentMana = 1000;
		manaBar.totalMana = 1000;
		updateManaBar();
	}
	
	function fillCastBar (totalDuration, currentDuration)
	{
		castBar.casting = true;
		var delta = totalDuration/10;
		if (!currentDuration)
			currentDuration = 0;
		if (totalDuration - currentDuration < delta)
		{
			currentDuration = totalDuration;
		}
		else
		{
			currentDuration += delta;
		}
		castBar.style.width = parseInt((currentDuration/totalDuration)*100) + "%";
		if (currentDuration != totalDuration)
		{
			setTimeout(function(){fillCastBar(totalDuration, currentDuration);}, delta);
		}
		else
		{
			castBar.style.width = "0%";
			castBar.casting = false;
		}
	}

	function updateManaBar (cost)
	{
		cost = cost || 0;
		manaBar.currentMana += cost;
		manaBar.style.width = parseInt((manaBar.currentMana/manaBar.totalMana)*100) + "%";
	}
	
	function isCasting ()
	{
		return castBar.casting;
	}
	
	function getCurrentMana ()
	{
		return manaBar.currentMana;
	}
	
	game.player.init = init;
	game.player.fillCastBar = fillCastBar;
	game.player.updateManaBar = updateManaBar;
	game.player.isCasting = isCasting;
	game.player.getCurrentMana = getCurrentMana;
	
	return game;
})(game||{});