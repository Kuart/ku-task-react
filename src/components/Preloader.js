import React, {Component} from 'react'

export default class Preloader extends Component {
	constructor(props) {
  	super(props);
  	this.state = {
    	animatedClass: ''
    }
  };
  
  componentDidMount() {
  	this.preloaderFade = setTimeout(() => this.setState({    //preloader fade out
    	animatedClass: 'animated'
		}), 400);
		this.preloaderOff = setTimeout(() => this.setState({		//preloader display off
    	animatedClass: 'none'
	}), 1000);
	};
	
	componentWillUnmount(){
		clearTimeout(this.preloaderFade);
		clearTimeout(this.preloaderOff);
	}
	render() {	
  	return <div className={`animated-tag ${this.state.animatedClass}`}/>;
  }
}
