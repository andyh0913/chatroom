// UserList
import React, {Component} from 'react';

export default class UserList extends Component {
    render() {
        let users = [];
        for (let key in this.props.onlineUsers){
            if(key!=this.props.myId){
                users = users.concat(<UserUnit name={this.props.onlineUsers[key]} newMsgNumber={this.props.newMsgNumbers[key]}/>);
            }
        }
        return(users);
    }
}

class UserUnit extends Component {
    render() {
        let renderDOM;
        if(this.props.newMsgNumber>0){
            renderDOM = (
                <div className="user-unit">
                    <img src="https://i.imgur.com/jkSIaRf.jpg" />
                    <p>{this.props.name}</p>
                    <div>{this.props.newMsgNumber}</div>
                </div>
            );
        }
        else{
            renderDOM = (
                <div className="user-unit">
                    <img src="https://i.imgur.com/jkSIaRf.jpg" />
                    <p>{this.props.name}</p>
                </div>
            );
        }
        return (renderDOM);
    }
}