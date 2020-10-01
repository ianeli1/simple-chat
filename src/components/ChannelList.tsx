import {
  Box,
  ButtonGroup,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
} from "@material-ui/core";
import React from "react";

export function ChannelList({
  channelList,
  currentChannel,
  changeChannel,
  openWindow,
}: {
  channelList: Array<string>;
  currentChannel: string | null;
  changeChannel: (newChannel: string) => void;
  openWindow: (window: string) => void;
}) {
  return (
    <Box id="channelSelection">
      {(channelList.length && (
        <ButtonGroup size="small" variant="text">
          <Button onClick={() => openWindow("Invite")}>Invite</Button>
        </ButtonGroup>
      )) ||
        ""}
      {(channelList.length && (
        <List component="nav" aria-label="main channels">
          {channelList.map((x) => (
            <ListItem
              button
              selected={currentChannel ? currentChannel === x : false}
              onClick={() => changeChannel(x)}
            >
              <ListItemText primary={"#" + x} />
            </ListItem>
          ))}
        </List>
      )) ||
        ""}
    </Box>
  );
}
