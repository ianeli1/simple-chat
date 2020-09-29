import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
} from "@material-ui/core";
import { Chat, HorizontalSplit } from "@material-ui/icons";
import React, { useContext, useEffect, useState } from "react";

interface AppToolbarProps {
  toggleLeft: () => void;
  toggleRight: () => void;
  currentChannel: string | null;
  currentServer: string | null;
}
export function AppToolbar(props: AppToolbarProps) {
  return (
    <AppBar position="static" className="AppToolbarParent">
      <Toolbar classes={{ root: "AppToolbar" }}>
        <IconButton edge="start" onClick={props.toggleLeft}>
          <Chat />
        </IconButton>
        <Typography variant="h6" classes={{ root: "ToolbarTitle" }}>
          Simple-Chat
        </Typography>
        {props.currentServer && props.currentChannel && (
          <Box className="ToolbarCurrent">
            <Typography variant="h6">
              {props.currentServer} - #{props.currentChannel}
            </Typography>
          </Box>
        )}
        <div className="ToolbarDummy" />
        <IconButton
          classes={{ root: "ToolbarButtonRight" }}
          onClick={props.toggleRight}
        >
          <HorizontalSplit />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
