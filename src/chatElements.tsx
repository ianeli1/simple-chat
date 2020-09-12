import React, { useState } from "react";
//import { handler } from "./handler";
import { Send, AddPhotoAlternate } from "@material-ui/icons";
import { File } from "./extraMenus";
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  TextField,
} from "@material-ui/core";
import * as r from "./reference";

type ChatBoxProps = {
    user: r.User,
    channel: r.Channel,
    sendMessage: (msg: r.Message, file?: File) => void
}

type ChatBoxState = {
    loading: boolean,
    user: r.User,
    channel: r.Channel
}

export default class ChatBox extends React.Component<ChatBoxProps, ChatBoxState> {

  constructor(props: ChatBoxProps) {
    super(props);
    this.state = {
      loading: true, //TODO use this lmao
      user: props.user,
      channel: props.channel,
    };
    this.handleNewMessage = this.handleNewMessage.bind(this);
  }

  componentWillReceiveProps(props: ChatBoxProps) {
    this.setState({
      user: props.user,
      channel: props.channel
    })
    /*
    this.setState( //all this is innefficient af, leave this work to the handler.
      {
        user: props.user,
        currentChannel: props.currentChannel,
        channel: {},
      },
      () => this.state.currentChannel && handler.initializeChannel(this.state.currentChannel, (channel: r.Channel) => this.setState({channel})))
      */
  }

  handleNewMessage(message: string): () => void {
    return () => {
      this.props.sendMessage({
        name: this.state.user.name, 
        userId: this.state.user.userId,
        message: message,
        timestamp: 0})
    };
  }

  render() {
    return (
      <Box id="chatBox" bgcolor="primary.main">
        <Box id="messageList">
          {this.state.channel &&
            Object.values(this.state.channel).sort((a,b) => a.timestamp-b.timestamp || 0).map((x, i) => ( //get rid of the || 0 eventually?
              <Message
                key={i}
                message={{
                    name: x.name,
                    message: x.message,
                    image: x.image || "",
                    timestamp: x.timestamp
                }}
              />
            ))}
          
        </Box>
        <Box id="newMessageBox">
          <NewMessage sendMessage={this.props.sendMessage} user={this.state.user} submit={this.handleNewMessage} />
        </Box>
      </Box>
    );
  }
}

function Message({ key, message}: {key: number, message: r.Message}) {
  return (
    <Box className="Message" key={key}>
      <Box className="BasicMessage">
        <Box className="MessageName">
          <Avatar>{message.name[0]}</Avatar>
          <Typography variant="h5">{message.name}</Typography>
        </Box>
        <Typography variant="body1">{message.message}</Typography>
      </Box>
      {message.image && 
      <Box className="MessageImage">
        <img className="MessageImagePrim" src={message.image} alt="[Loading...]" />
      </Box>
      }
    </Box>
  );
}

function NewMessage({ submit, user, sendMessage }: {submit: any, user: r.User, sendMessage: (msg: r.Message, file?: File) => void}) { //handle the submit function
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  function sendMsg() {
    if (message.length) {
      sendMessage({
        name: user.name, 
        userId: user.userId,
        message: message,
        timestamp: 0})
      setMessage("");
    }
  }
  return (
    <Box className="newMessage">
      {isUploading && <File user={user} cancel={() => setIsUploading(false)} sendMessage={sendMessage}/>}
      <IconButton
        onClick={
          //get file
          () => setIsUploading(true)
        }
      >
        <AddPhotoAlternate />
      </IconButton>
      <TextField
        id="messageInput"
        style={{ flexGrow: 1 }}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMsg()}
        variant="outlined"
        label="Message"
      />
      <IconButton onClick={() => sendMsg()}>
        <Send />
      </IconButton>
    </Box>
  );
}
