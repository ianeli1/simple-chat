import React, { useState } from "react";
import { handler } from "./handler";
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
    currentChannel: string
}

type ChatBoxState = {
    loading: boolean,
    currentChannel: string | null,
    user: r.User,
    channel: r.Channel
}

export default class ChatBox extends React.Component<ChatBoxProps, ChatBoxState> {

  constructor(props: ChatBoxProps) {
    super(props);
    this.state = {
      loading: true, //TODO use this lmao
      currentChannel: props.currentChannel || null,
      user: props.user,
      channel: {},
    };
    this.handleNewMessage = this.handleNewMessage.bind(this);
  }

  componentWillReceiveProps(props: ChatBoxProps) {
     
    this.setState( //all this is innefficient af, leave this work to the handler.
      {
        user: props.user,
        currentChannel: props.currentChannel,
        channel: {},
      },
      () =>
        this.state.currentChannel && handler.updateMessages(this.state.currentChannel, (msg: r.Message, key: string) => {
          
          msg.timestamp = Number(key) ///¡??????
          /*
          if(!temp.timestamp){ //remove once all the messages without timestamps are gone
            temp.timestamp = 0
          }*/
          if (msg.image){
            handler.getImage(msg.image, (img: string) => {
              this.setState({channel: {...this.state.channel, key: {...msg, image: img}} })
            });
          }
          else
          {
            this.setState({
              channel: {key: msg, ...this.state.channel},
            });
            }   
        })
    );
  }

  handleNewMessage(message: string): () => void {
    return () => {
      handler.sendMessage({
        name: this.state.user.name,
        message,
        timestamp: 0
      });
    };
  }

  render() {
    return (
      <Box id="chatBox" bgcolor="primary.main">
        <Box id="messageList">
          {this.state.channel &&
            Object.values(this.state.channel).sort((b,a) => a.timestamp-b.timestamp || 0).map((x, i) => ( //get rid of the || 0 eventually?
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
          <NewMessage user={this.state.user} submit={this.handleNewMessage} />
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
          <Avatar>{name[0]}</Avatar>
          <Typography variant="h5">{name}</Typography>
        </Box>
        <Typography variant="body1">{message}</Typography>
      </Box>
      {message.image && 
      <Box className="MessageImage">
        <img className="MessageImagePrim" src={message.image} alt="[Loading...]" />
      </Box>
      }
    </Box>
  );
}

function NewMessage({ submit, user }: {submit: any, user: r.User}) { //handle the submit function
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  function sendMsg() {
    if (message.length) {
      submit(message)();
      setMessage("");
    }
  }
  return (
    <Box className="newMessage">
      {isUploading && <File user={user} cancel={() => setIsUploading(false)} />}
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
