/*Adds a boss module to the game logic that controls boss behavior and properties.

Currently, boss data is hard-coded into a seperate function for each boss. Eventually, we may want to allow reading in boss info from a text or other source file.*/

game = (function(game){
	game.boss = game.boss || {};
	
	var boss;
	
	function initBoss (bossToInit)
	{
		boss={};
		boss.alive = true;
		switch (bossToInit)
		{
			default:warwylfScript();
		}
	}
	
	function warwylfScript ()
	{
		resetBossMessage();
		if(typeof(boss.specialAttackTimer) == "undefined")
		{
			boss.specialAttackTimer = 4;
		}
		
		if(typeof(boss.name) == "undefined")
		{
			boss.name = "Warwylf";
			document.getElementById("boss-label").innerHTML = boss.name;
			document.getElementById("boss-sprite").style.backgroundImage = 'url("./Images/Char/warwylf.gif")';
		}

		if (game.state.isInProgress())
		{
			var heroToDamage = game.heroes.getRandomHero ();
			
			if (typeof(boss.health) == "undefined")
			{
				boss.health = 400;
				boss.maxHealth = 400;
				boss.healthbar = document.getElementById("bosshc");
			}
			updateHealthbar();
			if (boss.specialAttackTimer > 0)
			{
				if(boss.specialAttackTimer == 1)
				{
					bossAlert(boss.name + " is preparing a special attack");
				}
				game.heroes.damageHero(heroToDamage,30);
				boss.specialAttackTimer -= 1;
			}
			else //boss.specialAttackTimer <=0
			{
				bossAlert(boss.name + " unleashes Feral Strike");
				game.heroes.damageHero(heroToDamage, 60);
				boss.specialAttackTimer = 4;
			}
			setTimeout(warwylfScript, 3000);
		}
		else if (game.state.hasPlayerLost() || game.state.hasPlayerWon())
			game.state.setReadyForRestart();
	}
	
	function damageBoss ()
	{
		var damage = game.heroes.getTotalHeroDamage();

		boss.health-=damage;
		if (boss.health <=0)
		{
			boss.alive = false;
			game.state.checkGameState();
		}
	}
	
	function bossAlert (message)
	{
		document.getElementById("boss-message").innerHTML = message;
	}

	function resetBossMessage ()
	{
		bossAlert("");
	}
	
	function isBossAlive ()
	{
		return boss.alive;
	}
	
	function updateHealthbar ()
	{
		boss.healthbar.style.width = parseInt((boss.health/boss.maxHealth)*100) + "%";
	}
	
	function getBossName ()
	{
		return boss.name;
	}
	
	game.boss.init = initBoss;
	game.boss.isBossAlive = isBossAlive;
	game.boss.damageBoss = damageBoss;
	game.boss.getBossName = getBossName;
	
	return game;
})(game || {});