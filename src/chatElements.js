import React, { useState } from "react";
import { handler } from "./data";
import { Send, AddPhotoAlternate } from "@material-ui/icons";
import { File } from "./extraMenus";
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
        channel: [],
      },
      () =>
        this.state.currentChannel &&
        handler.updateMessages(this.state.currentChannel, (snap) => {
          const temp = snap.val();
          temp.key = snap.key
          if(!temp.timestamp){ //remove once all the messages without timestamps are gone
            temp.timestamp = 0
          }
          if (temp.image)
            handler.getImage(temp.image, (img) => {
              this.setState({
                channel: [{...temp, image: img}, ...this.state.channel] 
                })
            });
          else
            this.setState({
              channel: [temp, ...this.state.channel],
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
            Object.values(this.state.channel).sort((b,a) => a.timestamp-b.timestamp || 0).map((x, i) => ( //get rid of the || 0 eventually?
              <Message
                key={i}
                name={x.name}
                message={x.message}
                image={x.image || false}
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

function Message({ name, message, key, image }) {
  return (
    <Box className="Message" key={key}>
      <Box class="BasicMessage">
        <Box className="MessageName">
          <Avatar>{name[0]}</Avatar>
          <Typography variant="h5">{name}</Typography>
        </Box>
        <Typography variant="body1">{message}</Typography>
      </Box>
      {image && <img className="MessageImage" src={image} alt="[Loading...]" />}
    </Box>
  );
}

function NewMessage({ submit, user }) {
  let [message, setMessage] = useState("");
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
