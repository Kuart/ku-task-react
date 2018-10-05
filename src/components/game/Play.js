import React, {Component} from 'react';
import Side from './Side'
import Info from "./Info"
import Rules from '../Rules';
import Button from '../Button';
import Chat from './Chat'
import {MESSAGE_RECIEVED, GAME_STATUS, GAME_MESSAGE, NEW_GAME, BACK, RESTART, ANIMATION} from '../../Events';
import {Redirect} from 'react-router-dom'
import Preloader from '../Preloader';
import {soundManager} from 'soundmanager2/script/soundmanager2-nodebug-jsmin.js'
/* import MediaHandler from './MediaHandler' */

export default class Play extends Component{
    constructor(props){
        super(props)
        this.state={
            messages:[],
            info: '',
            btnBlock: '',
            turn: '',
            newGame: false,
            back: false,
            side: "",
            aSide: '',
            secondPlayerLeft: false
        }
    }

    componentDidMount(){
        const { socket } = this.props
        socket.on(MESSAGE_RECIEVED, (message)=>{
            this.setState({messages: [...this.state.messages, message ]})
            this.pSound()
        })
        socket.on(GAME_STATUS, info=>{
            this.setState({info: info})
        })
        socket.on('block', ()=>{
            this.setState({btnBlock: true});
            this.backTimer = setTimeout(()=>{
                this.setState({secondPlayerLeft: true})
                socket.emit(BACK)
            },3000)
        })
        socket.on(NEW_GAME, ()=>{
            this.setState({newGame: true, turn: '',  aSide: ''})
        })
        socket.on(RESTART, (info)=>{
            this.setState({btnBlock: false, info: info})
        })
        socket.on(GAME_MESSAGE, show=>{
            this.setState({side: show})
        })
        socket.on(ANIMATION, tp=>{
            this.setState({aSide: tp})
        })
    }

   //after click on button take button id and send to the server said
    handleClick = (e)=> {
        const { socket } = this.props
        e.preventDefault();
        const turn = e.target.id
        this.setState({btnBlock: true, turn: turn, aSide: "2"})
        socket.emit(GAME_MESSAGE, turn)
    }
    //start new game
    handClick = (e) =>{
        const { socket } = this.props
        e.preventDefault();
        this.setState({newGame: false})
        socket.emit(NEW_GAME, true)
    }
    
    hanClick= (e) => {
        const { socket } = this.props
        e.preventDefault();
        this.setState({back: true, side: '', turn: '', aSide: '', newGame: false})
        socket.emit(BACK)
        socket.emit('brake')
    }

    

    componentWillUnmount(){
        const {socket} = this.props
        socket.off('BACK');
        socket.off('NEW_GAME');
        socket.off('MESSAGE_RECIEVED');
        socket.off('GAME_STATUS');
        socket.off('GAME_MESSAGE');
        socket.off('RESTART');
        socket.off('ANIMATION');
        socket.off('brake');
        socket.off('block');
        clearTimeout(this.backTimer);
        this.pSound()
    }

    pSound() {
        soundManager.createSound({
            id: 'inc',
            url: '/../sound/income.mp3',
            debugMode: false
        });
        soundManager.play('inc');
    }
    
    render(){
        const { socket } = this.props
        const { messages, output, info, newGame, back, aSide, turn, side, secondPlayerLeft } = this.state

        return(
         <div className="wraper">
          <Preloader/>
          {back && <Redirect to={`/`}/>} {/* redirect to start page */}
          {secondPlayerLeft && <Redirect to={`/`}/>} {/* redirect to start page */}
            <Info className="info" info = {info} side  = { side } />
            <div className="middle">
                <Side className="left">
                    {/* <video className="my-video" ref = {(ref)=> {this.myVideo = ref}}></video> */}
                </Side>
                {newGame?        /* if this.state.newGame "true" show button also show game block */
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
                                            <div className= {aSide === '2'?"bgimage":aSide + "s"}/>
                                        </div>
                                    </div> 
                                <div className="buttons">
                                    <Button 
                                        id = "rock"
                                        className= {!this.state.btnBlock?"btn rock gm":"btn rock gm block"}
                                        onClick= {this.handleClick}
                                        />
                                    <Button
                                        id = "paper"
                                        className={!this.state.btnBlock?"btn paper gm":"btn paper gm block "}
                                        onClick= {this.handleClick}
                                        />
                                    <Button 
                                        id = "scissors"
                                        className={!this.state.btnBlock?"btn scissors gm":"btn scissors gm block "}
                                        onClick= {this.handleClick}
                                        />
                                    <Button 
                                        id = "lizard"
                                        className={!this.state.btnBlock?"btn lizard gm":"btn lizard gm block "} 
                                        onClick= {this.handleClick}
                                        />
                                    <Button 
                                        id = "spock"
                                        className={!this.state.btnBlock?"btn spock gm":"btn spock gm block "}
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