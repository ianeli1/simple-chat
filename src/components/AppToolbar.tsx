import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
} from "@material-ui/core";
import { Chat, HorizontalSplit } from "@material-ui/icons";
import React, { useContext } from "react";
import { context } from "./ContextProvider";

export function AppToolbar({
  toggleLeft,
  toggleRight,
}: {
  toggleLeft: () => void;
  toggleRight: () => void;
}) {
  const { lastServer: currentServer, lastChannel: currentChannel } = useContext(
    context
  ).state;

  return (
    <AppBar position="static">
      <Toolbar classes={{ root: "AppToolbar" }}>
        <IconButton edge="start" onClick={toggleLeft}>
          <Chat />
        </IconButton>
        <Typography variant="h6" classes={{ root: "ToolbarTitle" }}>
          Simple-Chat
        </Typography>
        {currentServer && currentChannel && (
          <Box className="ToolbarCurrent">
            <Typography variant="h6">
              {currentServer} - #{currentChannel.channel}
            </Typography>
          </Box>
        )}
        <div className="ToolbarDummy" />
        <IconButton
          classes={{ root: "ToolbarButtonRight" }}
          onClick={toggleRight}
        >
          <HorizontalSplit />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
