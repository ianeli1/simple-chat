import {
  Box,
  ButtonGroup,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
  ListItemAvatar,
  Avatar,
} from "@material-ui/core";
import React from "react";

export function ChannelList({
  channelList,
  currentChannel,
  changeChannel,
  openWindow,
  title,
}: {
  channelList: ASElement[];
  currentChannel: string | null;
  changeChannel: (newChannel: string) => void;
  openWindow: (window: string) => void;
  title: string | null;
}) {
  return (
    <Box id="channelSelection">
      {title && (
        <div className="ChannelListTitle">
          <Typography variant="h6">{title}</Typography>
        </div>
      )}
      {(channelList.length && (
        <List
          component="nav"
          aria-label="main channels"
          style={{ flexGrow: 1 }}
        >
          {channelList.map(({ key, name, icon }) => (
            <ListItem
              key={key}
              button
              selected={currentChannel ? currentChannel === name : false}
              onClick={() => changeChannel(key)}
            >
              {icon && (
                <ListItemAvatar>
                  <Avatar src={icon} alt={icon[0]} />
                </ListItemAvatar>
              )}
              <ListItemText primary={"#" + key} />
            </ListItem>
          ))}
        </List>
      )) ||
        ""}
      {(channelList.length && (
        <ButtonGroup size="small" variant="text">
          <Button onClick={() => openWindow("Invite")}>Invite</Button>
        </ButtonGroup>
      )) ||
        ""}
    </Box>
  );
}
