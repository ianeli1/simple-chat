import React from "react";
import { Avatar, Tooltip } from "@material-ui/core";
import { keys } from "@material-ui/core/styles/createBreakpoints";

type AvatarScrollerProps = {
  size: number;
  elements: {
    key: string;
    name: string;
    icon?: string;
  }[];
  onElementClick: (key: string) => void;
};

export function AvatarScroller(props: AvatarScrollerProps) {
  return (
    <div className="AvatarScroller">
      {props.elements.length > 0 &&
        props.elements.map(({ key, name, icon }) => (
          <div onClick={() => props.onElementClick(key)} key={key}>
            <Tooltip title={name}>
              {icon ? <Avatar src={icon} /> : <Avatar>{name[0]}</Avatar>}
            </Tooltip>
          </div>
        ))}
    </div>
  );
}
