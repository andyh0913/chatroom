import React, {Component} from 'react';
import RoomStatus from './RoomStatus';
import Messages from './Messages';
import ChatInput from './ChatInput';

export default class ChatRoom extends Component {
    constructor(props) {
        super(props);
        const socket = this.props.socket;
        this.state = {
            myId: this.props.uid,
            myName: this.props.username,
            uid: this.props.uid,
            username: this.props.username,
            socket: socket,
            messages:[],
            onlineUsers: {},
            onlineCount: 0,
            userhtml:'',
        }
        this.ready();
    }

    // 处理在线人数及用户名，即聊天室状态栏
    handleUsers() {
        const users = this.state.onlineUsers;
        let userhtml = '';
        let separator = '';
        for (let key in users) {
            if (users.hasOwnProperty(key)) {
                userhtml+= separator + users[key];
                separator = '、';
            }
        }
        this.setState({userhtml: userhtml})
    }

    // 生成消息id
    generateMsgId() {
        return new Date().getTime()+""+Math.floor(Math.random()*899+100);
    }

    // 更新系统消息，，此处有个小坑，react中的array不能使用push，而需要concat添加元素，新增的消息有以下属性，
    // 类型type，用户名username，用户IDuid，用户行为action(即为登入登出)，消息ID msgId，时间time
    updateSysMsg(o, action) {
        let messages = this.state.messages;
        const newMsg = {type:'system', username:o.user.username, uid:o.user.uid, action:action, msgId: this.generateMsgId(), time:this.generateTime()}
        messages = messages.concat(newMsg)
        this.setState({
            onlineCount: o.onlineCount,
            onlineUsers: o.onlineUsers,
            messages: messages
        });
        this.handleUsers();
    }

    // 更新消息列表，此处有个小坑，React中的Array不能使用push，而需要concat添加元素，新增的消息有以下属性，
    // 类型type，用户名username，用户IDuid，消息内容（此处使用系统消息中的action），消息ID msgId，发送时间time
    updateMsg(obj) {
        let messages = this.state.messages;
        const newMsg = {type:'chat', username:obj.username, uid:obj.uid, action:obj.message, msgId:this.generateMsgId(), time:this.generateTime()};
        messages = messages.concat(newMsg);
        this.setState({messages:messages})
    }

    // 生成'hh-mm'格式的时间
    generateTime() {
        let hour = new Date().getHours(),
            minute = new Date().getMinutes();
        hour = (hour==0) ? '00' : hour;
        minute = (minute<10) ? '0' + minute : minute;
        return hour + ':' + minute;
    }

    // 登出页面，此处是刷新页面
    handleLogout() {
        location.reload();
    }


    // 开始监控socket
    ready() {
        const socket = this.state.socket;
        // 客户端监控登陆
        socket.on('login', (o)=>{
            this.updateSysMsg(o, 'login');
        })
        // 客户端监控登出
        socket.on('logout', (o)=>{
            this.updateSysMsg(o, 'logout');
        })
        // 客户端监控发送消息
        socket.on('message', (obj)=>{
            this.updateMsg(obj)
        })
    }

    render() {
        return(
            <div className="chat-room">
                <div className="welcome">
                    <div className="room-name">鱼头的聊天室 | {this.state.myName}</div>
                    <div className="button">
                        <button onClick={this.handleLogout}>登出</button>
                    </div>
                </div>
                <RoomStatus onlineCount={this.state.onlineCount} userhtml={this.state.userhtml}/>
                <div ref="chatArea">
                    <Messages messages={this.state.messages} myId={this.state.myId} />
                    <ChatInput myId={this.state.myId} myName={this.state.myName} socket={this.state.socket}/>
                </div>
            </div>)
    }
}