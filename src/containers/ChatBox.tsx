import React from "react";
import { Box } from "@material-ui/core";
import "../css/chatElements.css";
import { Message } from "../components/Message";
import { NewMessage } from "../components/NewMessage";

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
  endMessage: HTMLDivElement | null;
  constructor(props: ChatBoxProps) {
    super(props);
    this.state = {
      loading: true, //TODO use this lmao
      user: props.user,
      channel: props.channel,
      emotes: {},
    };
    this.endMessage = null;
    this.handleNewMessage = this.handleNewMessage.bind(this);
  }

  componentWillReceiveProps(props: ChatBoxProps) {
    this.setState(
      {
        user: props.user,
        channel: props.channel,
        emotes: props.emotes,
      },
      () =>
        this.endMessage &&
        this.endMessage.scrollIntoView({ behavior: "smooth" })
    );
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
          <div style={{ float: "left" }} ref={(el) => (this.endMessage = el)} />
        </Box>
        {Object.keys(this.state.channel).length && (
          <Box id="newMessageBox">
            <NewMessage
              sendMessage={this.props.sendMessage}
              user={this.state.user}
              emotes={this.state.emotes}
            />
          </Box>
        )}
      </Box>
    );
  }
}
