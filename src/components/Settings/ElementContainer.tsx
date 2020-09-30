import { Typography } from "@material-ui/core";
import React from "react";

interface ElementContainerProps {
  title: string;
  children: React.ReactNode;
}

export function ElementContainer(props: ElementContainerProps) {
  return (
    <div className="SettingsElementContainer">
      <Typography variant="h5" gutterBottom className="SettingsElementSubtitle">
        {props.title || ""}
      </Typography>
      <div className="SettingsElementContainerInner">{props.children}</div>
    </div>
  );
}
