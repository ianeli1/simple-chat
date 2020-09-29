import { Box } from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";
import { EmoteList } from "../components/EmoteList";
import { Members } from "../components/Members";
import { Profile } from "../components/Profile";
import "../css/rightSidebar.css";
import { useMembers } from "../dataHandler/hooks";
import { createAddEmote, signOut } from "../dataHandler/stateLessFunctions";

export const a = 1;

interface RightSidebarProps {
  user: User | null;
  emotes: Emotes;
  addEmote: ReturnType<typeof createAddEmote> | null;
  currentServer: string | null;
}

export function RightSidebar(props: RightSidebarProps) {
  const { members } = useMembers(props.currentServer || undefined);

  return (
    props.user && (
      <Box className="RightSidebar">
        <Box className="InnerRightSidebar">
          <Profile user={props.user} signOut={signOut} />
          {members && <Members users={members} />}
          <EmoteList
            addEmote={props.addEmote || (() => null)}
            emotes={props.emotes}
          />
        </Box>
      </Box>
    )
  );
}
