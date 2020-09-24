import { Box, Hidden, Drawer } from "@material-ui/core";
import React, { useState } from "react";
import { AppToolbar } from "../components/AppToolbar";
import { context } from "../components/ContextProvider";
import Login, { Invite } from "../extraMenus";
import { RightSidebar } from "../rightSidebar";
import ChatBox from "./ChatBox";
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
  const { state, functions } = React.useContext(context);
  const [inviting, setInviting] = useState(false);
  const [showRight, setShowRight] = useState(false);
  const [showLeft, setShowLeft] = useState(false);
  const data =
    state.currentServer && //WTFFFFFFF
    state.servers[state.currentServer] &&
    state.servers[state.currentServer].data;
  const members =
    state.currentServer &&
    state.servers[state.currentServer] &&
    state.servers[state.currentServer].members;
  const currChannel =
    state.currentChannel &&
    state.currentServer &&
    state.servers[state.currentServer] &&
    state.servers[state.currentServer].channels[state.currentChannel];
  const container =
    window !== undefined ? () => window.document.body : undefined;
  const leftSidebar = state.user && <LeftSidebar openWindow={openWindow} />;
  return (
    <Box className="Global">
      {inviting && data && state.currentServer && (
        <Invite
          id={state.currentServer}
          name={data.name}
          close={() => setInviting(false)}
        />
      )}
      {!state.user && (
        <Login signIn={functions.signIn} signUp={functions.createUser} />
      )}
      {state.user && (
        <AppToolbar
          toggleLeft={() => setShowLeft(!showLeft)}
          toggleRight={() => setShowRight(!showRight)}
        />
      )}
      <Box className="App">
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
        </Hidden>
        {state.user && currChannel && (
          <ChatBox
            joinServer={functions.joinServer}
            user={state.user}
            emotes={(data && data.emotes) || {} /*TODO: use global emotes*/}
            channel={currChannel}
            sendMessage={functions.sendMessage}
          />
        )}
        {state.user &&
          data &&
          members &&
          showRight && ( //idea: on mobile, make the bg of the drawer transparent
            <RightSidebar
              user={state.user}
              members={members}
              emotes={(data && data.emotes) || {}}
              addEmote={functions.addEmote}
              signOut={functions.signOut}
              debug={() => void null}
            />
          )}
      </Box>
    </Box>
  );
}
