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
                    joinServer={
                      (this.state.user.servers &&
                        x.invite.id in this.state.user.servers &&
                        (() =>
                          x.invite && this.props.joinServer(x.invite.id))) ||
                      undefined
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
    <span className="emoteContainer">
      <img src={url} alt={emoteName} className="emote" />
    </span>
  );
}

function Message({
  key,
  message,
  joinServer,
}: {
  key: number;
  message: r.Message;
  joinServer?: () => void;
}) {
  return (
    <Box className="Message" key={key}>
      <Box className="BasicMessage">
        <Tooltip
          title={String(new Date(Number(message.timestamp.slice(0, -1))))
            .split(" ")
            .slice(0, 5)
            .join(" ")}
        >
          <Box className="MessageName">
            <Avatar>{message.name[0]}</Avatar>
            <Typography variant="h5">{message.name}</Typography>
          </Box>
        </Tooltip>

        {message.emotes ? (
          <Box>
            {() => {
              const regex = /<:[a-zA-Z0-9]+:>/gi;
              let emoteList = message.message.match(regex) || [];
              return message.message
                .split(regex)
                .map((x) => (x ? x : emoteList.shift()))
                .map((x) => {
                  if (x) {
                    if (regex.test(x))
                      return (
                        <Emote
                          emoteName={x.slice(2, -2)}
                          url={
                            (message.emotes &&
                              message.emotes[x.slice(2, -2)]) ||
                            ""
                          }
                        />
                      );
                    else return <p>{x}</p>;
                  }
                });
            }}
          </Box>
        ) : (
          <Typography variant="body1">{message.message}</Typography>
        )}
      </Box>
      {message.image && (
        <Box className="MessageImage">
          <img
            className="MessageImagePrim"
            src={message.image}
            alt="[Loading...]"
          />
        </Box>
      )}
      {message.invite && (
        <Box className="MessageInvite">
          <Avatar>{message.invite.name[0]}</Avatar>
          <Typography variant="h5">{message.invite.name}</Typography>
          {joinServer && message.invite ? (
            <Button variant="contained" onClick={() => joinServer()}>
              Join
            </Button>
          ) : (
            <Button variant="contained" disabled={true}>
              Joined
            </Button>
          )}
        </Box>
      )}
    </Box>
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
    const regex = /<:[a-zA-Z0-9]+:>/gi;
    if (regex.test(message)) {
      const emoteList = message.match(regex)?.map((x) => x.slice(2, -2));
      let emoteObj: { [key: string]: string } = {};
      emoteList &&
        emoteList.forEach(
          (x) => x in emotes && (() => (emoteObj[x] = emotes[x]))()
        );
      sendMessage({
        name: user.name,
        userId: user.userId,
        message,
        timestamp: "0",
        emotes: emoteObj,
      });
    } else {
      sendMessage({
        name: user.name,
        userId: user.userId,
        message: message,
        timestamp: "0",
      });
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
