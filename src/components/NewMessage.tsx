import * as r from "../reference";
import React, { Component, useRef, useState } from "react";
import { File } from "../extraMenus";
import { IconButton, TextField } from "@material-ui/core";
import { AddPhotoAlternate, InsertEmoticon, Send } from "@material-ui/icons";
import EmotePopper from "./EmotePopper";
import { context, Functions } from "./ContextProvider";

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

export function NewMessage(props: NewPostProps) {
  const [message, setMessage] = useState("");
  const [sendingImage, setSendingImage] = useState(false);
  const [showEmote, setShowEmote] = useState(false);
  const emojiRef = useRef<HTMLButtonElement>(null);
  const { sendMessage } = React.useContext(context).functions;

  const sendMsg = () => {
    const INVITE_REGEX = /<!invite>(.*?)<!\/invite>/i;
    const EMOTE_REGEX = /<:[a-zA-Z0-9]+:>/gi;
    let messageObj: Message = {
      name: props.user.name,
      userId: props.user.userId,
      message,
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
    const emoteList = message.match(EMOTE_REGEX) || [];
    if (emoteList.length) {
      let emoteObj: Emotes = {};
      emoteList &&
        emoteList
          .map((x) => x.slice(2, -2))
          .forEach(
            (x) =>
              x in props.emotes && (() => (emoteObj[x] = props.emotes[x]))()
          );
      sendMessage({
        ...messageObj,
        emotes: emoteObj,
      });
      setMessage("");
    } else {
      sendMessage(messageObj);
      setMessage("");
    }
  };

  return (
    <div className="newMessage">
      {sendingImage && (
        <File
          user={props.user}
          cancel={() => setSendingImage(false)}
          sendMessage={sendMessage}
        />
      )}
      <EmotePopper
        anchor={emojiRef.current}
        open={showEmote}
        emotes={props.emotes}
        onClose={() => setShowEmote(false)}
        onEmoteClick={(emoteName: string) =>
          setMessage(`${message} <:${emoteName}:>`)
        }
      />
      <IconButton onClick={() => setShowEmote(true)} ref={emojiRef}>
        <InsertEmoticon />
      </IconButton>
      <IconButton
        onClick={
          //get file
          () => setSendingImage(true)
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
    </div>
  );
}
