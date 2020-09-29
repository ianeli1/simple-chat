import { Box } from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";
import { EmoteList } from "../components/EmoteList";
import { Members } from "../components/Members";
import { Profile } from "../components/Profile";
import "../css/rightSidebar.css";

export const a = 1;
/*
function useRightSidebar() {
  const [user, setUser] = useState<User | null>(null);
  const [members, setMembers] = useState<{ [key: string]: User }>({});
  const [emotes, setEmotes] = useState<Emotes>({});
  const curr = state.misc.currentChannel;
  const server = state.misc.currentServer;
  useEffect(() => {
    if (server && state.servers[server]) {
      setMembers(state.servers[server]?.members || {});
    }
    if (curr) {
      setEmotes(state.servers[curr]?.data?.emotes || {}); //TODO: global emotes!!
    } else {
      setEmotes({});
    }
  }, [curr]);

  useEffect(() => {
    const k = state.misc.user;
    if (k) {
      setUser(k);
    } else {
      setUser(null);
    }
  }, [state.misc.user]);

  return { user, members, emotes };
}

export function RightSidebar() {
  const { user, members, emotes } = useRightSidebar();

  return (
    user && (
      <Box className="RightSidebar">
        <Box className="InnerRightSidebar">
          <Profile user={user} signOut={signOut} />
          {members && <Members users={members} />}
          <EmoteList addEmote={addEmote} emotes={emotes} />
        </Box>
      </Box>
    )
  );
}
*/
