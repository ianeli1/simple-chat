import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { Backdrop, Box, CircularProgress } from "@material-ui/core";
import "../css/chatElements.css";
import { Message } from "../components/Message";
import { NewMessage } from "../components/NewMessage";
import { UserProfile } from "../components/UserProfile";
import {
  createFriendRequestFuncs,
  createJoinServer,
  ToTimestamp,
} from "../dataHandler/stateLessFunctions";
import { useChannel } from "../dataHandler/hooks";

interface ChatBoxProps {
  currentServer: string;
  currentChannel: string;
  joinServer: ReturnType<typeof createJoinServer> | null;
  user: User | null;
  emotes: Emotes;
  friendFunctions: ReturnType<typeof createFriendRequestFuncs> | null;
}

export function ChatBox(props: ChatBoxProps) {
  const { channel, sendMessage } = useChannel(
    props.currentServer,
    props.currentChannel
  );
  const [showProfile, setShowProfile] = useState<null | string>(null);
  const endMessage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endMessage.current?.scrollIntoView({ behavior: "smooth" });
  });
  const setProfileId = useCallback((userId: string) => setShowProfile(userId), [
    setShowProfile,
  ]);
  const joinServ = useCallback(
    (invite: Invite | undefined) =>
      void (invite && props.joinServer && props.joinServer(invite.id)),
    [props.currentServer]
  );

  return (
    <Box id="chatBox" bgcolor="primary.main">
      <UserProfile
        friendFunctions={props.friendFunctions}
        user={props.user}
        close={() => setShowProfile(null)}
        open={Boolean(showProfile)}
        profileId={showProfile}
      />
      <Box id="messageList">
        {channel && Object.keys(channel).length ? (
          Object.values(channel)
            .sort((a, b) => Number(a.timestamp) - Number(b.timestamp) || 0)
            .map((x, i) =>
              x.invite ? (
                <Message
                  key={i}
                  message={x}
                  joined={
                    props.user
                      ? (props.user.servers &&
                          props.user.servers.includes(x.invite.id)) ||
                        false
                      : false
                  }
                  joinServer={() => joinServ(x.invite)}
                  onProfileClick={setProfileId}
                />
              ) : (
                <Message key={i} message={x} onProfileClick={setProfileId} />
              )
            )
        ) : (
          <Message
            key={1}
            message={{
              name: "SYSTEM",
              message: "There's no messages here",
              timestamp: ToTimestamp(new Date(0)),
            }}
            onProfileClick={() => void null}
          />
        )}
        <div style={{ float: "left" }} ref={endMessage} />
      </Box>
      {channel && Object.keys(channel).length && (
        <Box id="newMessageBox">
          <NewMessage
            {...{ sendMessage }}
            user={props.user}
            currentChannel={props.currentChannel}
            emotes={props.emotes}
          />
        </Box>
      )}
    </Box>
  );
}
/*
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
      channel: props.channel || {},
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

function ChatBox*/
