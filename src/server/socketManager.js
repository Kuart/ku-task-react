const io = require('./server.js').io;
const {USER_CONNECTED, SEARCHING, FOUND, MESSAGE_SENT, MESSAGE_RECIEVED, BACK, PLUS} = require('../Events');
const Game  = require('./game');

let room = [],     //array for room
    rooms= [],     //array for rooms
    sockets = [],  //array for sockets
    search = [];   //array for random game search


module.exports = function(socket){
    console.log("Socket ID " + socket.id);
    //create user, create room, push room in rooms, send to react user info
    socket.on(USER_CONNECTED, (path)=>{
        sockets.push(socket)
        room = [socket.id]
        socket.join(socket.id)
        let newPath = path.replace('/play/','');                    //take path from browser and delete start part                                                            
        rooms = addRoom(rooms, room, socket)
        io.emit(USER_CONNECTED)
        if( rooms[newPath] && rooms[newPath] != socket.id && rooms[newPath].length < 2 ){      //check in "rooms" room with same id like path, then control 2 ppl in  room 
            search.splice(search.indexOf(socket), 1)
            rooms[newPath].push(socket.id)                          //if all ok add new id in room
            rooms = removeRoom(rooms, socket.id)                    //remove prev. room  
            let plr1 = fSocket(newPath, sockets)                    //using path(because path === socket.id first player) to find socket                    
            plr1.join(newPath)                                      //join new room
            socket.join(newPath)                                    
            let mes = {"message": "User connected", "socketId": socket.id } //template for message
            let output = sendMessage(mes)
            io.to(newPath).emit('join')                       //socket.io message in to react for redirect  
            io.to(newPath).emit(MESSAGE_RECIEVED, output)           //sending start messagein chat
            io.to(newPath).emit(PLUS)           
            if(rooms[newPath].length === 2){                             //check one more time 2ppl in room, then ,                    
                new Game(plr1, socket)                              //start game
            }                                                     
        }
    })
    //if user press "BACK" delete data about them from rooms, preparing for new game
    socket.on(BACK, ()=>{
        userLeaveMessage(rooms, socket)
        let chatRomm = socket.rooms
        for (var key in chatRomm) {                             //delete user from chat
            if (chatRomm[key] !== socket.id) { 
                delete chatRomm[key]; 
            } 
        }                                                     
        socket.join(socket.id)
        rooms = removeRoom(rooms, socket.id)
        rooms = removeFromRoom(rooms, socket.id)  
        room = [socket.id]
        rooms = addRoom(rooms, room, socket)
        
    })

    /*USER DISCONNECTED, remove from array "rooms"-"room" */
     socket.on("disconnect", ()=>{
        console.log(socket.id+" disconnected")
        sockets.splice(sockets.indexOf(socket), 1) 
        userLeaveMessage(rooms, socket)
        rooms = removeRoom(rooms, socket.id)
        rooms = removeFromRoom(rooms, socket.id) 
     })     
    //send message to chat
    socket.on(MESSAGE_SENT, (path)=>{
        let output = sendMessage(path)
        io.to(path.path).emit(MESSAGE_RECIEVED, output)
    }) 
     /* take value from react and start searching socket in search array*/    
    socket.on(SEARCHING, (searching)=>{     
        if(searching){
            search.splice(search.indexOf(socket), 1)
        }else{
            search.push(socket) //add socket in to search
            if(search.length > 0){
                let p2 = search[Math.floor(Math.random() * (search.length-1))]
                if(socket.id !== p2.id){  //if socket found, create rooms and redirect players in this room 
                    room = [p2.id]
                    if(room.length < 2){
                    search.splice(search.indexOf(p2), 1)      //delete users from search array
                    search.splice(search.indexOf(socket), 1)
                    rooms = removeRoom(rooms, socket.id)     //remove 2pl room
                    socket.join(p2.id)                       //join the saim chat
                    p2.join(p2.id)
                    rooms[p2.id].push(socket.id)
                    let mes = {"message": "User connected", "socketId": socket.id }
                    let output = sendMessage(mes)
                    io.to(p2.id).emit(FOUND, p2.id)         //message for redirect
                    io.to(p2.id).emit(MESSAGE_RECIEVED, output)   //start message to chat
                    io.to(p2.id).emit(PLUS)                     //unblock chat
                    new Game(p2, socket)         //start new game                                                          
                    }
                } 
            } 
        }
    })
}

//give id for "room" 
function addRoom(rooms, room, socket){
    let newRoom =  Object.assign({}, rooms)
    newRoom[socket.id] = room
    return newRoom
}
//delete "room" from "rooms"
function removeRoom(rooms, socket){
    let newRoom =  Object.assign({}, rooms)
    delete newRoom[socket]
    return newRoom
}

//delete socket from "rooms"
function removeFromRoom(rooms, socket){
    for(let l in rooms){
        rooms[l] = rooms[l].filter(val => val !== socket);       
    }
    return rooms
}

//send message to left room
function userLeaveMessage(ro, socket){
    let mes = {"message": "User disconnected", "socketId": socket.id }
    let output = sendMessage(mes)
    for (let key in rooms){
        let sock = ro[key]
        if(sock[0] === socket.id || sock[1] === socket.id){
            io.to(key).emit(MESSAGE_RECIEVED, output)
            socket.leave(key)
        }
    }
}
//faind socket on sockets
function fSocket(path, sockets){
    for(let l in sockets){
        if(sockets[l].id === path){
         return sockets[l]   
        }
    }
}
//send message to chat
function sendMessage(path){
    const time = new Date().toLocaleTimeString()
    const messageId = new Date().getTime()
    let message = path.message
    let socketId = path.socketId
    const output = {message, socketId, time, messageId }
    return output
}
