// RoomStatus
import React, {Component} from 'react';

export default class RoomStatus extends Component {
    render() {
        return(<div className="room-status">Online Count: {this.props.onlineCount}, Online Users: {this.props.userhtml}</div>)
    }
}