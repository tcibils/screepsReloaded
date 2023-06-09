// First we restrict the perimeter of distant rooms we want to assess
// Then we define the perimeter of potential home rooms
// And we try not to assess potential home rooms if it's not useful - sources in distant room do not change place


// Objective : for each source in memory, wether in my room or not, and process the information to define needs for harvesters, or fatHarvester system, or link system.
// Then each room should have a script to fill the needs I believe


var processLDEnergyInfo = {
    run: function() {

		let startCPUused = Game.cpu.getUsed();

		// What we need here is a few triggers to know when the algo needs to be run again
		// As checking distances for far away sources is costly in CPU
		
		// We re-check that each source has optimal attachement every intervalForUpdate ticks
		// This is a very costly thing, so we really want to do it rarely enough
		let intervalForUpdate = 1000;
		let myRooms = _.filter(Game.rooms, (currentRoom) => currentRoom.controller != undefined && currentRoom.controller.my);
		// This shit is gonna be extremly costly in CPU
		// PathFinder.search is very costly

		// Filter with Game.map.getRoomLinearDistance ?

		// For every room in memory
		for(var roomInMemory in Memory.rooms) {
			// If there are memorized sources
			if(Memory.rooms[roomInMemory].sources != undefined) {
				if(Memory.rooms[roomInMemory].sources.length > 0) {
					// For each of these sources
					for(let sourceIndex = 0; sourceIndex < Memory.rooms[roomInMemory].sources.length; sourceIndex++) {
						// If there has been no update since intervalForUpdate ticks, or if there has been an update, or if it's never been done
						if(Game.time - Memory.rooms[roomInMemory].sourcesHomeAttachedLastTime > intervalForUpdate || creep.room.memory.sourceUpdate || Memory.rooms[roomInMemory].sourcesHomeAttachedLastTime == 'undefined') {

							// Now we have a source in a room in memory that has not been updated since a long time, or had an update, or never
							// For that source, we need to attach a home room for exploitation
							// We will do that by checking the closest spawn

							for(let myRoomIndex = 0; myRoomIndex < myRooms.length; myRoomIndex++) {
								// We only check with close enough rooms
								if(Game.map.getRoomLinearDistance(roomInMemory,myRooms[myRoomIndex].name) <= 3) {
									
									// Quick win: just take any one. At the start I'll only have one room anyway.
									// Should have been : Find the closest spawn from all these rooms, attach it as home spawn
									Memory.rooms[roomInMemory].sourcesHomeRoom = myRooms[myRoomIndex].name;

								}
							}

							// And finally, we update the last source update
							Memory.rooms[roomInMemory].sourcesHomeAttachedLastTime = Game.time;
						}
					}

					
				}
			}
		}

		let totalCPUused = startCPUused - Game.cpu.getUsed();
		console.log("We used " + totalCPUused + " of CPU to attach home rooms to spawns.")
    }
}



module.exports = processLDEnergyInfo;




		/*
		let distancePerCreepUnit = 40;
		
		// Arbitrary number of max distance
		let maxSourceToLinkDistance = 80;
		
		// variable array with my rooms names, for comparaison later
		let myRooms = _.filter(Game.rooms, (currentRoom) => currentRoom.controller != undefined && currentRoom.controller.my);

		// variable array with my rooms names HAVING A STORAGE
		let myRoomsWithSenderLink = _.filter(Game.rooms, (currentRoom) => currentRoom.controller != undefined && currentRoom.controller.my && currentRoom.memory.senderLinks.length > 0);
		
					
		// Starting now :
		// For each of rooms having a memory
		for(var roomInMemory in Memory.rooms) {
			
			// We also check if the room is occupied, reserved, or an exception
			let distantRoomOccupied = false;
			let distantRoomReserved = false;
			let distantRoomDiplomacy = false;
			let distantRoomNoSources = false;
			let distantRoomNoInterest = false;
			
			// We check if the room has ownership
			if(Memory.rooms[roomInMemory].roomOwner != undefined) {distantRoomOccupied = true;}

			// We check if there's a reservation saved
			if(Memory.rooms[roomInMemory].roomOwnerReservation != undefined) {if(Memory.rooms[roomInMemory].roomOwnerReservation != 'Blaugaard') {distantRoomReserved = true;}}
			if(Memory.rooms[roomInMemory].sources != undefined) 			 {if(Memory.rooms[roomInMemory].sources.length == 0) {distantRoomNoSources = true;}}
			if(Memory.rooms[roomInMemory].noEnergyInterest == true) {distantRoomNoInterest = true;}
			
			// If anything is not defined yet, we define it, by security.
			if(Memory.rooms[roomInMemory].sourcesHomeRooms == undefined) {Memory.rooms[roomInMemory].sourcesHomeRooms = [];}
			if(Memory.rooms[roomInMemory].sourcesHomeRoomsDistance == undefined) {Memory.rooms[roomInMemory].sourcesHomeRoomsDistance = [];}
			if(Memory.rooms[roomInMemory].sourcesWorkNeed == undefined) {Memory.rooms[roomInMemory].sourcesWorkNeed = [];}
			if(Memory.rooms[roomInMemory].sourcesCarryNeed == undefined) {Memory.rooms[roomInMemory].sourcesCarryNeed = [];}
			if(Memory.rooms[roomInMemory].sourcesSenderLink == undefined) {Memory.rooms[roomInMemory].sourcesSenderLink = [];}
			
			if(Memory.rooms[roomInMemory].sourcesHomeRoomsAlreadyTried == undefined) {
				// We also keep in memory the room we've already tried to link to the assessed room, in order to avoid multiple computations
				// This is gonna be an array of array with for a given source (which is a point in the first array) the list of rooms already tried
				Memory.rooms[roomInMemory].sourcesHomeRoomsAlreadyTried = [];
			}
			
			// For each source, we will store the number of sender links in each potential home room
			// So if new links get built or destroyed, we will re-assess the potential home room
			if(Memory.rooms[roomInMemory].sourcesHomeRoomsAlreadyTriedNumberSenders == undefined) {
				Memory.rooms[roomInMemory].sourcesHomeRoomsAlreadyTriedNumberSenders = [];
			}
			
			
			// if the room is mine, or meets on of the above criteria, we don't do stuff
			// if the room is not mine
			if(!roomIsMine && !distantRoomOccupied && !distantRoomReserved && !distantRoomDiplomacy && !distantRoomNoSources && !distantRoomNoInterest) {
				
				// Now, either we already have the home rooms, and we'll have to assess if it's the best
				if(Memory.rooms[roomInMemory].sourcesHomeRooms.length == Memory.rooms[roomInMemory].sources.length){
					
					// So, for each source in the room
					for(let sourceIndex = 0; sourceIndex < Memory.rooms[roomInMemory].sources.length; sourceIndex++) {
						
						
						// Maybe one of my rooms built a sender link that made it more competitive.
						let numberOfSenderLinksChanged = false;
						
						// We parse all potential home rooms
						for(let myRoomIndex = 0; myRoomIndex < myRoomsWithSenderLink.length; myRoomIndex++) {
							// And we parse room that we've already tried to link
							// QUESTION HERE - Why not do that with all my rooms ?
							// We should have an arrow of rooms we tried to link for each source, thus having same length
							if(Memory.rooms[roomInMemory].sourcesHomeRoomsAlreadyTriedNumberSenders.length == Memory.rooms[roomInMemory].sources.length) {
								for(let myRoomAlreadyTriedIndex = 0; myRoomAlreadyTriedIndex < Memory.rooms[roomInMemory].sourcesHomeRoomsAlreadyTriedNumberSenders[sourceIndex].length; myRoomAlreadyTriedIndex++) {
									// If we found the potential room we're parsing
									if(myRoomsWithSenderLink[myRoomIndex].name == Memory.rooms[roomInMemory].sourcesHomeRoomsAlreadyTried[sourceIndex][myRoomAlreadyTriedIndex]) {
										// If its number of sender links changed
										if(myRoomsWithSenderLink[myRoomIndex].memory.senderLinks.length != Memory.rooms[roomInMemory].sourcesHomeRoomsAlreadyTriedNumberSenders[sourceIndex][myRoomAlreadyTriedIndex]) {
											// Then this fucking number of sender links for this potential home room changed. Wasn't easy.
											numberOfSenderLinksChanged = true;
										}
									}
								}
							}
						}
						

						// We also want to check it a new room has been built since we assessed the best home room
						// In which case we want to include it in our check
						let newRoomBuilt = false;
						if(Memory.rooms[roomInMemory].sourcesHomeRoomsAlreadyTried[sourceIndex].length < myRoomsWithSenderLink.length) {
							newRoomBuilt = true;
						}
						
						// IMPROVEMENT HERE : Obviously new rooms won't have sender links. So the only point would be to add them to the alreadyTried list...?
						
						
						// If the link got destroyed, we'll need to fine a potential new home room.
						let senderLinkDestroyed = false;
						
						if(Game.getObjectById(Memory.rooms[roomInMemory].sourcesSenderLink[sourceIndex]) == undefined && Memory.rooms[roomInMemory].sourcesSenderLink[sourceIndex] != 0) {
							senderLinkDestroyed = true;
						}
						
						// Something changed for this source in this distant room !
						// We need to update the home room of this source.
						if(senderLinkDestroyed || numberOfSenderLinksChanged || newRoomBuilt) {
							// we find the room with the closest sender link to the said source (rather than storage)
							let closestRoomDistance = 10000;
							let closestRoom = null;
							let closestSenderLinkId = null;
							
							// Gonna be an array of potential home rooms tested
							let testedRooms = [];
							// Gonna be an array containing number of sender links in each potential home room
							let testedRoomsNumberSenders = [];
							
							// Second position : the position of the source, retrieved from memory - we need to re-create it
							let sourcePosition = new RoomPosition(Memory.rooms[roomInMemory].sourcesPos[sourceIndex].x, Memory.rooms[roomInMemory].sourcesPos[sourceIndex].y, Memory.rooms[roomInMemory].sourcesPos[sourceIndex].roomName);

							// For each of my room having sender links
							for(let myRoomIndex = 0; myRoomIndex < myRoomsWithSenderLink.length; myRoomIndex++) {
								// We check the closeness of each source with each sender link
								for(let senderLinkIndex = 0; senderLinkIndex < myRoomsWithSenderLink[myRoomIndex].memory.senderLinks.length; senderLinkIndex++) {
									// First position : the sender link assessed
									let senderLinkPosition = Game.getObjectById(myRoomsWithSenderLink[myRoomIndex].memory.senderLinks[senderLinkIndex]).pos;
									
									// We find the ideal path between the two
									// HIGHLY EXPENSIVE AND INSIDE MULTIPLE LOOPS - Crashes the CPU easily...
									let idealPath = PathFinder.search(senderLinkPosition, {pos: sourcePosition, range: 1});
									
									let currentDistance = 10000;
									if(idealPath != undefined) {
										if(!idealPath.incomplete) {
											// Check if path is not empty
											currentDistance = idealPath.path.length;
										}
									}
									
									if(currentDistance < closestRoomDistance) {
										closestRoomDistance = currentDistance;
										closestRoom = myRoomsWithSenderLink[myRoomIndex].name;
										closestSenderLinkId = myRoomsWithSenderLink[myRoomIndex].memory.senderLinks[senderLinkIndex];
									}
								}
								// Now that we parsed all links of a potential room, we add the home room in the list of tested rooms
								testedRooms.push(myRoomsWithSenderLink[myRoomIndex].name);
								// We also store the number of sender links
								testedRoomsNumberSenders.push(myRoomsWithSenderLink[myRoomIndex].memory.senderLinks.length);
							}
							
							
							// And now that we've tested all potential rooms, we add the array of room tested in the memory of the room, under the correct source index
							Memory.rooms[roomInMemory].sourcesHomeRoomsAlreadyTried[sourceIndex] = testedRooms;
							
							// We also store the correspondant number of sender links
							Memory.rooms[roomInMemory].sourcesHomeRoomsAlreadyTriedNumberSenders[sourceIndex] = testedRoomsNumberSenders;
								
							// We already add the distance to the room memory 
							Memory.rooms[roomInMemory].sourcesHomeRoomsDistance[sourceIndex] = closestRoomDistance;
							
							// We check if the room isn't too far - arbitrary parameter here
							if(closestRoomDistance < maxSourceToLinkDistance) {
								// we define it as the home room of the source
								Memory.rooms[roomInMemory].sourcesHomeRooms[sourceIndex] = closestRoom;
								
								// define the number of work parts needed, in function of size of source. Now only in number of creeps.
								Memory.rooms[roomInMemory].sourcesWorkNeed[sourceIndex] = 1;
							
								// Commented formula for number of working creeps parts :
								// time it takes to get refilled, divided by 2 because each work body part takes 2 per turn
								// let workPartsNeeded = (Math.ceil(Memory.rooms[roomInMemory].sources[sourceIndex].energyCapacity / 300) / 2);
								// Memory.rooms[roomInMemory].sourcesWorkNeed.push(workPartsNeeded);
								
								// Number of carrying creeps needed, assumed that they each carry 400 units of ressource
								// We want that by the time they go and come back, 400 units of ressources have been produced
								// typical LDFH have 3 work parts, thus produce 6 per turn
								// As LDFM move 1 tile per turn, we want one creep per 400/6 = 66 tiles of distance
								
								let carryNeeded = Math.ceil(closestRoomDistance / (distancePerCreepUnit));
								Memory.rooms[roomInMemory].sourcesCarryNeed[sourceIndex] = carryNeeded;
								Memory.rooms[roomInMemory].sourcesSenderLink[sourceIndex] = closestSenderLinkId;
							}
							// If the room is too distant, we cancel everything
							else {
								// Then LD harvesting will not have to take place.
								Memory.rooms[roomInMemory].sourcesHomeRooms[sourceIndex] = 'null';
								Memory.rooms[roomInMemory].sourcesWorkNeed[sourceIndex] = 0;
								Memory.rooms[roomInMemory].sourcesCarryNeed[sourceIndex] = 0;
								Memory.rooms[roomInMemory].sourcesSenderLink[sourceIndex] = 0;
							}
						}
					}
				}
				
				// Or we don't already have a home room, and we need to find one, and we iterate over everything
				else if (Memory.rooms[roomInMemory].sourcesHomeRooms.length == 0) {
					// So, for each source in the room
					for(let sourceIndex = 0; sourceIndex < Memory.rooms[roomInMemory].sources.length; sourceIndex++) {						
						
						// we find the room with the closest sender link to the said source (rather than storage)
						let closestRoomDistance = 10000;
						let closestRoom = null;
						let closestSenderLinkId = null;
						
						// Gonna be an array of potential home rooms tested
						let testedRooms = [];
						// Gonna be an array containing number of sender links in each potential home room
						let testedRoomsNumberSenders = [];
						
						// Second position : the position of the source, retrieved from memory - we need to re-create it
						let sourcePosition = new RoomPosition(Memory.rooms[roomInMemory].sourcesPos[sourceIndex].x, Memory.rooms[roomInMemory].sourcesPos[sourceIndex].y, Memory.rooms[roomInMemory].sourcesPos[sourceIndex].roomName);

						// For each of my room having sender links
						for(let myRoomIndex = 0; myRoomIndex < myRoomsWithSenderLink.length; myRoomIndex++) {
							// We check the closeness of each source with each sender link
							for(let senderLinkIndex = 0; senderLinkIndex < myRoomsWithSenderLink[myRoomIndex].memory.senderLinks.length; senderLinkIndex++) {
								// First position : the sender link assessed
								let senderLinkPosition = Game.getObjectById(myRoomsWithSenderLink[myRoomIndex].memory.senderLinks[senderLinkIndex]).pos;
								
								// We find the ideal path between the two
								// HIGHLY EXPENSIVE AND INSIDE MULTIPLE LOOPS - Crashes the CPU easily...
								let idealPath = PathFinder.search(senderLinkPosition, {pos: sourcePosition, range: 1}, {maxRooms: 3});
								
								let currentDistance = 10000;
								if(idealPath != undefined) {
									if(!idealPath.incomplete) {
										// Check if path is not empty
										currentDistance = idealPath.path.length;
									}
								}
								
								if(currentDistance < closestRoomDistance) {
									closestRoomDistance = currentDistance;
									closestRoom = myRoomsWithSenderLink[myRoomIndex].name;
									closestSenderLinkId = myRoomsWithSenderLink[myRoomIndex].memory.senderLinks[senderLinkIndex];
								}
							}
							// Now that we parsed all links of a potential room, we add the home room in the list of tested rooms
							testedRooms.push(myRoomsWithSenderLink[myRoomIndex].name);
							// We also store the number of sender links
							testedRoomsNumberSenders.push(myRoomsWithSenderLink[myRoomIndex].memory.senderLinks.length);
						}
						
						// And now that we've tested all potential rooms, we add the array of room tested in the memory of the room, under the correct source index
						Memory.rooms[roomInMemory].sourcesHomeRoomsAlreadyTried.push(testedRooms);
						
						// We also store the correspondant number of sender links
						Memory.rooms[roomInMemory].sourcesHomeRoomsAlreadyTriedNumberSenders.push(testedRoomsNumberSenders);
							
						// We already add the distance to the room memory 
						Memory.rooms[roomInMemory].sourcesHomeRoomsDistance.push(closestRoomDistance);
						
						// We check if the room isn't too far - arbitrary parameter here
						if(closestRoomDistance < maxSourceToLinkDistance) {
							// we define it as the home room of the source
							Memory.rooms[roomInMemory].sourcesHomeRooms.push(closestRoom);
							
							// define the number of work parts needed, in function of size of source. Now only in number of creeps.
							Memory.rooms[roomInMemory].sourcesWorkNeed.push(1);
						
							// Commented formula for number of working creeps parts :
							// time it takes to get refilled, divided by 2 because each work body part takes 2 per turn
							// let workPartsNeeded = (Math.ceil(Memory.rooms[roomInMemory].sources[sourceIndex].energyCapacity / 300) / 2);
							// Memory.rooms[roomInMemory].sourcesWorkNeed.push(workPartsNeeded);
							
							// Number of carrying creeps needed, assumed that they each carry 400 units of ressource
							// We want that by the time they go and come back, 400 units of ressources have been produced
							// typical LDFH have 3 work parts, thus produce 6 per turn
							// As LDFM move 1 tile per turn, we want one creep per 400/6 = 66 tiles of distance
							
							let carryNeeded = Math.ceil(closestRoomDistance / (distancePerCreepUnit));
							Memory.rooms[roomInMemory].sourcesCarryNeed.push(carryNeeded);
							Memory.rooms[roomInMemory].sourcesSenderLink.push(closestSenderLinkId);
						}
						// If the room is too distant, we cancel everything
						else {
							// Then LD harvesting will not have to take place.
							// We put one "empty" value in front of each source for consistency
							
							let numberOfSources = Memory.rooms[roomInMemory].sources.length;
							
							if(Memory.rooms[roomInMemory].sourcesHomeRooms.length < numberOfSources) {
								Memory.rooms[roomInMemory].sourcesHomeRooms.push('null');
							}
							if(Memory.rooms[roomInMemory].sourcesWorkNeed.length < numberOfSources) {
								Memory.rooms[roomInMemory].sourcesWorkNeed.push(0);
							}
							if(Memory.rooms[roomInMemory].sourcesCarryNeed.length < numberOfSources) {
								Memory.rooms[roomInMemory].sourcesCarryNeed.push(0);
							}
							if(Memory.rooms[roomInMemory].sourcesSenderLink.length < numberOfSources) {
								Memory.rooms[roomInMemory].sourcesSenderLink.push(0);
							}
						}
						
					}
				}
				
				else {
					console.log('ENERGY PROCESSING ISSUE. Distant room ' + roomInMemory + ' has ' + Memory.rooms[roomInMemory].sourcesHomeRooms + ' home rooms, but ' + Memory.rooms[roomInMemory].sources.length + ' sources. Length of home rooms should be 0 or equal to number of sources' )
				}
			}
			
			
			// if the room is mine, or meets on of the above criteria, we don't do stuff
			else {
				// Then LD harvesting will not have to take place.
				// We put one "empty" value in front of each source for consistency
				
				let numberOfSources = Memory.rooms[roomInMemory].sources.length;
				
				if(Memory.rooms[roomInMemory].sourcesHomeRooms.length < numberOfSources) {
					Memory.rooms[roomInMemory].sourcesHomeRooms.push('null');
				}
				if(Memory.rooms[roomInMemory].sourcesHomeRoomsAlreadyTried.length < numberOfSources) {
					Memory.rooms[roomInMemory].sourcesHomeRoomsAlreadyTried.push(0);
				}
				if(Memory.rooms[roomInMemory].sourcesHomeRoomsAlreadyTriedNumberSenders.length < numberOfSources) {
					Memory.rooms[roomInMemory].sourcesHomeRoomsAlreadyTriedNumberSenders.push(0);
				}
				if(Memory.rooms[roomInMemory].sourcesWorkNeed.length < numberOfSources) {
					Memory.rooms[roomInMemory].sourcesWorkNeed.push(0);
				}
				if(Memory.rooms[roomInMemory].sourcesCarryNeed.length < numberOfSources) {
					Memory.rooms[roomInMemory].sourcesCarryNeed.push(0);
				}
				if(Memory.rooms[roomInMemory].sourcesSenderLink.length < numberOfSources) {
					Memory.rooms[roomInMemory].sourcesSenderLink.push(0);
				}
			}
		
		}
		let resultCPUused = startCPUused - Game.cpu.getUsed();
		console.log("CPU used during room energy processing: " + resultCPUused);
		*/
