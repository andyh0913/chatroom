// Messages
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

export default class Messages extends Component {

    // scroll down while components update
    componentDidUpdate() {
        const messageList = ReactDOM.findDOMNode(this.refs.messages);
        window.scrollTo(0, messageList.clientHeight + 50);
    }
    render() {
        const myId = this.props.myId;

        // check if the message is send by me
        const oneMessage = this.props.messages.map(function(message){
            return(
                    <Message key={message.msgId} msgType={message.type} msgUser={message.username} action={message.action} isMe={(myId == message.uid)? true : false} time={message.time}/>
                )
        })
        return(<div className="messages" ref="messages">{oneMessage}</div>)
    }
}

class Message extends Component {
    render() {


        if (this.props.msgType == 'system') {
            // system message
            return (
                <div className="one-message system-message">
                    {this.props.msgUser} {(this.props.action=='login')? ' join the Chat Room': ' leave the Chat Room'} <span className="time">&nbsp;{this.props.time}</span>
                </div>
            )
        } else {
            // chatting message, check if it's sent by me
            return (
                <div className={(this.props.isMe)? 'me one-message':'other one-message'}>
                        <p className="time"><span>{this.props.msgUser}</span> {this.props.time}</p>
                        <div className="message-content">{this.props.action}</div>
                </div>
            )
        }
    }
}