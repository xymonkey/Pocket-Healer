/*Adds a boss module to the game logic that controls boss behavior and properties.

Currently, boss data is hard-coded into a seperate function for each boss. Eventually, we may want to allow reading in boss info from a text or other source file.*/

game = (function(game){
	game.boss = game.boss || {};
	game.boss.bossTypes = game.boss.bossTypes || {};
	
	game.boss.bossTypes.WARWYLF_BOSS = 0,
		game.boss.bossTypes.FENRIQUE_BOSS = 1;
	
	var boss,
		specialAttackInterval;
	
	function init (bossToInit)
	{
		boss={};
		boss.alive = true;
		switch (bossToInit)
		{
			case game.boss.bossTypes.WARWYLF_BOSS:
				boss.type=game.boss.bossTypes.WARWYLF_BOSS
				game.heroes.init(boss.type);
				warwylfScript();
				break;
			case game.boss.bossTypes.FENRIQUE_BOSS:
				boss.type=game.boss.bossTypes.FENRIQUE_BOSS
				game.heroes.init(boss.type);
				fenriqueScript();break;
			default:
				boss.type=game.boss.bossTypes.WARWYLF_BOSS
				game.heroes.init(game.boss.bossTypes.WARWYLF_BOSS);
				warwylfScript();
		}
	}
	
	function getBossType ()
	{
		return boss.type;
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
	
	function fenriqueScript ()
	{
		resetBossMessage();
		if(typeof(boss.specialAttackTimer) == "undefined")
		{
			boss.specialAttackTimer = 4;
		}
		
		if(typeof(boss.name) == "undefined")
		{
			boss.name = "Fenrique";
			document.getElementById("boss-label").innerHTML = boss.name;
			document.getElementById("boss-sprite").style.backgroundImage = 'url("./Images/Char/fenrique.gif")';
		}

		if (game.state.isInProgress())
		{
			var heroToDamage = game.heroes.getHeroWithThreat ();
			
			if (typeof(boss.health) == "undefined")
			{
				boss.health = 350;
				boss.maxHealth = 350;
				boss.healthbar = document.getElementById("bosshc");
			}
			updateHealthbar();
			if (boss.specialAttackTimer != 0)
			{
				if(boss.specialAttackTimer == 1)
				{
					bossAlert(boss.name + " is getting ready to pummel a hero");
				}
				game.heroes.damageHero(heroToDamage,40);
				boss.specialAttackTimer -= 1;
			}
			else //boss.specialAttackTimer == 0
			{
				bossAlert(boss.name + " unleashes pummel!");
				setTimeout(attackTimeout, 1000, 6);
				boss.specialAttackTimer = -1;
			}
			setTimeout(fenriqueScript, 3000);
		}
		else if (game.state.hasPlayerLost() || game.state.hasPlayerWon())
			game.state.setReadyForRestart();
		
		function attackTimeout (hits)
		{
			console.log("pummel hits"+hits);
			if (!boss.focusTarget)
			{
				boss.focusTarget = game.heroes.getRandomHero({role:game.heroes.roles.DPS_ROLE});
			}
			game.heroes.damageHero(boss.focusTarget, 20);
			hits--;
			if(hits<=0 || !game.heroes.isHeroAlive(boss.focusTarget))
			{
				boss.focusTarget = null;
				boss.specialAttackTimer = 4;
			}
			else
			{
				setTimeout(attackTimeout, 1000, hits);
			}
		}
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
	
	game.boss.init = init;
	game.boss.isBossAlive = isBossAlive;
	game.boss.damageBoss = damageBoss;
	game.boss.getBossName = getBossName;
	game.boss.getBossType = getBossType;
	
	return game;
})(game || {});