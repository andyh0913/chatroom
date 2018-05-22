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

    // handle online users
    handleUsers() {
        const users = this.state.onlineUsers;
        let newMsgNumbers = this.state.newMsgNumbers;
        let messages = JSON.parse(JSON.stringify(this.state.messages));
        let userhtml = '';
        let separator = '';
        for (let key in users) {
            if (users.hasOwnProperty(key)) {
                userhtml+= separator + users[key];
                separator = ', ';
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

    // generate MsgId
    generateMsgId() {
        return new Date().getTime()+""+Math.floor(Math.random()*899+100);
    }

    // update system messages with following properties:
    // type，username，uid，action，msgId，time
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
          this.setState({chatId:''});
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

    // update messages with following properties:
    // type，username，uid，action，msgId，time
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
            newMsgNumbers[obj.uid]++;
        }
        this.setState({messages:messages,newMsgNumbers:newMsgNumbers,messages:messages});
    }

    // generate time in format "hh-mm"
    generateTime() {
        let hour = new Date().getHours(),
            minute = new Date().getMinutes();
        hour = (hour==0) ? '00' : hour;
        minute = (minute<10) ? '0' + minute : minute;
        return hour + ':' + minute;
    }

    // refresh site while logout
    handleLogout() {
        document.title = "Online Chat Room";
        location.reload();
    }


    // watching socket
    ready() {
        document.title = this.state.myName;
        const socket = this.state.socket;
        // client watching login
        socket.on('login', (o)=>{
            this.updateSysMsg(o, 'login');
        })
        // client watching logout
        socket.on('logout', (o)=>{
            this.updateSysMsg(o, 'logout');
        })
        // client watching message
        socket.on('message', (obj)=>{
            this.updateMsg(obj);
        })
    }

    updateChatId(id){
        let newMsgNumbers = Object.assign({},this.state.newMsgNumbers);
        newMsgNumbers[id] = 0;
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
                          <button onClick={this.handleLogout}>Log out</button>
                      </div>
                  </div>
                  <RoomStatus onlineCount={this.state.onlineCount} userhtml={this.state.userhtml}/>
                  
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
                          <button onClick={this.handleLogout}>Log out</button>
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