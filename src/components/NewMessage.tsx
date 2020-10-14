import React, { useRef, useState } from "react";
import { File } from "../extraMenus";
import { IconButton, TextField } from "@material-ui/core";
import { AddPhotoAlternate, InsertEmoticon, Send } from "@material-ui/icons";
import EmotePopper from "./EmotePopper";
import firebase from "firebase";
/*
TODO: Add inline emote support
TODO: Regex check for emote and invite patterns on every textfield change
*/
interface NewMessageProps {
  sendMessage: ((msg: Message, file?: File | undefined) => void) | null;
  currentChannel: string | null;
  user: User | null;
  emotes: Emotes;
}

export function NewMessage(props: NewMessageProps) {
  const [message, setMessage] = useState("");
  const [sendingImage, setSendingImage] = useState(false);
  const [showEmote, setShowEmote] = useState(false);
  const emojiRef = useRef<HTMLButtonElement>(null);

  const sendMsg = () => {
    if (props.currentChannel && props.user && message.length) {
      const INVITE_REGEX = /<!invite>(.*?)<!\/invite>/i;
      const EMOTE_REGEX = /<:[a-zA-Z0-9]+:>/gi;
      let messageObj: Message = {
        name: props.user.name,
        userId: props.user.userId,
        message,
        timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
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
        props.sendMessage &&
          props.sendMessage({
            ...messageObj,
            emotes: emoteObj,
          });
        setMessage("");
      } else {
        props.sendMessage && props.sendMessage(messageObj);
        setMessage("");
      }
    }
  };

  function updateMessage(message: string) {
    setMessage(message.slice(0, 500));
  }

  return (
    <div className="newMessage">
      {sendingImage && props.user && (
        <File
          user={props.user}
          cancel={() => setSendingImage(false)}
          sendMessage={(message, file) =>
            props.sendMessage && props.sendMessage(message, file)
          }
        />
      )}
      <EmotePopper
        anchor={emojiRef.current}
        open={showEmote}
        emotes={props.emotes}
        onClose={() => setShowEmote(false)}
        onEmoteClick={(emoteName: string) =>
          updateMessage(`${message} <:${emoteName}:>`)
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
        onChange={(e) => updateMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMsg()}
        variant="outlined"
        label="Message"
        autoComplete="off"
      />
      <IconButton onClick={() => message.length && sendMsg()}>
        <Send />
      </IconButton>
    </div>
  );
}
