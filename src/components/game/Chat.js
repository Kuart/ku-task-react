import React, {Component} from 'react'
import Button from '../Button'
import {MESSAGE_SENT, PLUS} from '../../Events'


export default class Chat extends Component  {
    constructor(props){
        super(props)
        this.state = {
            message: "",
            block: true,
        }
    }

    componentDidMount(){
        const {socket} = this.props;
        socket.on(PLUS, ()=>{
            this.setState({block: false})
        })
    }
    componentWillUnmount(){
        const {socket} = this.props;
        socket.off(PLUS)
        socket.off(MESSAGE_SENT)
    }
    handleChange = (e)=>{
        this.setState({message: e.target.value})     
    }

    handleSubmit = (e)=>{
        e.preventDefault();
        const {socket} = this.props;
        const {message} = this.state;
        let socketId = socket.id
        let path = window.location.pathname.replace('/play/',''); 
        if(/^\s+$/.test(message) || message === ""){
            this.setState({message: ""})
            
        }else{
            socket.emit(MESSAGE_SENT, ({path, message, socketId}));
            this.setState({message: ""})
        }
    }

    scrollDown=()=>{
        const chat = document.querySelector('.window')
        chat.scrollTop = chat.scrollHeight
    }

    componentDidUpdate(prevProps, prevState){
        this.scrollDown()
    }

    render(){
        const { message} = this.state
        const { messages, socket } = this.props
        return(
            <div className="chat">
                <div className="window">
                    <ul>
                        {messages.map((i)=> 
                        <li 
                            key={i.messageId} > 
                            <span className="time">{i.time}</span> 
                            <span className={i.socketId === socket.id?'user':'not'}>
                            {i.socketId === socket.id?' You: ':' Opponent: '}  
                            </span>{i.message}</li>)}
                    </ul>
                </div>
                <form onSubmit = {this.handleSubmit}>
                    <input
                            onChange = {this.handleChange}
                            value    = {message}
                            type     = 'text'
                            className={this.state.block?'block':''}
                    />
                    <Button 
                            className={message.length === 0?"btn sendb pas":"btn sendb active"}
                            title="Send"
                            onClick = {this.handleSubmit}
                            />
                </form>   
            </div>
    )
}}
