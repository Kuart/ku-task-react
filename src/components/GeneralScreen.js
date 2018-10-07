import React, { Component } from 'react';
import rightArrow from "../images/rightArrow.svg";
import Button from './Button';
import Rules from './Rules';
import Preloader from './Preloader';
import {FOUND, SEARCHING} from '../Events';
import {Redirect} from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import {soundManager} from 'soundmanager2/script/soundmanager2-nodebug-jsmin.js';

export default class GeneralScreen extends Component{
    constructor(props){
        super(props);
        
        this.state = {
            searching: false,
            found: false,
            roomId: '',
            join: false
        }
    }

    //function for copying link
	selectText(val) {
        let text = document.getElementById(val), 
            range, 
            selection;  
	
		if(document.body.createTextRange) {
			range = document.body.createTextRange();
			range.moveToElementText(text);
            range.select();
		} else if (window.getSelection) {
			selection = window.getSelection();
			range = document.createRange();
            range.selectNodeContents(text);
			selection.removeAllRanges();
            selection.addRange(range);
		}
    };
    
	//copying link after click
	hClick = (e)=>{
        e.preventDefault()
        let val = e.target.id
        this.selectText(val)
        document.execCommand("copy");
        window.getSelection().removeAllRanges();
    };
		
    componentDidMount(){
        const {socket} = this.props;
        //if game found, take game room ID, remove from search and setState for redirect
        socket.on(FOUND, (id)=>{
            this.setState({"found": true, "roomId": id, searching: false });
            this.playSound()
        })

        socket.on('join', ()=>{
            this.setState({join: true });
            this.playSound()
        })
    };

    handleClick = (e)=>{
        const {socket} = this.props;
        const {searching} = this.state;
        e.preventDefault();
        //start searching after click
        this.setState({searching: !searching});
        //send info about start searching
        socket.emit(SEARCHING, (searching));
    };

    playSound() {
        soundManager.createSound({
            id: 'income',
            url: '/../sound/income.mp3',
            debugMode: false,
        });
        soundManager.play('income');
    };

    componentWillUnmount(){
        const {socket} = this.props;
        socket.off('FOUND');
        socket.off('join');   
    };
    
    render(){
        const {socket} = this.props;
        const {found, roomId, searching, join } = this.state;
        return(
                <div className="container">
                    <ErrorBoundary><Preloader/></ErrorBoundary>
                    {found && <Redirect push to={`/play/${roomId}`}/>}  {/* redirect to found random game room*/}
                    {join && <Redirect push to={`/play/${socket.id}`}/>} {/* redirect to room from link */}
                    <header>
                            Welcome to the online <br/>
                            Rock-Paper-Scissors-Spock-Lizard game
                    </header>
                    <div className="arrows">
                        <img src={rightArrow} alt="arrow"/>
                        <img src={rightArrow} alt="arrow"/>
                    </div>
                    <div className="options">
                        <Rules className="rules"/>
                        <div className="random">
                            <Button
                                    onClick = {this.handleClick}
                                    className={"btn"} 
                                    title={searching === false?"Try luck!":"Searching..."}
                                    />
                        </div>
                        <div className="link">
                            Send your friend this link:  <br/> <span 
                                                                    id="text"
                                                                    onClick = {this.hClick}>http://localhost:3000/play/{socket.id}</span><br/> 
                            and start playing right now! <br/>
                            <span className='lit'>(Just click and it will be copied!)</span> 
                        </div>
                    </div>
                </div>
        );
    }
}