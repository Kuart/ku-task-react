import React, {Component} from 'react';
import Side from './Side'
import Info from "./Info"
import Rules from '../Rules';
import Button from '../Button';
import Chat from './Chat';
import {MESSAGE_RECIEVED, GAME_STATUS, GAME_MESSAGE, NEW_GAME, BACK, RESTART, ANIMATION, BRAKE, BLOCK} from '../../Events';
import {Redirect} from 'react-router-dom';
import Preloader from '../Preloader';
import {soundManager} from 'soundmanager2/script/soundmanager2-nodebug-jsmin.js';

export default class Play extends Component{
    constructor(props){
        super(props)
        this.state={
            messages:[],
            info: '',
            buttonBlock: '',
            turn: '',
            newGame: false,
            back: false,
            side: "",
            rightSide: '',
            secondPlayerLeft: false
        }
    }

    componentDidMount(){
        const { socket } = this.props;
        socket.on(MESSAGE_RECIEVED, (message)=>{
            this.setState({messages: [...this.state.messages, message ]});
            
        })

        socket.on(GAME_STATUS, info=>{
            this.setState({info: info});
        })

        socket.on(BLOCK, ()=>{
            this.setState({ buttonBlock: true, 
                            side: '', 
                            turn: '', 
                            rightSide: '', 
                            newGame: false});
            this.playSound()
            socket.emit(BACK)
            this.timer = setTimeout(() => 
                this.setState({ secondPlayerLeft: true }), 3000)

        })

        socket.on(NEW_GAME, ()=>{
            this.setState({newGame: true, turn: '',  rightSide: ''});
        })

        socket.on(RESTART, (info)=>{
            this.setState({buttonBlock: false, info: info});
        })

        socket.on(GAME_MESSAGE, playerIndex=>{
            this.setState({side: playerIndex});
        })

        socket.on(ANIMATION, opponentTurn=>{
            this.setState({rightSide: opponentTurn});
            
        })  
    }

   //after click on button take button id (id = turn)
    handleClick = (e)=> {
        const { socket } = this.props;
        e.preventDefault();
        const turn = e.target.id;
        this.setState({buttonBlock: true, turn: turn, rightSide: "2"})
        socket.emit(GAME_MESSAGE, turn)
        this.pSound()
    }
    //start new game
    handClick = (e) =>{
        const { socket } = this.props;
        e.preventDefault();
        this.setState({newGame: false});
        socket.emit(NEW_GAME, true);
    }
    
    hanClick= (e) => {
        const { socket } = this.props;
        e.preventDefault();
        this.setState({back: true, side: '', turn: '', rightSide: '', newGame: false});
        socket.emit(BACK);
        socket.emit(BRAKE);
    }

    componentWillUnmount(){
        const {socket} = this.props;
        socket.off('BACK');
        socket.off('NEW_GAME');
        socket.off('MESSAGE_RECIEVED');
        socket.off('GAME_STATUS');
        socket.off('GAME_MESSAGE');
        socket.off('RESTART');
        socket.off('ANIMATION');
        socket.off('BRAKE');
        socket.off('BLOCK');
        clearTimeout(this.timer);
    }

    pSound() {
        soundManager.createSound({
            id: 'turn',
            url: '/../sound/turn.mp3',
            debugMode: false,
        });
        soundManager.play('turn');
    }

    playSound() {
        soundManager.createSound({
            id: 'income',
            url: '/../sound/income.mp3',
            debugMode: false,
        });
        soundManager.play('income');
    }
    
    render(){
        const { socket } = this.props;
        const { messages, output, info, newGame, back, rightSide, turn, side, secondPlayerLeft, buttonBlock } = this.state;

        return(
         <div className="wraper">
          <Preloader/>
          {back && <Redirect to={`/`}/>} {/* redirect to start page */}
          {secondPlayerLeft && <Redirect to={`/`}/>} {/* redirect to start page */}
            <Info className="info" info = {info} side  = { side } />
            <div className="middle">
                <Side className="left"/>
                {newGame?        
                            <Button  
                                title="Rematch?" 
                                onClick={this.handClick}
                                className="btn newgame"
                                /> 
                         :
                            <div className="center">
                                    <div className="anim">
                                        <div className='lft' >
                                            <div className={turn + "s"}/>
                                        </div>
                                        <div className='rht'>
                                            <div className= {rightSide === '2'?"bgimage" : rightSide + "s"}/>
                                        </div>
                                    </div> 
                                <div className="buttons">
                                    <Button 
                                        id = "rock"
                                        className= {!buttonBlock?"btn rock gm" : "btn rock gm block"}
                                        onClick= {this.handleClick}
                                        />
                                    <Button
                                        id = "paper"
                                        className={!buttonBlock?"btn paper gm" : "btn paper gm block "}
                                        onClick= {this.handleClick}
                                        />
                                    <Button 
                                        id = "scissors"
                                        className={!buttonBlock?"btn scissors gm" : "btn scissors gm block "}
                                        onClick= {this.handleClick}
                                        />
                                    <Button 
                                        id = "lizard"
                                        className={!buttonBlock?"btn lizard gm" : "btn lizard gm block "} 
                                        onClick= {this.handleClick}
                                        />
                                    <Button 
                                        id = "spock"
                                        className={!buttonBlock?"btn spock gm" : "btn spock gm block "}
                                        onClick= {this.handleClick}
                                        />
                                </div> 
                            </div> 
                            }     
                <Side className="right"/>
            </div>
            <div className="bottom">
                <Rules className="rules-game"/>
                <Chat socket={socket} messages = {messages} output = {output}/>
                <div className="back">
                    <Button 
                        className="btn"
                        title="Back"
                        onClick = {this.hanClick}
                        />   
                </div>                
            </div>
         </div>   
        )  
    }
}