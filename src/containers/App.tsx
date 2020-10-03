import {
  Box,
  Hidden,
  Drawer,
  makeStyles,
  Theme,
  Fade,
} from "@material-ui/core";
import React, { useContext, useRef, useState } from "react";
import { AppToolbar } from "../components/AppToolbar";
import Login, { Invite } from "../extraMenus";

import { ChatBox } from "./ChatBox";
import LeftSidebar from "./LeftSidebar";
import "../css/App.css";
//import { RightSidebar } from "./RightSidebar";
import { Landing } from "./Landing";
import { RightSidebar } from "./RightSidebar";
import { currentContext, userContext } from "../components/Intermediary";

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
  const [inviting, setInviting] = useState(false);
  const [showRight, setShowRight] = useState(false);
  const [showLeft, setShowLeft] = useState(smUp());
  const { currentServer, currentChannel } = useContext(currentContext);
  const { user } = useContext(userContext);
  const container =
    window !== undefined ? () => window.document.body : undefined;
  const leftSidebar = <LeftSidebar openWindow={openWindow} />;
  return (
    <Box className="Global">
      {inviting && currentServer && <Invite close={() => setInviting(false)} />}
      <Fade
        in={!user}
        timeout={500}
        style={{ transitionDelay: !user ? "0" : "200ms" }}
        unmountOnExit
      >
        <div>
          <Login />
        </div>
      </Fade>

      <AppToolbar
        toggleLeft={() => setShowLeft(!showLeft)}
        toggleRight={() => setShowRight(!showRight)}
        {...{ currentServer, currentChannel }}
      />
      <Fade in={!!user} timeout={500} style={{ transitionDelay: "200ms" }}>
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

          {currentChannel && currentServer ? <ChatBox /> : <Landing />}

          {
            showRight && <RightSidebar /> //idea: on mobile, make the bg of the drawer transparent
          }
        </div>
      </Fade>
    </Box>
  );
}
