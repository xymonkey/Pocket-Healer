/* Manages hero states as well as hero DOM elements, such as healthbars. Currently the focus is on the group of heroes rather than the individual, 
   but as hero functionality becomes more complex we should consider creating a seperate hero module/constructor.*/
   
game = (function(game){
	//Sprite types.
	var WARRIOR_SPRITE = 0,
		ARCHER_SPRITE = 1,
		NECROMANCER_SPRITE = 2,
		WIZARD_SPRITE = 3,
		ASSASSIN_SPRITE = 4;
		
	//Role types.
	var DPS_ROLE = 0,
		TANK_ROLE = 1,
		HEALER_ROLE = 2;
	
	game.heroes = game.heroes || {};
	game.heroes.roles = game.heroes.roles || {};
	game.heroes.sprites = game.heroes.sprites || {};
	var heroes = [],
		heroWithThreat;
	
	function init (bossType)
	{
		var spriteName;
		//Because arrays with references in other objects are not cleared when using "array = []", we manually set length to 0 to reset the array after starting a new game.
		heroes.length = 0;
		cleanup();
		if (!bossType)
		{
			bossName = game.boss.getBossType();
		}
		
		switch (bossType)
		{
			case game.boss.bossTypes.WARWYLF_BOSS:
				for (var i = 0; i < 5; i++)
				{
					createHero ();
				}
				break;
			case game.boss.bossTypes.FENRIQUE_BOSS:
				assignThreat ( createHero ({role:TANK_ROLE, sprite:WARRIOR_SPRITE}) );
				createHero ({role:DPS_ROLE, sprite:ASSASSIN_SPRITE});
				createHero ({role:DPS_ROLE, sprite:NECROMANCER_SPRITE});
				createHero ({role:DPS_ROLE, sprite:WIZARD_SPRITE});
				createHero ({role:DPS_ROLE, sprite:ARCHER_SPRITE});
				break;
			default:
				for (var i = 0; i < 5; i++)
				{
					createHero ();
				}
				break;
		}
		heroes.damageInterval=setInterval(function(){game.boss.damageBoss();},3000);
	}
	
	function createHero (heroProperties)
	{
		var heroNumber = heroes.length+1;
		if (!heroProperties)
		{
			heroProperties = {};
		}
		
		if (!heroProperties.role  && typeof(heroProperties.role)=="undefined")
		{
			heroProperties.role = DPS_ROLE;
		}
		
		if (!heroProperties.sprite  && typeof(heroProperties.sprite)=="undefined")
		{
			heroProperties.sprite = ASSASSIN_SPRITE;
		}
		
		//Create hero div.
		var currentHero = document.createElement("span");
		currentHero.id = "hero" + (heroNumber);
		currentHero.className = "hero";
		
		//Create hero label.
		var label = document.createElement ("div");
		label.id = "hero" + (heroNumber) + "-label";
		label.className = "hero-label";
		
		//Create hero healthbar.
		var healthbar = document.createElement ("div");
		healthbar.id = "hero" + (heroNumber) + "hb";
		healthbar.className = "healthbar";
		
		var currentHealth = document.createElement("span");
		currentHealth.id = "hero" + (heroNumber) + "hc";
		currentHealth.className = "healthcurrent";
		
		var shieldBar = document.createElement("span");
		shieldBar.id = "hero" + (heroNumber) + "shield";
		shieldBar.className = "shield";
		
		//Create hero sprite based on hero number.
		var heroSprite = document.createElement("div");
		heroSprite.id = "hero" + (heroNumber) + "sprite";
		
		//Configure hero variables and associate with DOM elements.
		currentHero.sprite = heroProperties.sprite;
		currentHero.role = heroProperties.role;
		
		switch (currentHero.sprite)
		{
			case WARRIOR_SPRITE:spriteName = "sprite-warrior";break;
			case ARCHER_SPRITE:spriteName = "sprite-archer";break;
			case NECROMANCER_SPRITE:spriteName = "sprite-necro";break;
			case WIZARD_SPRITE:spriteName = "sprite-wizard";break;
			case ASSASSIN_SPRITE:spriteName = "sprite-assassin";break;
			default:;
		}
		
		heroSprite.className = spriteName;
		
		switch (currentHero.role)
		{
			case DPS_ROLE:
				currentHero.health=100;
				currentHero.maxHealth=100;
				currentHero.damage = 2;
				currentHero.defense = 1;
				break;
			case TANK_ROLE:
				currentHero.health=200;
				currentHero.maxHealth=200;
				currentHero.damage = 1;
				currentHero.defense = 2;
				break;
			case HEALER_ROLE:
				currentHero.health=100;
				currentHero.maxHealth=100;
				currentHero.damage = 0;
				currentHero.defense = 1;
				break;
			default:
				currentHero.health=100;
				currentHero.maxHealth=100;
				currentHero.damage = 2;
				currentHero.defense = 1;
				break;
		}

		currentHero.healthbar=currentHealth;
		currentHero.shieldBar = shieldBar;
		
		currentHero.alive = true;
		currentHero.buffs = [];
		currentHero.tempStats = [];
		
		//Add to DOM and push to array.
		healthbar.appendChild(shieldBar);
		healthbar.appendChild(currentHealth);
		currentHero.appendChild(label);
		currentHero.appendChild(healthbar);
		currentHero.appendChild(heroSprite);
		
		document.getElementById("heroes").appendChild(currentHero);
		
		heroes.push(currentHero);
		updateHealthbar(currentHero);
		return currentHero;
	}

	
	//Clean up hero related DOM elements when restarting.
	function cleanup ()
	{
		var heroes = document.getElementById("heroes");
		while (heroes.firstChild) {
			heroes.removeChild(heroes.firstChild);
		}
	}
	
	function assignThreat (hero)
	{
		heroWithThreat = hero;
	}
	
	function getHeroWithThreat()
	{
		return heroWithThreat;
	}
	
	function damageHero (hero, damage)
	{
		if (!hero.alive && game.state.isInProgress())
		{
			return;
		}
		damage = damage/hero.defense;
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
		if (hero == heroWithThreat && !game.heroes.areHeroesDead())
		{
			assignThreat(getRandomHero([{role:TANK_ROLE}, {role:DPS_ROLE}]));
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
	
	//Gets a random hero based on a passed array of roles (any role can be chosen if no role is passed). Priority for chosen character will be adjusted according to the order the roles are passed (i.e., tank will take priority if passed first).
	function getRandomHero (targetRoles)
	{
		var heroToDamage, heroesByRole = [];
		
		if (targetRoles)
		{
			for (i in targetRoles)
			{
				for (j in heroes)
				{
					if (heroes[j].alive && heroes[j].role == targetRoles[i])
					{
						heroesByRole.push(heroes[j]);
					}
				}
				if (heroesByRole.length > 0)
				{
					heroToDamage = game.util.getRandomInt (0, heroesByRole.length);
					return heroesByRole[heroToDamage];
				}
			}
		}
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
	game.heroes.sprites.WARRIOR_SPRITE = WARRIOR_SPRITE,
		game.heroes.sprites.ARCHER_SPRITE = ARCHER_SPRITE,
		game.heroes.sprites.NECROMANCER_SPRITE = NECROMANCER_SPRITE,
		game.heroes.sprites.WIZARD_SPRITE = WIZARD_SPRITE,
		game.heroes.sprites.ASSASSIN_SPRITE = ASSASSIN_SPRITE;
		
	//Role types.
	game.heroes.roles.DPS_ROLE = DPS_ROLE,
		game.heroes.roles.TANK_ROLE = TANK_ROLE,
		game.heroes.roles.HEALER_ROLE = HEALER_ROLE;
	
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
	game.heroes.getHeroWithThreat = getHeroWithThreat;
	game.heroes.assignThreat = assignThreat;
	
	return game;
})(game||{});