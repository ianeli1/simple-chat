import { Typography } from "@material-ui/core";
import React, { useContext } from "react";
import { AvatarNameCombo } from "../AvatarNameCombo";
import { userContext } from "../Intermediary";

export function ProfileSettings() {
  const { user } = useContext(userContext);

  return (
    <>
      <div className="SettingsElementContainer">
        <AvatarNameCombo
          upperText={user?.name || "unk"}
          lowerText={user?.userId || "unk"}
          icon={user?.icon || undefined}
        />
      </div>

      <div className="SettingsElementContainer">
        <Typography variant="h3" gutterBottom>
          Your friends
        </Typography>
      </div>
    </>
  );
}
