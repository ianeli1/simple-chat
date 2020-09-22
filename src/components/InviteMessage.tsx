import { Avatar, Typography, Button } from "@material-ui/core";
import React from "react";
import * as r from "../reference";

type InviteMessageProps = {
  invite: r.Invite;
  joined: boolean;
  joinServer: () => void;
};
//TODO: connect joinServer using context
export default function InviteMessage({
  invite,
  joinServer,
  joined,
}: InviteMessageProps) {
  return (
    <div className="MessageInvite">
      <Avatar>{invite.name[0]}</Avatar>
      <Typography variant="h5">{invite.name}</Typography>
      {joinServer && invite && (
        <Button
          variant="contained"
          onClick={() => joinServer()}
          disabled={joined}
        >
          {joined ? "Joined" : "Join"}
        </Button>
      )}
    </div>
  );
}
