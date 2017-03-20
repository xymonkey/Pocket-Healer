//Constructor for buff class. Used for duration effects on characters.
game.buff = {};
game.buff.buffTypes = {};
game.buff.buffTypes.BUFF_TYPE_SHIELD = 0;

/* As with skills, we are assuming that the constructor takes in a buff object as a template since buffs require precise definitions.*/
function Buff (buff)
{	// Negative buffs are called debuffs and are treated slightly differently than friendly buffs.
	var debuff = buff.isDebuff || false,
	
		//Determines if the buff can be removed under normal circumstances.
		dispelable = buff.dispelable || false,
		
		duration = buff.duration || 0,
		
		// Not sure if actual healing should be applied through effect or if it deserves its own special property. Leaning towards making buffs more generic with
		// most of the heavy lifting in the effect.
		//healMagnitude = buff.healMagnitude || 0,

		//Function called when applying a periodic buff effect such as a heal over time.
		effect = buff.effect || null,
		
		//Rate at which to apply a periodic effect.
		effectTick = buff.effectTick || 0,
		
		target = buff.target || null,
		
		//The DOM element attached to a target's healthbar that corresponds to this buff.
		buffElement = null,
		
		icon = buff.icon || null,
		name = buff.name || "",
		types = buff.types || null,
		dispelled = false,
		effectInterval = null,
		effectTimeout = null;
		
	//To make things simpler for now, just exposing this for the hero to modify at will. This should be made more secure in the future.
	this.statBonuses = buff.statBonuses || null;
	
	/*Used to apply periodic effects for buffs that have a duration and "tick" effect. Once the buff's duration is up, it dispels itself using the dispel override (see dispel function). 
	  Also adds a DOM element corresponding to the buff to the target's healthbar.*/
	this.applyEffect = function ()
	{
		var self = this;
		if (effectTick > 0)
		{
			effectInterval = setInterval (function(){effect.call(self);}, effectTick);
		}
		
		effectTimeout = setTimeout(function(){clearInterval(effectInterval);self.dispel({override:true,offensive:true,friendly:true});}, duration);

		buffElement = document.createElement ("span");
		buffElement.className = "buff";
		buffElement.style.backgroundImage = icon;
		if (target.healthbar)
		{
			target.healthbar.appendChild (buffElement);
		}
		else
		{
			target.appendChild (buffElement);
		}
	}
	
	/*Removes a buff from a target. This is also used to clean up once a buff's duration is up.
	  If called using the override argument, the spell will be dispelled regardless of whether the buff would normally be dispellable under the circumstances. 
	  Mainly used for removing buffs when their duration is up.*/
	this.dispel = function (dispelType)
	{
		if (dispelable || dispelType.override)
		{
			//This was reversed initially, but the current logic seems to make more sense. Friendly dispels should remove debuffs and offensive dispels should remove buffs.
			if ((dispelType.offensive && !debuff) || (dispelType.friendly && debuff))
			{
				clearInterval (effectInterval);
				clearTimeout (effectTimeout);
				effectInterval = null;
				effectTimeout = null;
				if (buffElement.parentNode)
				{
					buffElement.parentNode.removeChild(buffElement);
				}
				buffElement = null;
				dispelled = true;
				//This is extremely naive and should be updated to make sure we're affecting the correct target type.
				game.heroes.updateStats(target);
			}
		}
	}
	
	this.getTarget = function ()
	{
		return target;
	}
	
	this.getName = function ()
	{
		return name;
	}
	
	this.getTypes = function ()
	{
		return types;
	}
	this.isDispelled = function ()
	{
		return dispelled;
	}
	
	this.isDebuff = function ()
	{
		return debuff;
	}
}