import * as r from "../reference";
import React, {
  Component,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { File } from "../extraMenus";
import { IconButton, TextField } from "@material-ui/core";
import { AddPhotoAlternate, InsertEmoticon, Send } from "@material-ui/icons";
import EmotePopper from "./EmotePopper";
import { dataContext, sendMessage } from "./Intermediary";

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

function useNewMessage() {
  const [state] = useContext(dataContext);
  const [user, setUser] = useState<User | null>(null);
  const [emotes, setEmotes] = useState<Emotes>({});
  const [currentChannel, setCurrentChannel] = useState("");
  const curr = state.misc.currentChannel;
  useEffect(() => {
    const k = state.misc.user;
    if (k) {
      setUser(k);
    } else {
      setUser(null);
    }
  }, [state.misc.user]);

  useEffect(() => {
    const curr = state.misc.currentServer;
    if (curr) {
      setEmotes(state.servers[curr]?.data?.emotes || {}); //TODO: global emotes!!
    } else {
      setEmotes({});
    }
  }, [curr]);

  useEffect(() => {
    if (curr) {
      setCurrentChannel(curr);
    } else {
      setCurrentChannel("");
    }
  }, [curr]);

  return { user, emotes, currentChannel };
}

export function NewMessage() {
  const [message, setMessage] = useState("");
  const [sendingImage, setSendingImage] = useState(false);
  const [showEmote, setShowEmote] = useState(false);
  const emojiRef = useRef<HTMLButtonElement>(null);
  const { user, emotes, currentChannel } = useNewMessage();

  const sendMsg = () => {
    if (currentChannel && user) {
      const INVITE_REGEX = /<!invite>(.*?)<!\/invite>/i;
      const EMOTE_REGEX = /<:[a-zA-Z0-9]+:>/gi;
      let messageObj: Message = {
        name: user.name,
        userId: user.userId,
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
            .forEach((x) => x in emotes && (() => (emoteObj[x] = emotes[x]))());
        sendMessage({
          ...messageObj,
          emotes: emoteObj,
        });
        setMessage("");
      } else {
        sendMessage(messageObj);
        setMessage("");
      }
    }
  };

  return (
    <div className="newMessage">
      {sendingImage && user && (
        <File
          user={user}
          cancel={() => setSendingImage(false)}
          sendMessage={(message, file) => sendMessage(message, file)}
        />
      )}
      <EmotePopper
        anchor={emojiRef.current}
        open={showEmote}
        emotes={emotes}
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
        autoComplete="off"
      />
      <IconButton onClick={() => message.length && sendMsg()}>
        <Send />
      </IconButton>
    </div>
  );
}
