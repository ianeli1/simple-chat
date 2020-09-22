import { Tooltip } from "@material-ui/core";
import React from "react";

export function Emote({ emoteName, url }: { emoteName: string; url: string }) {
  return (
    <Tooltip title={emoteName} arrow placement="top">
      <span className="emoteContainer">
        <img src={url} alt={emoteName} className="emote" />
      </span>
    </Tooltip>
  );
}
