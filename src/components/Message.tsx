import React from "react";
import { BasicMessage } from "./BasicMessage";
import { ImageMessage } from "./ImageMessage";
import InviteMessage from "./InviteMessage";
type MessageProps = {
  key: number;
  message: Message;
  joinServer?: () => void;
  joined?: boolean;
  onProfileClick: (userId: string) => void;
};

//TODO: connect join server + join using context

export function Message(props: MessageProps) {
  const { key, message, joinServer = undefined, joined = false } = props;
  return (
    <div className="Message" key={key}>
      <BasicMessage {...{ message }} onProfileClick={props.onProfileClick} />
      {message.invite && joinServer && (
        <InviteMessage invite={message.invite} {...{ joinServer, joined }} />
      )}
      {message.image && <ImageMessage imageUrl={message.image} />}
    </div>
  );
}
