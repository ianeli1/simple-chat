import { Avatar, Typography } from "@material-ui/core";
import React from "react";
import "../css/AvatarNameCombo.css";

interface ANCProps {
  upperText: string;
  lowerText?: string;
  icon?: string;
  size?: number;
}

export function AvatarNameCombo(props: ANCProps) {
  const size = props.size ? props.size : 50;
  return (
    <div className="ANC">
      {props.icon ? (
        <Avatar style={{ height: size, width: size }} src={props.icon} />
      ) : (
        <Avatar style={{ height: size, width: size }}>
          {props.upperText[0]}
        </Avatar>
      )}
      <div className="ANCText">
        <Typography variant={size >= 50 ? "h3" : "h6"}>
          {props.upperText}
        </Typography>
        <Typography variant={size >= 50 ? "h6" : "body2"}>
          {props.lowerText || " "}
        </Typography>
      </div>
    </div>
  );
}
