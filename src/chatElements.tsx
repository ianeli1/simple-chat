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
  Button,
  Tooltip,
} from "@material-ui/core";
import * as r from "./reference";
import "./chatElements.css";
import { Message } from "./components/Message";

type ChatBoxProps = {
  user: r.User;
  channel: r.Channel;
  sendMessage: (msg: r.Message, file?: File) => void;
  emotes: {
    [key: string]: string;
  };
  joinServer: (serverId: string) => void;
};

type ChatBoxState = {
  loading: boolean;
  user: r.User;
  channel: r.Channel;
  emotes: {
    [key: string]: string;
  };
};

export default class ChatBox extends React.Component<
  ChatBoxProps,
  ChatBoxState
> {
  constructor(props: ChatBoxProps) {
    super(props);
    this.state = {
      loading: true, //TODO use this lmao
      user: props.user,
      channel: props.channel,
      emotes: {},
    };
    this.handleNewMessage = this.handleNewMessage.bind(this);
  }

  componentWillReceiveProps(props: ChatBoxProps) {
    this.setState({
      user: props.user,
      channel: props.channel,
      emotes: props.emotes,
    });
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
        timestamp: "0",
      });
    };
  }

  render() {
    return (
      <Box id="chatBox" bgcolor="primary.main">
        <Box id="messageList">
          {this.state.channel &&
            Object.values(this.state.channel)
              .sort((a, b) => Number(a.timestamp) - Number(b.timestamp) || 0)
              .map((x, i) =>
                x.invite ? (
                  <Message
                    key={i}
                    message={x}
                    joined={
                      this.state.user.servers &&
                      x.invite.id in this.state.user.servers
                    }
                    joinServer={() =>
                      x.invite && this.props.joinServer(x.invite.id)
                    }
                  />
                ) : (
                  <Message key={i} message={x} />
                )
              )}
        </Box>
        <Box id="newMessageBox">
          <NewMessage
            sendMessage={this.props.sendMessage}
            user={this.state.user}
            emotes={this.state.emotes}
          />
        </Box>
      </Box>
    );
  }
}

export function Emote({ emoteName, url }: { emoteName: string; url: string }) {
  return (
    <Tooltip title={emoteName} arrow placement="top">
      <span className="emoteContainer">
        <img src={url} alt={emoteName} className="emote" />
      </span>
    </Tooltip>
  );
}

function NewMessage({
  emotes,
  user,
  sendMessage,
}: {
  emotes: { [key: string]: string };
  user: r.User;
  sendMessage: (msg: r.Message, file?: File) => void;
}) {
  //handle the submit function
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  function sendMsg() {
    const INVITE_REGEX = /<!invite>(.*?)<!\/invite>/i;
    const EMOTE_REGEX = /<:[a-zA-Z0-9]+:>/gi;
    let messageObj: r.Message = {
      name: user.name,
      userId: user.userId,
      message: message,
      timestamp: "0",
    };

    const match = message.match(INVITE_REGEX);
    if (match) {
      console.log({ match });
      try {
        messageObj.invite = JSON.parse(atob(match[1]));
      } catch (e) {
        console.log(e);
        setMessage("[ERROR] Invite couldn't be parsed!");
        return;
      }
    }

    if (EMOTE_REGEX.test(message)) {
      const emoteList = message.match(EMOTE_REGEX)?.map((x) => x.slice(2, -2));
      let emoteObj: { [key: string]: string } = {};
      emoteList &&
        emoteList.forEach(
          (x) => x in emotes && (() => (emoteObj[x] = emotes[x]))()
        );
      sendMessage({
        ...messageObj,
        emotes: emoteObj,
      });
    } else {
      sendMessage(messageObj);
      setMessage("");
    }
  }
  return (
    <Box className="newMessage">
      {isUploading && (
        <File
          user={user}
          cancel={() => setIsUploading(false)}
          sendMessage={sendMessage}
        />
      )}
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
      <IconButton onClick={() => message.length && sendMsg()}>
        <Send />
      </IconButton>
    </Box>
  );
}
