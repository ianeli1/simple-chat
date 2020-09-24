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
    state.lastServer && //WTFFFFFFF
    state.servers[state.lastServer] &&
    state.servers[state.lastServer].data;
  const members =
    state.lastServer &&
    state.servers[state.lastServer] &&
    state.servers[state.lastServer].members;
  console.log(JSON.stringify(state, null, 2));
  const currChannel =
    state.lastChannel && state.servers[state.lastChannel.server].channels
      ? state.servers[state.lastChannel.server].channels[
          state.lastChannel.channel
        ]
      : null;

  const container =
    window !== undefined ? () => window.document.body : undefined;
  const leftSidebar = state.user && <LeftSidebar openWindow={openWindow} />;
  return (
    <Box className="Global">
      {inviting && data && state.lastServer && (
        <Invite
          id={state.lastServer}
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
            sendMessage={(message, file) =>
              state.lastChannel &&
              functions.sendMessage(
                state.lastChannel.server,
                state.lastChannel.channel,
                message,
                file
              )
            }
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
              addEmote={(emoteName, emote) =>
                state.lastServer &&
                functions.addEmote(state.lastServer, emoteName, emote)
              }
              signOut={functions.signOut}
              debug={() => void null}
            />
          )}
      </Box>
    </Box>
  );
}
