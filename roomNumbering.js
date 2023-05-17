// Adds north and east values to the roomName.
// Negatives to go south or west.
// CURRENTLY DOES NOT MANAGE THE CENTRAL CROSSING WITH 0,0 !

var myFunction = {
    
    run: function(roomName, northAddition, eastAddition) {
        // Splits the room name in a table.
        // Will output something like ",E,29,N,60", as a table I belive
        let splittedRoomName = roomName.split(/([N,E,S,W])/);
        
        let horizontalResult = parseInt(splittedRoomName[2]) + eastAddition;
        let verticalResult = parseInt(splittedRoomName[4]) + northAddition;
        
        let resultRoom = splittedRoomName[1] + horizontalResult + splittedRoomName[3] + verticalResult;
    
        return resultRoom;
    
    }
}
module.exports = myFunction;
