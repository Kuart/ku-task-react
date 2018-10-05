import React, { Component } from 'react';
import rightArrow from "../images/rightArrow.svg";
import Button from './Button';
import Rules from './Rules';
import Preloader from './Preloader';
import {FOUND, SEARCHING} from '../Events';
import {Redirect} from 'react-router-dom'

export default class WaitingScreen extends Component{
    constructor(props){
        super(props);
        
        this.state = {
            searching: false,
            found: false,
            roomId: '',
            join: false
        }
    }

    //function for coping link
	selectText(val) {
        let text = document.getElementById(val), 
            range, 
            selection;  
	
		if(document.body.createTextRange) {
			range = document.body.createTextRange();
			range.moveToElementText(text);
            range.select();
            console.log(text)
			
		} else if (window.getSelection) {
			selection = window.getSelection();
			range = document.createRange();
            range.selectNodeContents(text);
			selection.removeAllRanges();
            selection.addRange(range);
		}
	}
	//after click copy link 
	hClick = (e)=>{
        e.preventDefault()
        let val = e.target.id
        this.selectText(val)
        document.execCommand("copy");
        window.getSelection().removeAllRanges()
    }
		
    componentDidMount(){
        const {socket} = this.props
        //if game found change state
        socket.on(FOUND, (id)=>{
            this.setState({"found": true, "roomId": id, searching: false }) 
        })

        socket.on('join', ()=>{
            this.setState({join: true })
        })
    }
    
    componentWillUnmount(){
        const {socket} = this.props
        socket.off('FOUND');
        socket.off('join');   
    }

    handleClick = (e)=>{
        const {socket} = this.props
        const {searching} = this.state
        e.preventDefault();
        //start seaching after click
        this.setState({searching: !searching})
        //send info adbout seaching
        socket.emit(SEARCHING, (searching))
    }

    render(){
        const {socket} = this.props
        const {found, roomId, searching, join } = this.state
        return(
                <div className="container">
                    <Preloader/>
                    {found && <Redirect push to={`/play/${roomId}`}/>}  {/* redirect to found random room */}
                    {join && <Redirect push to={`/play/${socket.id}`}/>} {/* redirect to 2users room */}
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
                                                                    onClick = {this.hClick}>http://localhost:3000/<br/>play/{socket.id}</span><br/> 
                            and start playing right now! <br/>
                            <span className='lit'>(Just click and it will be copied!)</span> 
                        </div>
                    </div>
                </div>
        );
    }
}