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
import { useChannel } from "../dataHandler/hooks";
import {
  channelContext,
  currentContext,
  serverContext,
  userContext,
} from "../components/Intermediary";
import { ToTimestamp } from "../dataHandler/miscFunctions";

interface ChatBoxProps {}

export function ChatBox(props: ChatBoxProps) {
  const { channel, messageFunctions, loadedChannel } = useContext(
    channelContext
  );
  const { joinServer, friendFunctions, user } = useContext(userContext);
  const { serverData } = useContext(serverContext);
  const { currentChannel, currentServer } = useContext(currentContext);
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
      void (invite && joinServer && joinServer(invite.id)),
    [user?.userId]
  );

  return (
    <>
      <Backdrop
        open={Boolean(
          currentChannel &&
            !channel &&
            (loadedChannel?.serverId != currentServer ||
              loadedChannel?.channelName != currentChannel)
        )}
        style={{ zIndex: 99999, color: "#fff" }}
      >
        <CircularProgress />
      </Backdrop>

      <div id="chatBox">
        <UserProfile
          friendFunctions={friendFunctions}
          user={user}
          close={() => setShowProfile(null)}
          open={Boolean(showProfile)}
          profileId={showProfile}
        />
        <Box id="messageList">
          {channel && Object.keys(channel).length ? (
            Object.values(channel)
              .slice(-30) //TODO: implement pagination
              .sort((a, b) => Number(a.timestamp) - Number(b.timestamp) || 0)
              .map((x, i) =>
                x.invite ? (
                  <Message
                    id={x.id}
                    key={i}
                    message={x}
                    joined={
                      user
                        ? (user.servers &&
                            user.servers.includes(x.invite.id)) ||
                          false
                        : false
                    }
                    joinServer={() => joinServ(x.invite)}
                    onProfileClick={setProfileId}
                    onMessageDelete={
                      x.userId == user?.userId
                        ? messageFunctions?.delete
                        : undefined
                    }
                  />
                ) : (
                  <Message
                    key={i}
                    id={x.id}
                    message={x}
                    onProfileClick={setProfileId}
                    onMessageDelete={
                      x.userId == user?.userId
                        ? messageFunctions?.delete
                        : undefined
                    }
                  />
                )
              )
          ) : (
            <Message
              key={1}
              id={1}
              message={{
                id: 1,
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
              sendMessage={messageFunctions?.send || null}
              user={user}
              currentChannel={currentChannel}
              emotes={serverData?.emotes || {}}
            />
          </Box>
        )}
      </div>
    </>
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
