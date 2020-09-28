import React, { useCallback } from "react";
import { Avatar, Tooltip } from "@material-ui/core";
import { keys } from "@material-ui/core/styles/createBreakpoints";
import "../css/AvatarScroller.css";

export type ASElement = {
  key: string;
  name: string;
  icon?: string;
};

type AvatarScrollerProps = {
  size: number;
  elements: ASElement[];
  onElementClick: (key: string) => void;
};

export function AvatarScroller(props: AvatarScrollerProps) {
  const onElementClick = useCallback(props.onElementClick, []);
  const style = {
    width: props.size,
    height: props.size,
    fontSize: props.size / 2,
  };
  return (
    <div className="AvatarScroller">
      {props.elements.length > 0 &&
        props.elements.map(({ key, name, icon }) => (
          <div onClick={() => onElementClick(key)} key={key} style={style}>
            <Tooltip title={name}>
              {icon ? (
                <Avatar src={icon} style={style} />
              ) : (
                <Avatar style={style}>{name[0]}</Avatar>
              )}
            </Tooltip>
          </div>
        ))}
    </div>
  );
}
