import * as r from "../reference";
import React, { Component } from "react";
import { File } from "../extraMenus";
import { IconButton, TextField } from "@material-ui/core";
import { AddPhotoAlternate, InsertEmoticon, Send } from "@material-ui/icons";
import EmotePopper from "./EmotePopper";

interface NewPostProps {
  emotes: Emotes;
  user: User;
  sendMessage: typeof r.Handler.prototype.sendMessage;
}

interface NewPostState {
  user: User;
  message: string;
  isUploading: boolean;
  showEmote: boolean;
}
/*
TODO: Add inline emote support
TODO: Regex check for emote and invite patterns on every textfield change
*/
export class NewMessage extends Component<NewPostProps, NewPostState> {
  emojiRef: React.RefObject<HTMLButtonElement>;
  constructor(props: NewPostProps) {
    super(props);
    this.state = {
      user: props.user,
      message: "",
      isUploading: false,
      showEmote: false,
    };
    this.sendMsg = this.sendMsg.bind(this);
    this.emojiRef = React.createRef();
  }

  sendMsg() {
    const INVITE_REGEX = /<!invite>(.*?)<!\/invite>/i;
    const EMOTE_REGEX = /<:[a-zA-Z0-9]+:>/gi;
    let messageObj: Message = {
      name: this.state.user.name,
      userId: this.state.user.userId,
      message: this.state.message,
      timestamp: "0",
    };

    const match = this.state.message.match(INVITE_REGEX);
    if (match) {
      console.log({ match });
      try {
        messageObj.invite = JSON.parse(atob(match[1]));
      } catch (e) {
        console.log(e);
        this.setState({ message: "[ERROR] Invite couldn't be parsed!" });
        return;
      }
    }

    if (EMOTE_REGEX.test(this.state.message)) {
      const emoteList = this.state.message
        .match(EMOTE_REGEX)
        ?.map((x) => x.slice(2, -2));
      let emoteObj: { [key: string]: string } = {};
      emoteList &&
        emoteList.forEach(
          (x) =>
            x in this.props.emotes &&
            (() => (emoteObj[x] = this.props.emotes[x]))()
        );
      this.props.sendMessage({
        ...messageObj,
        emotes: emoteObj,
      });
      this.setState({ message: "" });
    } else {
      this.props.sendMessage(messageObj);
      this.setState({ message: "" });
    }
  }

  render() {
    return (
      <div className="newMessage">
        {this.state.isUploading && (
          <File
            user={this.state.user}
            cancel={() => this.setState({ isUploading: false })}
            sendMessage={this.props.sendMessage}
          />
        )}
        <EmotePopper
          anchor={this.emojiRef.current}
          open={this.state.showEmote}
          emotes={this.props.emotes}
          onClose={() => this.setState({ showEmote: false })}
          onEmoteClick={(emoteName: string) =>
            this.setState({
              message: this.state.message + "<:" + emoteName + ":>",
            })
          }
        />
        <IconButton
          onClick={() => this.setState({ showEmote: !this.state.showEmote })}
          ref={this.emojiRef}
        >
          <InsertEmoticon />
        </IconButton>
        <IconButton
          onClick={
            //get file
            () => this.setState({ isUploading: true })
          }
        >
          <AddPhotoAlternate />
        </IconButton>
        <TextField
          id="messageInput"
          style={{ flexGrow: 1 }}
          value={this.state.message}
          onChange={(e) => this.setState({ message: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && this.sendMsg()}
          variant="outlined"
          label="Message"
        />
        <IconButton onClick={() => this.state.message.length && this.sendMsg()}>
          <Send />
        </IconButton>
      </div>
    );
  }
}
