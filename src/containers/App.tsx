import { Box, Hidden, Drawer, makeStyles, Theme } from "@material-ui/core";
import React, { useRef, useState } from "react";
import { AppToolbar } from "../components/AppToolbar";
import { dataContext } from "../components/Intermediary";
import Login, { Invite } from "../extraMenus";
import { RightSidebar } from "../rightSidebar";
import { ChatBox } from "./ChatBox";
import LeftSidebar from "./LeftSidebar";
import "../css/App.css";

export default function App() {
  function openWindow(window: string) {
    //TODO: replace this trash, use dialog/popover
    if (window === "Invite") {
      setInviting(true);
    } else {
      console.log("what??? when did i write this function");
    }
  }
  const [state, dispatch] = React.useContext(dataContext);
  const [inviting, setInviting] = useState(false);
  const [showRight, setShowRight] = useState(false);
  const [showLeft, setShowLeft] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);
  const container =
    window !== undefined ? () => window.document.body : undefined;
  const leftSidebar = state.misc.user && (
    <LeftSidebar openWindow={openWindow} />
  );
  return (
    <Box className="Global">
      {inviting && state.misc.currentServer && (
        <Invite close={() => setInviting(false)} />
      )}
      {!state.misc.user && <Login />}

      <AppToolbar
        toggleLeft={() => setShowLeft(!showLeft)}
        toggleRight={() => setShowRight(!showRight)}
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
        <ChatBox />
        {/*
          showRight && <RightSidebar /> //idea: on mobile, make the bg of the drawer transparent
        */}
      </div>
    </Box>
  );
}
