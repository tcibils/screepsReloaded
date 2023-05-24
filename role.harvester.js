var getDepositTarget = require('get.depositTarget');

// The harvester should not have to know what source harvesting it has been spawned for
// So the script deciding to spawn him should also assign him a source, which we will use here
// So we should look in memory for the ID of the source attached, and move back and forth to gather and deposit, I guess

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // Error if there's been an issue
        if(creep.memory.targetSourceID == undefined) {console.log("ISSUE : for creep " + creep.name + ", no source attached!")}
        else {
            // If creep is not filled with energy, it will go search for energy
            if(creep.carry.energy < creep.carryCapacity) {
                // If we are too far to harvest, we move forward
                // If we are close enough, the creep will mine.
                if(creep.harvest(Game.getObjectById(creep.memory.targetSourceID)) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.targetSourceID), {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
            // If the creep is filled, then move to best deposit
            else {
                // As per the function dedicated to find where the energy should be deposited
                getDepositTarget.run(creep);

                if(creep.transfer(Game.getObjectById(creep.memory.depositTarget), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.depositTarget), {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
    }
};



/* OLDIE BELOW

        // If we have no source attached in memory or if variable is not even defined
        if(creep.memory.isThereAFirstSourceAttached == undefined) {
            // Then we have none indeed.
            creep.memory.isThereAFirstSourceAttached = false;
            console.log("For creep " + creep.name + ", no source attached.");
        }

        if(creep.memory.attachedRoom == undefined) {
            creep.memory.attachedRoom = creep.room.name;
            console.log("For creep " + creep.name + ", attached room is now " + creep.memory.attachedRoom);
        }
        
        // If there is no source in memory
        if(creep.memory.isThereAFirstSourceAttached == false) {
            
            creep.say("For creep " + creep.name + ", we now search for a valid source.");
            // We will search in the memory to find relevant sources with no attached creep.
            
            // First we list all potential sources
            listOfPotentialSources = [];
            console.log("For creep " + creep.name + ", we have " + Memory.rooms[creep.memory.attachedRoom].sources.length + " sources in main room in memory.");
            
            // First the sources of the main room of the creep, as first priority
            for(let sourcesIterator = 0; sourcesIterator < Memory.rooms[creep.memory.attachedRoom].sources.length; sourcesIterator++) {
                listOfPotentialSources.push(Memory.rooms[creep.memory.attachedRoom].sources[sourcesIterator])
            }

            console.log("For creep " + creep.name + ", list of potential sources should have sources from the main room. Table: " + listOfPotentialSources);

            roomNorthName = roomNumbering.run(creep.memory.attachedRoom, 1, 0)
            roomSouthName = roomNumbering.run(creep.memory.attachedRoom, -1, 0)
            roomEastName = roomNumbering.run(creep.memory.attachedRoom, 0, 1)
            roomSouthName = roomNumbering.run(creep.memory.attachedRoom, 0, -1)

            // North
            for(let sourcesIterator = 0; sourcesIterator < Memory.rooms[roomNorthName].sources.length; sourcesIterator++) {
                listOfPotentialSources.push(Memory.rooms[roomNorthName].sources[sourcesIterator])
            }


            // TO CONTINUE : les autres coordonnées et récupérer les sources dispo
            // Attacher les places dispo en mémoire directement aux sources pour pas les recalculer et au cas où y a plusieurs rooms?


            // We simply find the closest source (naive)
            var potentialTarget = creep.pos.findClosestByPath(FIND_SOURCES);
            // If there is indeed one
            if(potentialTarget != null) {
                // We attach it as source
                creep.memory.attachedSource = potentialTarget.id;
                // And validate that we now have one
                creep.memory.isThereAFirstSourceAttached = true;
            }
        }
        
        // Now if we have a source attached
        if(creep.memory.isThereAFirstSourceAttached == true) {
            // If creep is not filled with energy, it will go search for energy
	        if(creep.carry.energy < creep.carryCapacity) {
	            // If the source attached has as much creeps as room, we continue to mine it (>= 0 bc we take this creep into account)
                if(freeSpotsOfSource.run(Game.getObjectById(creep.memory.attachedSource)) >= 0) { 
                    if(creep.harvest(Game.getObjectById(creep.memory.attachedSource)) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(Game.getObjectById(creep.memory.attachedSource), {visualizePathStyle: {stroke: '#ffaa00'}});
                    }
                }

                // If all spaces are taken for the source of the creep, we look for another one
	            else {
	                var creepHasFoundANewSource = false;
	                // If there is a source with some space, we attach it to the creep
                    var sources= creep.room.find(FIND_SOURCES);
    	            for(var i = 0; i<sources.length; i++) {
	                    if(freeSpotsOfSource.run(sources[i]) > 0) {
	                        creep.memory.attachedSource = sources[i].id;
	                        creepHasFoundANewSource = true;
	                        if(creep.harvest(sources[i]) == ERR_NOT_IN_RANGE) {
                                 creep.moveTo(sources[i], {visualizePathStyle: {stroke: '#00ff00'}});
                        }
	                    }
	                }
    	            // If there is none, then we change the role of the creeps
	                if(!creepHasFoundANewSource) {
	                    // creep.memory.role = 'builder';
	                }
	            }  
            }
        
            // Finally, if the creep is actually full, we get the energy back to the base
            else {
                // As per the function dedicated to find where the energy should be deposited
                getDepositTarget.run(creep);

                if(creep.transfer(Game.getObjectById(creep.memory.depositTarget), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.depositTarget), {visualizePathStyle: {stroke: '#ffffff'}});
                }
                
            }
	    }
    }
};
*/


module.exports = roleHarvester;