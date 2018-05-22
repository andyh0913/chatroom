import React, { Component, PropTypes } from 'react';
import ChatRoom from '../components/ChatRoom';
import './loginbox.scss';

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username:'',
            uid:'',
            socket: io()
        }
    }

    // generate id
    generateUid() {
        return new Date().getTime()+""+Math.floor(Math.random()*9+1);
    }

    // watch change
    handleChange(e) {
        this.setState({username: e.target.value})
    }

    // watch click 'send' or enter
    handleClick(e) {
        e.preventDefault();
        this.handleLogin();
    }
    handleKeyPress(e) {
        if (e.key == 'Enter') {
            this.handleLogin()
        }
        return false;
    }

    // login
    handleLogin() {
        let username = this.state.username;

        // generate random guest name
        // username = 'Guest' + Math.floor(Math.random()*89+10)
        const uid = this.generateUid();
        if (!username) {
            username = 'Guest'+ uid;
        }
        this.setState({uid:uid, username:username});
        this.state.socket.emit('login', {uid:uid, username:username})
    }

    // updateChatId
    updateChatId(id) {
      this.setState({chatId:id});
    }
    render() {
        let renderDOM;
        if (this.state.uid) {
            // if (uid) mount ChatRoom
            renderDOM = <ChatRoom uid={this.state.uid} chatId={this.state.chatId} username={this.state.username} socket={this.state.socket} />
        } else {
            // if (!uid) mount Login Box
            renderDOM = (<div className="login-box">
                            <h2>Log In</h2>
                            <div className="input">
                                <input type="text" placeholder="Please enter the user name" onChange={this.handleChange.bind(this)}
                                onKeyPress={this.handleKeyPress.bind(this)}/>
                            </div>
                            <div className="submit">
                                <button type="button" onClick={this.handleClick.bind(this)} >submit</button>
                            </div>
                        </div>)
        }
        return (<div>{renderDOM}</div>)
    }
}