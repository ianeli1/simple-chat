import { Box, Avatar, Typography, Button } from "@material-ui/core";
import React from "react";
import { Widget } from "./Widget";

export function Profile(props: { user: User; signOut: () => void }) {
  return (
    <Widget title="Profile">
      <Box className="Profile">
        <Box className="MessageName">
          {props.user.icon ? (
            <Avatar src={props.user.icon} alt={props.user.name[0]} />
          ) : (
            <Avatar>{props.user.name[0]}</Avatar>
          )}

          <Typography variant="h5">{props.user.name}</Typography>
        </Box>
        <Button
          onClick={
            () => props.signOut() //Todo: implement
          }
        >
          Log Out
        </Button>

        <Typography>{props.user.name}</Typography>
      </Box>
    </Widget>
  );
}
