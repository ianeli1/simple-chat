import { Tooltip } from "@material-ui/core";
import React from "react";

export function Emote({
  emoteName,
  url,
  onClick,
}: {
  emoteName: string;
  url: string;
  onClick?: (emoteName: string) => void;
}) {
  return (
    <Tooltip title={emoteName} arrow placement="top">
      <span
        className="emoteContainer"
        onClick={
          () =>
            onClick &&
            onClick(
              emoteName
            ) /*TODO: handle this correctly with React.useCallback?*/
        }
      >
        <img src={url} alt={emoteName} className="emote" />
      </span>
    </Tooltip>
  );
}
