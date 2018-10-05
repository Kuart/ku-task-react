const io = require('./server.js').io;
const {GAME_STATUS, GAME_MESSAGE, NEW_GAME, RESTART, ANIMATION} = require('../Events');

module.exports = class Game{
    constructor(pl1, pl2){
        //add 2 players(sockets) to array
        this.players = [pl1, pl2]

        //create array with turns & ready status
        this.turns = [null, null]
        this.ready = [null, null]

        //object for score
        const score = {
            "scr1": 0,
            "scr2": 0
        }

        //initial info to info field (react)
        const info = {
            "scr1": 'Score: 0',
            "message": "Game started",
            "scr2": 'Score: 0'
        }

        //pl1.id === room, sending initial info
        io.to(pl1.id).emit(GAME_STATUS, info)

        //catching players turns, sending new info to players)
        this.players.forEach((i, id)=>{
            i.on(GAME_MESSAGE, (turn)=>{
                info.message = `You select ${turn}`
                i.emit(GAME_STATUS, info)
                this.onTurn(id, turn, pl1.id, info, score)
        })   
    })
        this.players.forEach((i)=>{
            i.on('brake', ()=>{
                info.message = `You'll  be redirected`
                i.to(pl1.id).emit(GAME_STATUS, info)
                i.to(pl1.id).emit('block')
                this.restart()
            })
    })
    //play again
    this.players.forEach((i, id)=>{
        i.on(NEW_GAME, (ready)=>{
            info.message = "Waiting the second player"
            i.emit(GAME_STATUS, info)
            this.onReady(id, ready, pl1.id, info)
        })  

    })     
}   
    //function for sending message
    sendMessage(id){
        if(this.players[id]){
            this.players[id].emit(GAME_MESSAGE, id);
        }
    };
    /* function for tracking turns and write them in array, if all players complete turn - start game function */
    onTurn(id, turn, room, info, score){
        this.turns[id] = turn
        this.sendMessage(id);
        if(this.turns[0] && this.turns[1]){
            this.gameOver(this.turns[0], this.turns[1], room, info, score)
        }
    }

    //game function with 3 endgame option 
    gameOver(tp1, tp2, room, info, score){
        const options = ["paper", "rock", "lizard", "spock", "scissors"],
              result = [" draw ", " beats ", " loses to "];
        let index1 = options.indexOf(tp1),  // 0-4
            index2 = options.indexOf(tp2),  // 0-4
            dif = index2 - index1; 
        if(dif < 0) {
            dif += options.length; 
        }
        while(dif > 2) { //if more than 2 then -2 
            dif -= 2; 
            //else/or result[dif] === game result
        }

        //3 option if result === ? change score and message
        if(result[dif] === " beats " ){
            info.message = `${tp1} ${result[dif]} ${tp2}`
            ++score.scr1
            info.scr1 = `Score: ${score.scr1}`
        }else if(result[dif] === " loses to "){
            info.message = `${tp1} ${result[dif]} ${tp2}`
            ++score.scr2
            info.scr2 = `Score: ${score.scr2}`
        }else{
            info.message = 'Draw'
        }

        //help fix bug with room name
        let ran = Math.floor(Math.random() * (10000 - 1)+1)
        this.players[0].join(ran)
        //send message to room about winner
        io.to(this.players[1].id).emit(ANIMATION, tp1);
        io.to(ran).emit(ANIMATION, tp2);
        this.players[0].leave(ran)

        setTimeout(() =>{io.to(room).emit(GAME_STATUS, info)}, 2000);
        //ask about new game
        setTimeout(() =>{io.to(room).emit(NEW_GAME)}, 3000);

  };

    onReady(id, ready, room, info){
        this.ready[id] = ready // push resolt in ready arr
        if(this.ready[0] && this.ready[1]){ //w8 2 anser
            info.message = "New game started" 
            io.to(room).emit(RESTART, info)
            this.turns = [null, null]
            this.ready = [null, null]
        }
    }

    restart(){
        this.turns   = [null, null]
        this.ready   = [null, null]
    }
}