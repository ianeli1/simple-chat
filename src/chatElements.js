import React, { useState } from "react";
import { handler } from "./data";
import SendIcon from "@material-ui/icons/Send";
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  TextField,
} from "@material-ui/core";

export default class ChatBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true, //TODO use this lmao
      currentChannel: props.currentChannel || null,
      user: props.user,
      channel: [],
    };
    this.handleNewMessage = this.handleNewMessage.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState(
      {
        user: props.user,
        currentChannel: props.currentChannel,
        channel: []
      },
      () =>
        this.state.currentChannel &&
        handler.updateMessages(this.state.currentChannel, (snap) => {
          this.setState({
            channel: [snap.val(), ...this.state.channel],
          });
        })
    );
  }

  handleNewMessage(message) {
    return () => {
      handler.sendMessage({
        name: this.state.user.name,
        message,
      });
    };
  }

  render() {
    return (
      <Box id="chatBox" bgcolor="primary.main">
        <Box id="messageList">
          {this.state.channel &&
            Object.values(this.state.channel).map((x, i) => (
              <Message key={i} name={x.name} message={x.message} />
            ))}
        </Box>
        <Box id="newMessageBox">
          <NewMessage submit={this.handleNewMessage} />
        </Box>
      </Box>
    );
  }
}

function Message({ name, message, key }) {
  return (
    <Box className="Message" key={key}>
      <Box className="MessageName">
        <Avatar>{name[0]}</Avatar>
        <Typography variant="h5">{name}</Typography>
      </Box>
      <Typography variant="body1">{message}</Typography>
    </Box>
  );
}

function NewMessage({ submit }) {
  let [message, setMessage] = useState("");
  function sendMsg(){
    if(message.length){
      submit(message)();
      setMessage("");
    }
  }
  return (
    <Box className="newMessage">
      <TextField
        id="messageInput"
        style={{ flexGrow: 1 }}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => (e.key == "Enter") && sendMsg() }
        variant="outlined"
        label="Message"
      />
      <IconButton
        onClick={() => sendMsg()}
      >
        <SendIcon />
      </IconButton>
    </Box>
  );
}
