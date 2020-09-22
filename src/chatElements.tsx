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
import "./chatElements.css";
import { Message } from "./components/Message";
import { NewMessage } from "./components/NewMessage";

type ChatBoxProps = {
  user: User;
  channel: Channel;
  sendMessage: (msg: Message, file?: File) => void;
  emotes: {
    [key: string]: string;
  };
  joinServer: (serverId: string) => void;
};

type ChatBoxState = {
  loading: boolean;
  user: User;
  channel: Channel;
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
