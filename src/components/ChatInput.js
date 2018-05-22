// ChatInput input box
import React, {Component} from 'react';

export default class ChatInput extends Component {
    constructor(props) {
        super(props);
        this.state = {
            socket: this.props.socket,
            message:'',
            myId: this.props.myId,
            myName: this.props.myName
        }
    }

    // watch the change of input
    handleChange(e) {
        this.setState({message: e.target.value})
    }

    // click 'send' or press enter
    handleClick(e) {
        e.preventDefault();
        this.sendMessage()
    }
    handleKeyPress(e) {
        if (e.key == 'Enter') {
            this.sendMessage()
        }
        return false;
    }

    // send message
    sendMessage(e) {
        const message = this.state.message;
        const socket = this.state.socket;
        if (message) {
            const obj = {
                chatId: this.props.chatId,
                uid: this.state.myId,
                username: this.state.myName,
                message: message
            }
            socket.emit('message', obj);
            // clear input box
            this.setState({message:''})
        }
        return false
    }
    render() {
        return(
            <div className="input-box">
                <div className="input">
                    <input type="text" maxLength="140" placeholder="Press 'enter' to send" value={this.state.message}
                    onKeyPress={this.handleKeyPress.bind(this)} onChange={this.handleChange.bind(this)}/>
                </div>
                <div className="button">
                    <button type="button" onClick={this.handleClick.bind(this)}>Send</button>
                </div>
            </div>
            )
    }
}