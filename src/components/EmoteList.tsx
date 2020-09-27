import { Box, Button } from "@material-ui/core";
import React, { useState } from "react";
import { AddEmote } from "../extraMenus";
import { Emote } from "./Emote";
import { Widget } from "./Widget";

export function EmoteList({
  emotes,
  addEmote,
}: {
  emotes: { [key: string]: string };
  addEmote: (emoteName: string, emote: File) => void;
}) {
  const [add, setAdd] = useState<boolean>(false);
  return (
    <Widget title="Emote list">
      <Box>
        {Object.keys(emotes).map((key) => (
          <Box>
            <Emote emoteName={key} url={emotes[key]} />
            {"<:" + key + ":>"}
          </Box>
        ))}
        <Button onClick={() => setAdd(true)} variant="contained">
          Add
        </Button>
        {add && <AddEmote addEmote={addEmote} close={() => setAdd(false)} />}
      </Box>
    </Widget>
  );
}
