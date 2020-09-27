import { Avatar, Typography } from "@material-ui/core";
import React from "react";
import "../css/AvatarNameCombo.css";

interface ANCProps {
  upperText: string;
  lowerText?: string;
  icon?: string;
}

export function AvatarNameCombo(props: ANCProps) {
  return (
    <div className="ANC">
      {props.icon ? (
        <Avatar style={{ height: 50, width: 50 }} src={props.icon} />
      ) : (
        <Avatar style={{ height: 50, width: 50, fontSize: "larger" }}>
          {props.upperText[0]}
        </Avatar>
      )}
      <div className="ANCText">
        <Typography variant="h3">{props.upperText}</Typography>
        <Typography variant="h6">{props.lowerText || " "}</Typography>
      </div>
    </div>
  );
}
