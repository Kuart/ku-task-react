import React, { Component } from 'react'

export default class Info extends Component{

    shouldComponentUpdate(nextProps, nextState){
        if(this.props !== nextProps){
            return true
        }else{
            return false
        }
    }

    render(){
        const { info, side } = this.props
        return(
            <div {...this.props}>
                <div className="score_player-one"><span>Your:</span> <br/> {side===0?info.scr1:info.scr2}</div>
                <div className="text">{info.message}</div>
                <div className="score_player-two"><span>Opponent:</span> <br/> {side===0?info.scr2:info.scr1}</div>
            </div>
        ) 
    }  
}
