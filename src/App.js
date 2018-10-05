import React, { Component } from 'react';
import GeneralScreen from './components/GeneralScreen'
import {Switch, Route} from 'react-router-dom';
import Play from './components/game/Play';
import io from 'socket.io-client';
import {USER_CONNECTED} from './Events';


const socketUrl = 'http://localhost:3100/'    

export default class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      socket: null,
      pathReady: false
   }
  }

  //init io bef. render
  componentWillMount(){
    this.initSocket()   
}

//socket operation connect/disc, get user, room
  initSocket = () =>{
      const socket = io(socketUrl);
      const path = window.location.pathname  //take pathname
      this.setState({socket: socket})

  socket.on('connect', () => {         
      socket.emit(USER_CONNECTED, (path)) 
  }) 

  socket.on(USER_CONNECTED, ()=>{       
      this.setState({pathReady: true})
  })
}

  render() {
    const { socket} = this.state
    return (
      <Switch>
        <Route exact path='/' render={() => <GeneralScreen socket={socket} />}/>    
        <Route exact path='/play/:room' render={() => <Play socket={socket} />}/>
      </Switch> 
    );
  }
}

