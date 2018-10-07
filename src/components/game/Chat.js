import React, {Component} from 'react';
import Button from '../Button';
import {MESSAGE_SENT, UNBLOCKCHAT} from '../../Events';


export default class Chat extends Component  {
    constructor(props){
        super(props);
        this.state = {
            message: "",
            chatBlock: true,
        }
    };

    componentDidMount(){
        const {socket} = this.props;
        socket.on(UNBLOCKCHAT, ()=>{
            this.setState({chatBlock: false})           /* block chat when second player disconnected 
                                                           or your room is not created, else unblock */                                                
        })
    };

    componentWillUnmount(){
        const {socket} = this.props;
        socket.off(UNBLOCKCHAT);
        socket.off(MESSAGE_SENT);
    };

    handleChange = (e)=>{
        this.setState({message: e.target.value});  
    };

    handleSubmit = (e)=>{
        e.preventDefault();
        const {socket} = this.props;
        const {message} = this.state;
        let socketId = socket.id;
        let path = window.location.pathname.replace('/play/','');   //path = roomId
        if(/^\s+$/.test(message) || message === ""){                //verify message
            this.setState({message: ""});
            
        }else{
            socket.emit(MESSAGE_SENT, ({path, message, socketId})); //path(roomId), message, player socket.id  for sending function
            this.setState({message: ""});
        }
    };

    scrollDown=()=>{
        const chat = document.querySelector('.window');             //avtoscroll function
        chat.scrollTop = chat.scrollHeight;
    };

    componentDidUpdate(prevProps, prevState){
        this.scrollDown();
    };

    render(){
        const { message, chatBlock} = this.state;
        const { messages, socket } = this.props;
        return(
            <div className="chat">
                <div className="window">
                    <ul>
                        {messages.map((i)=> 
                        <li 
                            key={i.messageId} > 
                            <span className="time">{i.time}</span> 
                            <span className={i.socketId === socket.id?'user':'not'}>    {/* generate message in chat window  */}
                            {i.socketId === socket.id?' You: ':' Opponent: '}  
                            </span>{i.message}</li>)}
                    </ul>
                </div>
                <form onSubmit = {this.handleSubmit}>
                    <input
                            onChange = {this.handleChange}
                            value    = {message}
                            type     = 'text'
                            className={chatBlock?'block':''}
                    />
                    <Button 
                            className={message.length === 0?"btn sendb pas":"btn sendb active"}   //if message length > 0, button start shining
                            title="Send"
                            onClick = {this.handleSubmit}
                            />
                </form>   
            </div>
    )
}}
