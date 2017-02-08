/* Manages hero states as well as hero DOM elements, such as healthbars. Currently the focus is on the group of heroes rather than the individual, 
   but as hero functionality becomes more complex we should consider creating a seperate hero module/constructor.*/
   
game = (function(game){
	
	game.heroes = game.heroes || {};
	var heroes = [];
	
	function init (numHeroes)
	{
		//Because arrays with references in other objects are not cleared when using "array = []", we manually set length to 0 to reset the array after starting a new game.
		heroes.length = 0;
		cleanup();
		for (i=0;i<numHeroes;i++)
		{
			//Create hero div.
			var currentHero = document.createElement("span");
			currentHero.id = "hero" + (i+1);
			currentHero.className = "hero";
			
			//Create hero label.
			var label = document.createElement ("div");
			label.id = "hero" + (i+1) + "-label";
			label.className = "hero-label";
			
			//Create hero healthbar.
			var healthbar = document.createElement ("div");
			healthbar.id = "hero" + (i+1) + "hb";
			healthbar.className = "healthbar";
			
			var currentHealth = document.createElement("span");
			currentHealth.id = "hero" + (i+1) + "hc";
			currentHealth.className = "healthcurrent";
			
			var shieldBar = document.createElement("span");
			shieldBar.id = "hero" + (i+1) + "shield";
			shieldBar.className = "shield";
			
			//Configure hero variables and associate with DOM elements.
			
			currentHero.health=100;
			currentHero.maxHealth=100;

			currentHero.healthbar=currentHealth;
			currentHero.shieldBar = shieldBar;
			
			currentHero.alive = true;
			currentHero.damage = 1;
			currentHero.buffs = [];
			currentHero.tempStats = [];
			
			//Add to DOM and push to array.
			healthbar.appendChild(shieldBar);
			healthbar.appendChild(currentHealth);
			currentHero.appendChild(label);
			currentHero.appendChild(healthbar);
			
			document.getElementById("heroes").appendChild(currentHero);
			
			heroes.push(currentHero);
			updateHealthbar(currentHero);
		}
		heroes.damageInterval=setInterval(function(){game.boss.damageBoss();},3000);
	}
	
	//Clean up hero related DOM elements when restarting.
	function cleanup ()
	{
		var heroes = document.getElementById("heroes");
		while (heroes.firstChild) {
			heroes.removeChild(heroes.firstChild);
		}
	}
	
	function damageHero (hero, damage)
	{
		if (!hero.alive && game.state.isInProgress())
		{
			return;
		}
		if (hero.buffs.length > 0)
		{
			for (i in hero.buffs)
			{
				if (hero.buffs[i] && hero.buffs[i].hasOwnProperty && hero.buffs[i].getTypes() && hero.buffs[i].getTypes().indexOf(game.buff.buffTypes.BUFF_TYPE_SHIELD) > -1)
				{
					if (hero.buffs[i].isDispelled())
					{
						hero.buffs[i] = null;
						continue;
					}
					hero.buffs[i].statBonuses["currentShield"] -= damage;
					if (hero.buffs[i].statBonuses["currentShield"] < 0)
					{
						//Any excess damage to the shield will later be applied to HP.
						damage = -hero.buffs[i].statBonuses["currentShield"];
						hero.buffs[i].dispel({offensive:true,friendly:true,override:true});
						hero.buffs[i] = null;
						break;
					}
					else
					{
						//Shield absorbed all the damage, so don't do any HP damage.
						damage = 0;
					}
				}
			}
		}
		hero.health -= damage;
		hero.health = Math.max(hero.health, 0);
		updateStats(hero);
		if (hero.health <= 0)
			killHero(hero);
	}
		
	function healHero (hero, heal)
	{
		if (!hero.alive && game.state.isInProgress())
		{
			return;
		}
		hero.health += heal;
		hero.health = Math.min(hero.health, 100)
		updateHealthbar (hero);
	}

	function killHero (hero)
	{
		hero.alive = false;
		if (hero.buffs.length > 0)
		{
			for (i in hero.buffs)
			{
				if (hero.buffs[i] && hero.buffs[i].hasOwnProperty)
				{
					hero.buffs[i].dispel({offensive:true,friendly:true,override:true});
					hero.buffs[i] = null;
				}
			}
		}
		game.state.checkGameState();
	}
	
	function applyBuff (hero, buff)
	{
		var heroBuff;
		buff.target = hero;
		if (hero.buffs.length > 0)
		{
			for (i in hero.buffs)
			{
				if (hero.buffs[i] && hero.buffs[i].hasOwnProperty && hero.buffs[i].getName() == buff.name)
				{
					hero.buffs[i].dispel({offensive:true,friendly:true,override:true});
					hero.buffs[i] = null;
				}
			}
		}
		heroBuff = new Buff(buff);
		heroBuff.applyEffect();
		hero.buffs.push(heroBuff);
		updateStats(hero);
	}
	
	function areHeroesDead ()
	{
		for (hero in heroes)
		{
			if (heroes[hero].alive)
			{
				return false;
			}
		}
		return true;
	}
	
	function isHeroAlive (hero)
	{
		return hero.alive;
	}
	
	function clearDamageInterval ()
	{
		clearInterval(heroes.damageInterval);
	}
	
	function getNumberOfHeroes ()
	{
		return heroes.length;
	}
	
	function getRandomHero ()
	{
		var heroToDamage
		do
		{
			heroToDamage = game.util.getRandomInt (0, getNumberOfHeroes());
		}
		while (!isHeroAlive(heroes[heroToDamage]));
		return heroes[heroToDamage];
	}
	
	function getHeroDamage (hero)
	{
		return hero.damage;
	}
	
	function getTotalHeroDamage ()
	{
		var damage = 0;
		
		for (var i = 0;i<getNumberOfHeroes();i++)
		{
			damage+=getHeroDamage(heroes[i]);
		}
		
		return damage;
	}
	
	function updateHealthbar (hero)
	{
		hero.healthbar.style.width = parseInt((hero.health/hero.maxHealth)*100) + "%";
	}
	
	function updateShieldBar (hero)
	{
		if (!isHeroAlive (hero))
		{
			hero.tempStats["currentShield"] = 0;
		}
		if (hero.tempStats["currentShield"])
		{
			hero.shieldBar.style.width = parseInt((hero.tempStats["currentShield"]/hero.tempStats["maxShield"])*100) + "%";
		}
		else
		{
			hero.shieldBar.style.width = "0%";
		}
	}
	
	function updateStats (hero)
	{
		hero.tempStats = [];
		if (hero.buffs.length > 0)
		{
			for (i in hero.buffs)
			{
				var buff = hero.buffs[i];
				if (buff && buff.hasOwnProperty)
				{
					if (buff.isDispelled())
					{
						hero.buffs[i] = null;
						continue;
					}
					var types = buff.getTypes();
					if (types)
					{
						for (j in types)
						{
							var type = types[j];
							switch (type)
							{
								case game.buff.buffTypes.BUFF_TYPE_SHIELD:
									if (hero.tempStats["currentShield"])
									{
										hero.tempStats["currentShield"] += buff.statBonuses["currentShield"];
										hero.tempStats["maxShield"] += buff.statBonuses["maxShield"];
									}
									else
									{
										hero.tempStats["currentShield"] = buff.statBonuses["currentShield"];
										hero.tempStats["maxShield"] = buff.statBonuses["maxShield"];
									}
								default:
							}
						}
					}
				}
			}
		}
		updateHealthbar (hero);
		updateShieldBar(hero);
	}
	
	game.heroes.init = init;
	game.heroes.cleanup = cleanup;
	game.heroes.areHeroesDead = areHeroesDead;
	game.heroes.isHeroAlive = isHeroAlive;
	game.heroes.clearDamageInterval = clearDamageInterval;
	game.heroes.getNumberOfHeroes = getNumberOfHeroes;
	game.heroes.getHeroDamage = getHeroDamage;
	game.heroes.getTotalHeroDamage = getTotalHeroDamage;
	game.heroes.damageHero = damageHero;
	game.heroes.healHero = healHero;
	game.heroes.applyBuff = applyBuff;
	game.heroes.updateStats = updateStats;
	game.heroes.getRandomHero = getRandomHero;
	
	return game;
})(game||{});