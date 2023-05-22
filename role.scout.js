var scout = {
    run: function(creep) {

		// Defining memory elements for the creep to move around
		if(creep.memory.currentRoom == undefined)				{creep.memory.currentRoom = creep.room.name;}
		if(creep.memory.previousRoom == undefined)				{creep.memory.previousRoom = creep.room.name;}
		if(creep.memory.targetRoomDirection == undefined)		{creep.memory.targetRoomDirection = "undefined"}
		if(creep.memory.targetLocalExit == undefined)			{creep.memory.targetLocalExit = "undefined";}

		// Defining memory elements for the room where the creep is. Scout will just store information and never process it.
		// Energy sources
		if(creep.room.memory.sources == undefined)				{creep.room.memory.sources = [];}
		if(creep.room.memory.sourcesPos == undefined)			{creep.room.memory.sourcesPos = [];}
		if(creep.room.memory.sourcesMax == undefined)			{creep.room.memory.sourcesMax = [];}
		// Controller
		if(creep.room.memory.controller == undefined)			{creep.room.memory.controller = "undefined";}
		if(creep.room.memory.controllerPos == undefined)		{creep.room.memory.controllerPos = "undefined";}
		if(creep.room.memory.roomOwner == undefined)			{creep.room.memory.roomOwner = "undefined"}
		if(creep.room.memory.roomOwnerReservation == undefined)	{creep.room.memory.roomOwnerReservation = "undefined"}
		// Power
		if(creep.room.memory.powerSources == undefined)			{creep.room.memory.powerSources = [];}
		if(creep.room.memory.powerSourcesPos == undefined)		{creep.room.memory.powerSourcesPos = [];}
		if(creep.room.memory.powerSourcesMax == undefined)		{creep.room.memory.powerSourcesMax = [];}
		if(creep.room.memory.powerSourcesHits == undefined)		{creep.room.memory.powerSourcesHits = [];}
		if(creep.room.memory.powerSourcesHitsMax == undefined)	{creep.room.memory.powerSourcesHitsMax = [];}
		if(creep.room.memory.powerSourcesTime == undefined)		{creep.room.memory.powerSourcesTime = [];}
		if(creep.room.memory.powerSourcesDiscoveryTime == undefined) {creep.room.memory.powerSourcesDiscoveryTime = [];}
		if(creep.room.memory.powerSourceFreeSpots == undefined)	{creep.room.memory.powerSourceFreeSpots = [];}
		// Global
		if(creep.room.memory.recentUpdate == undefined)			{creep.room.memory.recentUpdate = false;}

		
		// Global
		if(creep.room.memory.noEnergyInterest == undefined)		{creep.room.memory.noEnergyInterest = true}
				// TRICKY THAT ! If there is no controller, then we don't have an interest in LDHarvesting the room.
				// This rules out the corridor rooms, which have neither controller nor source
				// It also rules out central rools, which have multiple powerful sources, but no controller, and as sources are defended we currently don't know how to manage it
				// So it conviniently rules out certain rooms with a biaised but useful and simple indicator

		// We could add here a limitation for memory storing depending on distance, if memory gets short


		// If the creep current room in memory is not the same as the actual room
		// Meaning we just reached a new room
		if(creep.memory.currentRoom != creep.room.name) {
			// --------- STORE INFORMATION ------------------
			
			// Storing sources information
			var sourcesOfRoom = creep.room.find(FIND_SOURCES);
			if(sourcesOfRoom.length > 0) {
				for(let currentSourceIndex= 0; currentSourceIndex<sourcesOfRoom.length; currentSourceIndex++) {
					creep.room.memory.sources.push(sourcesOfRoom[currentSourceIndex].id);
					creep.room.memory.sourcesMax.push(sourcesOfRoom[currentSourceIndex].energyCapacity);
					creep.room.memory.sourcesPos.push(sourcesOfRoom[currentSourceIndex].pos);
				}
			}

			// Storing controller information: ID, position, owner
			if(creep.room.controller) {
				creep.room.memory.controller = creep.room.controller.id;
				creep.room.memory.controllerPos = creep.room.controller.pos;
				
				// Storing room owner name and reservation
				if(creep.room.memory.roomOwner != creep.room.controller.owner) 								{creep.room.memory.roomOwner = creep.room.controller.owner;}
				if(creep.room.memory.roomOwnerReservation != creep.room.controller.reservation.username)	{creep.room.memory.roomOwnerReservation = creep.room.controller.reservation.username;}
			}
			
			// Power sources
			// We find the power sources
			var powerSourcesOfRoom = creep.room.find(FIND_STRUCTURES, {filter: function(object) {return object.structureType == STRUCTURE_POWER_BANK}});

			// If there is some
			if(powerSourcesOfRoom.length > 0) {
				// We store all their information in the memory
				for(let currentPowerSourceIndex = 0; currentPowerSourceIndex < powerSourcesOfRoom.length; currentPowerSourceIndex++) {
					creep.room.memory.powerSources.push(powerSourcesOfRoom[currentPowerSourceIndex].id);
					creep.room.memory.powerSourcesPos.push(powerSourcesOfRoom[currentPowerSourceIndex].pos);
					creep.room.memory.powerSourcesMax.push(powerSourcesOfRoom[currentPowerSourceIndex].power);
					creep.room.memory.powerSourcesHits.push(powerSourcesOfRoom[currentPowerSourceIndex].hits);
					creep.room.memory.powerSourcesHitsMax.push(powerSourcesOfRoom[currentPowerSourceIndex].hitsMax);
					creep.room.memory.powerSourcesTime.push(powerSourcesOfRoom[currentPowerSourceIndex].ticksToDecay);
					creep.room.memory.powerSourcesDiscoveryTime.push(Game.time);
					
					// Here we look around the power bank to see how much free spots there are.
					// 1 is too less for us to harvest it.
					var counter = 0;
					for(var a = -1; a<=1; a++) {
						for(var b = -1; b<=1; b++) {
							let terrainToBeAssessed = Game.map.getTerrainAt(powerSourcesOfRoom[currentPowerSourceIndex].pos.x + a, powerSourcesOfRoom[currentPowerSourceIndex].pos.y + b, creep.room.name);
							if (terrainToBeAssessed == 'plain' || terrainToBeAssessed == 'swamp') {
								counter ++;
							}
						}
					}
					creep.room.memory.powerSourceFreeSpots.push(counter);
				}
			}

			// We register that the information has been updated by the creep.
			// This will be set again to false once the information is processed in another module.
			creep.room.memory.recentUpdate = true;

			// --------- FIND EXIT ------------------		
			// We define the possibilities, checking which exit exist
			let possibilities = [];
			if(creep.room.find(FIND_EXIT_TOP).length > 0)		{possibilities.push(FIND_EXIT_TOP);}
			if(creep.room.find(FIND_EXIT_RIGHT).length > 0)		{possibilities.push(FIND_EXIT_RIGHT);}
			if(creep.room.find(FIND_EXIT_BOTTOM).length > 0)	{possibilities.push(FIND_EXIT_BOTTOM);}
			if(creep.room.find(FIND_EXIT_LEFT).length > 0)		{possibilities.push(FIND_EXIT_LEFT);}

			// And we take one at random, store it in the memory, and make the room we're in the current room.
			let randomResult = Math.floor(Math.random() * possibilities.length);
			creep.memory.targetRoomDirection = possibilities[randomResult];
			creep.memory.targetLocalExit = creep.pos.findClosestByRange(creep.memory.targetRoomDirection);

			// --------- CREEP MEMORY UPDATE ------------------
			// Finally, now that it has been used, we can update the "previous room" in creep memory with current room 
			creep.memory.previousRoom = creep.memory.currentRoom;

			// And updating as well the current room.
			creep.memory.currentRoom = creep.room.name;
		}

        // Then, in all cases, moving the creep
        // If there is a controller, we will sign it
        if(creep.room.controller != undefined) {
			if(creep.room.controller.sign != undefined) {
				// That I did not sign 
				if(creep.room.controller.sign.username != "Blaugaard") {
					// Then we sign it =)
					if(creep.signController(creep.room.controller, "Join #overlords alliance, find us on Slack! Also, fuck Quorum's auto-signing room bot.") == ERR_NOT_IN_RANGE) {
						creep.moveTo(creep.room.controller);
						creep.say('Going to sign controller');
					}
				}
				else {
					if(creep.moveTo(creep.memory.targetLocalExit) == ERR_INVALID_TARGET) {
						creep.moveTo(creep.pos.findClosestByRange(creep.memory.targetRoomDirection));
						creep.say('Going to next room:' + creep.memory.targetRoomDirection);
					}
				}	
			}
			// Or if it's not signed already
			else if(creep.room.controller.sign == undefined) {
				// Then we sign it =)
				if(creep.signController(creep.room.controller, "Join #overlords alliance, find us on Slack! Also, fuck Quorum's auto-signing room bot.") == ERR_NOT_IN_RANGE) {
					creep.moveTo(creep.room.controller);
					creep.say('Going to sign controller');
				}
				else {
					if(creep.moveTo(creep.memory.targetLocalExit) == ERR_INVALID_TARGET) {
						creep.moveTo(creep.pos.findClosestByRange(creep.memory.targetRoomDirection));
						creep.say('Going to next room:' + creep.memory.targetRoomDirection);
					}
				}
			}
			// If it is already signed, we move towards the exit.
            else {
                if(creep.moveTo(creep.memory.targetLocalExit) == ERR_INVALID_TARGET) {
					creep.moveTo(creep.pos.findClosestByRange(creep.memory.targetRoomDirection));
					creep.say('Going to next room:' + creep.memory.targetRoomDirection);
				}
            }
        }
        // Same if there's no controller, we move towards the exit.
        else {
		    if(creep.moveTo(creep.memory.targetLocalExit) == ERR_INVALID_TARGET) {
				creep.moveTo(creep.pos.findClosestByRange(creep.memory.targetRoomDirection));
				creep.say('Going to next room:' + creep.memory.targetRoomDirection);
			}
        }

    }
};

module.exports = scout;