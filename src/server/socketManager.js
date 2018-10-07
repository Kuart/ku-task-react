const io = require('./server.js').io;
const {USER_CONNECTED, SEARCHING, FOUND, MESSAGE_SENT, MESSAGE_RECIEVED, BACK, UNBLOCKCHAT} = require('../Events');
const Game  = require('./game');

/* 1. all users create room in rooms( room name = user.socket.id ) 
   2. in UI user can found link (link = .../play/user.socket.id)
   3. if someone use user link, using user.socket.id in path to found room in rooms
   4. connect second user to found room (remove second user room), redirect to room host user, connect to chat and etc.
   5. start game
   6. if someone leave -> remove user from host room or remove user room from rooms
   7. clean old data
   8. user ready to new game
   9. also user can use Search Random Game Mode, in this mode room always = room who  start search earlier
   10. when user start SRGmode he pushed in search array and start waiting second player   */

let room = [],     
    rooms= [],     
    sockets = [],  //array for sockets
    search = [];   //array for random game search

module.exports = function(socket){
    console.log("Socket ID " + socket.id);
    //create user, create room, push room in rooms, send to react user info
    socket.on(USER_CONNECTED, (path)=>{
        sockets.push(socket);
        room = [socket.id];
        let newPath = path.replace('/play/','');                 //take path from browser and delete start part                                                            
        rooms = addRoom(rooms, room, socket);                    // create room in room, roomID = socket.id()
        io.emit(USER_CONNECTED);
        if( rooms[newPath] && rooms[newPath] != socket.id && rooms[newPath].length < 2 ){      //check in "rooms" room with same id like path 
            let player1 = searchSocket(newPath, sockets);        //using newPath(because path = socket.id first player) to find socket 
            
            search.splice(search.indexOf(socket), 1);            //if user was in search remove them from search
            search.splice(search.indexOf(player1), 1);

            rooms = removeRoom(rooms, socket.id);                //remove prev. room  
            rooms[newPath].push(socket.id);                      
            
            player1.join(newPath);                               //join new  room
            socket.join(newPath);                                    

            let welcomeMessage = {"message": "User connected", "socketId": socket.id }; //template for message
            let output = sendMessage(welcomeMessage);

            io.to(newPath).emit('join');                          //signal about redirect
            io.to(newPath).emit(MESSAGE_RECIEVED, output);       
            io.to(newPath).emit(UNBLOCKCHAT);           
            new Game(player1, socket);                                          
        }
    });
    /*  if user press "BACK" or second player disconnect/left room 
        delete data about him from rooms, preparing for new game */
    socket.on(BACK, ()=>{
        sendUserLeft(rooms, socket);
        let chatRomm = socket.rooms;
        //delete user from chat
        for (var key in chatRomm) {                             
            if (chatRomm[key] !== socket.id) { 
                socket.leave(chatRomm[key]); 
            } 
        }                                                     
        rooms = removeRoom(rooms, socket.id);
        rooms = removeFromRoom(rooms, socket.id);  
        room = [socket.id];
        rooms = addRoom(rooms, room, socket);
        rooms = addRoom(rooms, room, socket);
        console.log(socket.adapter.rooms);
        
    });

    /* remove from arrays data about user  */
     socket.on("disconnect", ()=>{
        console.log(socket.id+" disconnected");
        sockets.splice(sockets.indexOf(socket), 1); 
        sendUserLeft(rooms, socket);
        rooms = removeRoom(rooms, socket.id);
        rooms = removeFromRoom(rooms, socket.id);
     });     

    //send message to chat
    socket.on(MESSAGE_SENT, (path)=>{
        let output = sendMessage(path);
        io.to(path.path).emit(MESSAGE_RECIEVED, output);
    }); 

     /*  start searching socket in search array*/    
    socket.on(SEARCHING, (searching)=>{     
        if(searching){
            search.splice(search.indexOf(socket), 1);
        }else{
            search.push(socket);                                 //add socket in to search
            if(search.length > 0){
                let player2 = search[Math.floor(Math.random() * (search.length-1))];
                if(socket.id !== player2.id){                        //if socket found, create rooms and redirect players in this room 
                    room = [player2.id];
                    if(room.length < 2){
                    search.splice(search.indexOf(player2), 1);       //delete users from search array
                    search.splice(search.indexOf(socket), 1);

                    rooms = removeRoom(rooms, socket.id);        //remove 2pl room
                        
                    socket.join(player2.id);                           //join the same chat
                    player2.join(player2.id);

                    rooms[player2.id].push(socket.id);
                    let welcomeMessage = {"message": "User connected", "socketId": socket.id };
                    let output = sendMessage(welcomeMessage);
                    
                    io.to(player2.id).emit(FOUND, player2.id);            
                    io.to(player2.id).emit(MESSAGE_RECIEVED, output);  
                    io.to(player2.id).emit(UNBLOCKCHAT);                    
                    new Game(player2, socket);                                                                      
                    }
                }
            }
        }
    });
};

//give id for "room" 
function addRoom(rooms, room, socket){
    let newRoom =  Object.assign({}, rooms);
    newRoom[socket.id] = room;
    return newRoom;
};
//delete "room" from "rooms"
function removeRoom(rooms, socket){
    let newRoom =  Object.assign({}, rooms);
    delete newRoom[socket];
    return newRoom;
};

//delete socket from "rooms"
function removeFromRoom(rooms, socket){
    for(let l in rooms){
        rooms[l] = rooms[l].filter(val => val !== socket);       
    }
    return rooms;
};

//send message about disconnect to chat
function sendUserLeft(ro, socket){
    let mes = {"message": "User disconnected", "socketId": socket.id }
    let output = sendMessage(mes);

    for (let key in rooms){
        let sock = ro[key];
        if(sock[0] === socket.id || sock[1] === socket.id){
            io.to(key).emit(MESSAGE_RECIEVED, output);
            socket.leave(key);
        }
    }
};
//search socket on sockets array
function searchSocket(path, sockets){
    for(let l in sockets){
        if(sockets[l].id === path){
         return sockets[l];  
        }
    }
};
//send message to chat, take roomId, return full message
function sendMessage(roomId){
    const time      = new Date().toLocaleTimeString(),
          messageId = new Date().getTime(),
          message   = roomId.message,
          socketId  = roomId.socketId;

    const output    = { message, socketId, time, messageId };
    return output;
};

