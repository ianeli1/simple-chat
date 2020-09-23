import { Tooltip } from "@material-ui/core";
import React from "react";

export function Emote(props: {
  emoteName: string;
  url: string;
  onClick?: (emoteName: string) => void;
  ref?: React.MutableRefObject<HTMLSpanElement | null>;
}) {
  return (
    <Tooltip title={props.emoteName} arrow placement="top">
      <span
        className="emoteContainer"
        tabIndex={0}
        ref={props.ref}
        onClick={
          () =>
            props.onClick &&
            props.onClick(
              props.emoteName
            ) /*TODO: handle this correctly with React.useCallback?*/
        }
      >
        <img src={props.url} alt={props.emoteName} className="emote" />
      </span>
    </Tooltip>
  );
}
