import {
  Box,
  ButtonGroup,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
} from "@material-ui/core";
import React, { useState } from "react";
import { Popup } from "./ServerList";

export function ChannelList({
  channelList,
  currentChannel,
  changeChannel,
  user,
  createChannel,
  openWindow,
}: {
  channelList: Array<string>;
  currentChannel: string | null;
  changeChannel: (newChannel: string) => void;
  user: User;
  createChannel: (channel: string) => void;
  openWindow: (window: string) => void;
}) {
  const [creatingChannel, setCreatingChannel] = useState<
    { name: string } | false
  >(false);
  return (
    <Box id="channelSelection">
      {(channelList.length && (
        <ButtonGroup size="small" variant="text">
          <Button onClick={() => setCreatingChannel({ name: "" })}>
            Channel
          </Button>
          <Button onClick={() => openWindow("Invite")}>Invite</Button>
          <Button>Leave</Button>
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

      {creatingChannel && (
        <Popup
          title="Create a new channel"
          desc="You are creating a new channel idk what to write here"
          close={() => setCreatingChannel(false)}
        >
          <Box>
            <TextField
              id="NewChannelName"
              value={creatingChannel.name}
              onChange={(e) =>
                setCreatingChannel({
                  name: e.target.value,
                })
              }
              variant="outlined"
              label="Name"
            />
            <Button
              onClick={() => {
                //todo add
                createChannel(creatingChannel.name);
                setCreatingChannel(false);
              }}
            >
              Create
            </Button>
          </Box>
        </Popup>
      )}
    </Box>
  );
}
