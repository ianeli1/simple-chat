import { Box } from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";
import { EmoteList } from "../components/EmoteList";
import {
  currentContext,
  serverContext,
  userContext,
} from "../components/Intermediary";
import { Members } from "../components/Members";
import { Profile } from "../components/Profile";
import "../css/rightSidebar.css";
import { useMembers } from "../dataHandler/hooks";
import { signOut } from "../dataHandler/miscFunctions";

export const a = 1;

interface RightSidebarProps {}

export function RightSidebar(props: RightSidebarProps) {
  //TODO: useMemo
  const { user } = useContext(userContext);
  const { emoteFunctions, serverData } = useContext(serverContext);
  const { currentServer } = useContext(currentContext);
  const { members } = useMembers(currentServer || undefined);

  return (
    user && (
      <Box className="RightSidebar">
        <Box className="InnerRightSidebar">
          <Profile user={user} signOut={signOut} />
          {members && <Members users={members} />}
          <EmoteList
            addEmote={emoteFunctions?.add || (() => null)}
            emotes={serverData?.emotes || {}}
          />
        </Box>
      </Box>
    )
  );
}
