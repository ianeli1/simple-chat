import { Box, Hidden, Drawer, makeStyles, Theme } from "@material-ui/core";
import React, { useRef, useState } from "react";
import { AppToolbar } from "../components/AppToolbar";
import Login, { Invite } from "../extraMenus";

import { ChatBox } from "./ChatBox";
import LeftSidebar from "./LeftSidebar";
import "../css/App.css";
//import { RightSidebar } from "./RightSidebar";
import { Landing } from "./Landing";
import { useServer, useUser } from "../dataHandler/hooks";

function smUp() {
  //stack overflow hack haha
  const width = Math.max(
    document.documentElement.clientWidth,
    window.innerWidth || 0
  );
  return width > 768;
}

export default function App() {
  function openWindow(window: string) {
    //TODO: replace this trash, use dialog/popover
    if (window === "Invite") {
      setInviting(true);
    } else {
      console.log("what??? when did i write this function");
    }
  }
  const [currentServer, setCurrentServer] = useState<null | string>(null);
  const [currentChannel, setCurrentChannel] = useState<null | string>(null);
  const { createServer, joinServer, user, friendFunctions } = useUser();
  const { addEmote, serverData, createChannel } = useServer(
    currentServer || undefined
  );
  const [inviting, setInviting] = useState(false);
  const [showRight, setShowRight] = useState(false);
  const [showLeft, setShowLeft] = useState(smUp());
  const container =
    window !== undefined ? () => window.document.body : undefined;
  const leftSidebar = (
    <LeftSidebar
      openWindow={openWindow}
      {...{
        currentChannel,
        setCurrentChannel,
        currentServer,
        setCurrentServer,
        createServer,
        createChannel,
        serverList: (user && user.servers) || null,
        channelList: (serverData && serverData.channels) || null,
      }}
    />
  );
  return (
    <Box className="Global">
      {inviting && currentServer && (
        <Invite
          serverId={currentServer}
          serverName={serverData?.name || null}
          close={() => setInviting(false)}
        />
      )}
      {!user && <Login />}

      <AppToolbar
        toggleLeft={() => setShowLeft(!showLeft)}
        toggleRight={() => setShowRight(!showRight)}
        {...{ currentServer, currentChannel }}
      />

      <div className={"App"}>
        <Hidden smUp>
          <Drawer
            container={container}
            variant="temporary"
            anchor="left"
            open={showLeft}
            onClose={() => setShowLeft(false)}
            ModalProps={{ keepMounted: true }}
            classes={{ paper: "drawerPaper" }}
          >
            {leftSidebar}
          </Drawer>
        </Hidden>
        <Hidden xsDown>
          <Drawer
            variant="persistent"
            open={showLeft}
            classes={{ paper: "drawerPaper" }}
          >
            {leftSidebar}
          </Drawer>

          <div className={showLeft ? "LeftShow" : "LeftHide"} />
        </Hidden>
        {currentChannel && currentServer ? (
          <ChatBox
            {...{
              currentChannel,
              currentServer,
              joinServer,
              user,
              friendFunctions,
            }}
          />
        ) : (
          <Landing {...{ user, setCurrentServer }} />
        )}
        {/*
          showRight && <RightSidebar /> //idea: on mobile, make the bg of the drawer transparent
        */}
      </div>
    </Box>
  );
}
