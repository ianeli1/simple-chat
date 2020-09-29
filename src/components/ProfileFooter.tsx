import { IconButton } from "@material-ui/core";
import { Settings } from "@material-ui/icons";
import React, { useContext } from "react";
import { AvatarNameCombo } from "./AvatarNameCombo";
import { userContext } from "./Intermediary";
import "../css/ProfileFooter.css";

interface ProfileFooterProps {
  onSettings: () => void;
}

export function ProfileFooter(props: ProfileFooterProps) {
  const { user } = useContext(userContext);
  return (
    <div className="ProfileFooterContainer">
      <AvatarNameCombo
        upperText={user?.name || ""}
        lowerText={user?.status || "unknown"}
        size={40}
      />
      <div style={{ flexGrow: 1 }} />
      <IconButton onClick={() => props.onSettings()}>
        <Settings style={{ fontSize: "large" }} />
      </IconButton>
    </div>
  );
}
