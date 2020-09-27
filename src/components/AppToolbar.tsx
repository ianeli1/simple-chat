import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
} from "@material-ui/core";
import { Chat, HorizontalSplit } from "@material-ui/icons";
import React, { useContext, useEffect, useState } from "react";
import { dataContext } from "./Intermediary";

function useChannelChange() {
  const [state] = useContext(dataContext);
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);
  const [currentServer, setCurrentServer] = useState<string | null>(null);
  useEffect(() => {
    setCurrentChannel(null);
    setCurrentServer(state.misc.currentServer);
  }, [state.misc.currentServer]);

  useEffect(() => {
    setCurrentChannel(state.misc.currentChannel);
    setCurrentServer(state.misc.currentServer);
  }, [state.misc.currentChannel]);

  return [currentChannel, currentServer];
}

export function AppToolbar({
  toggleLeft,
  toggleRight,
}: {
  toggleLeft: () => void;
  toggleRight: () => void;
}) {
  const [currentChannel, currentServer] = useChannelChange();

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
              {currentServer} - #{currentChannel}
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
