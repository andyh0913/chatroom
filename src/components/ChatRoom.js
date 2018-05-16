import React, {Component} from 'react';
import RoomStatus from './RoomStatus';
import Messages from './Messages';
import ChatInput from './ChatInput';
import UserList from './UserList';

export default class ChatRoom extends Component {
    constructor(props) {
        super(props);
        const socket = this.props.socket;
        this.state = {
            myId: this.props.uid,
            myName: this.props.username,
            uid: this.props.uid,
            chatId:'',
            username: this.props.username,
            socket: socket,
            messages:{},
            newMsgNumbers: {},
            onlineUsers: {},
            onlineCount: 0,
            userhtml:'',
        }
        this.ready();
    }

    // 处理在线人数及用户名，即聊天室状态栏
    handleUsers() {
        const users = this.state.onlineUsers;
        let newMsgNumbers = this.state.newMsgNumbers;
        let messages = JSON.parse(JSON.stringify(this.state.messages));
        let userhtml = '';
        let separator = '';
        for (let key in users) {
            if (users.hasOwnProperty(key)) {
                userhtml+= separator + users[key];
                separator = '、';
            }
            if (!newMsgNumbers.hasOwnProperty(key)){
              newMsgNumbers[key] = 0;
            }
            if (!messages.hasOwnProperty(key)){
              messages[key] = [];
            }
        }
        this.setState({
          userhtml: userhtml,
          newMsgNumbers:newMsgNumbers,
          messages:messages
        });
    }

    // 生成消息id
    generateMsgId() {
        return new Date().getTime()+""+Math.floor(Math.random()*899+100);
    }

    // 更新系统消息，，此处有个小坑，react中的array不能使用push，而需要concat添加元素，新增的消息有以下属性，
    // 类型type，用户名username，用户IDuid，用户行为action(即为登入登出)，消息ID msgId，时间time
    updateSysMsg(o, action) {
        let messages = JSON.parse(JSON.stringify(this.state.messages));
        let newMsgNumbers = Object.assign({},this.state.newMsgNumbers);
        const newMsg = {type:'system', username:o.user.username, uid:o.user.uid, action:action, msgId: this.generateMsgId(), time:this.generateTime()}
        if(!messages[o.user.uid]){
            messages[o.user.uid] = [];
        }
        messages[o.user.uid] = messages[o.user.uid].concat(newMsg);
        if(action==='login'){
            newMsgNumbers[o.user.uid]=0;
            messages[o.user.uid]=[];
        }
        else if(action==='logout'){
          delete newMsgNumbers[o.user.uid];
          delete messages[o.user.uid];
        }
        this.setState({
            onlineCount: o.onlineCount,
            onlineUsers: o.onlineUsers,
            messages: messages,
            newMsgNumbers:newMsgNumbers,
            messages: messages
        });
        this.handleUsers();
    }

    // 更新消息列表，此处有个小坑，React中的Array不能使用push，而需要concat添加元素，新增的消息有以下属性，
    // 类型type，用户名username，用户IDuid，消息内容（此处使用系统消息中的action），消息ID msgId，发送时间time
    updateMsg(obj) {
        let messages = JSON.parse(JSON.stringify(this.state.messages));
        const newMsg = {type:'chat', username:obj.username, uid:obj.uid, action:obj.message, msgId:this.generateMsgId(), time:this.generateTime()};
        if(!messages[obj.uid]){
            messages[obj.uid] = [];
        }
        if( obj.chatId===this.state.myId){
            messages[obj.uid] = messages[obj.uid].concat(newMsg);
        }
        else if( obj.uid===this.state.myId ){
            messages[obj.chatId] = messages[obj.chatId].concat(newMsg);
        }
        let newMsgNumbers = Object.assign({},this.state.newMsgNumbers);
        if(this.state.chatId!=obj.uid && obj.chatId===this.state.myId){
            console.log(this.state.chatId+','+obj.uid);
            newMsgNumbers[obj.uid]++;
        }
        this.setState({messages:messages,newMsgNumbers:newMsgNumbers,messages:messages});
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
            this.updateMsg(obj);
        })
    }

    updateChatId(id){
        let newMsgNumbers = Object.assign({},this.state.newMsgNumbers);
        newMsgNumbers[id] = 0;
        document.title = this.state.onlineUsers[id];
        console.log('update chatId: '+id);
        this.setState({chatId:id,newMsgNumbers:newMsgNumbers});
    }

    render() {
        let reactDOM;
        if(!this.state.chatId){
          reactDOM = (
            <div className="room-box">
              <div className="user-list-box">
                <h2>Online Users</h2>
                <UserList newMsgNumbers={this.state.newMsgNumbers} onlineUsers={this.state.onlineUsers} myId={this.state.myId} updateChatId={this.updateChatId.bind(this)}/>
              </div>
              <div className="chat-room">
                  <div className="welcome">
                      <div className="room-name">Chat Room |</div>
                      <div className="button">
                          <button onClick={this.handleLogout}>登出</button>
                      </div>
                  </div>
                  <RoomStatus onlineCount={this.state.onlineCount} userhtml={this.state.userhtml}/>
                  <div ref="chatArea">
                      <Messages messages={[]} myId={this.state.myId} />
                      <ChatInput chatId={this.state.chatId} myId={this.state.myId} myName={this.state.myName} socket={this.state.socket}/>
                  </div>
              </div>
            </div>
          )
        }
        else{
          reactDOM = (
            <div className="room-box">
              <div className="user-list-box">
                <h2>Online Users</h2>
                <UserList newMsgNumbers={this.state.newMsgNumbers} onlineUsers={this.state.onlineUsers} myId={this.state.myId} updateChatId={this.updateChatId.bind(this)}/>
              </div>
              <div className="chat-room">
                  <div className="welcome">
                      <div className="room-name">Chat Room | {this.state.onlineUsers[this.state.chatId]}</div>
                      <div className="button">
                          <button onClick={this.handleLogout}>登出</button>
                      </div>
                  </div>
                  <RoomStatus onlineCount={this.state.onlineCount} userhtml={this.state.userhtml}/>
                  <div ref="chatArea">
                      <Messages messages={this.state.messages[this.state.chatId]} myId={this.state.myId} />
                      <ChatInput chatId={this.state.chatId} myId={this.state.myId} myName={this.state.myName} socket={this.state.socket}/>
                  </div>
              </div>
            </div>
              )
        }
        return (reactDOM);
    }
}