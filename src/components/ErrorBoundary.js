import React, { Component } from 'react'
import Button from './Button'

export default class ErrorBoundary extends Component {
    state = {
        hasError: false
    };

    componentDidCatch(error, info){
        console.log('error', error);
        console.log('info', info);
        this.setState({hasError: true});
    }


    render(){
        if(this.state.hasError){
          return(
            <div className="error">
                <p>Oops! Something went wrong.</p>
                <Button 
                        onClick = {()=> console.log('Error') }
                        title = {"Send error message!"}
                        className = {"btn"}    
                        />
            </div>
        )}else{
            return this.props.children;
        }  
    }


}