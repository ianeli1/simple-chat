import { IconButton, Typography } from "@material-ui/core";
import React, { useContext, useState } from "react";
import { AvatarNameCombo } from "../AvatarNameCombo";
import { userContext } from "../Intermediary";
import { RectangleScroller } from "../RectangleScroller";
import "../../css/ProfileSettings.css";
import { Add } from "@material-ui/icons";
import { ElementContainer } from "./ElementContainer";
import { ConfirmProps, Confirm } from "../Confirm";

export function ProfileSettings() {
  const { user, friendFunctions, leaveServer } = useContext(userContext);
  const [confirmState, setConfirmState] = useState<
    Omit<ConfirmProps, "open"> | undefined
  >(undefined);

  function confirm(
    title: string,
    text: string | null,
    onPositive: () => void,
    onNegative?: () => void
  ) {
    setConfirmState({
      title,
      text: text || "",
      onPositive: () => {
        onPositive();
        setConfirmState(undefined);
      },
      onNegative: () => {
        onNegative && onNegative();
        setConfirmState(undefined);
      },
    });
  }

  return (
    <>
      <Confirm open={Boolean(confirmState)} {...confirmState} />
      <div className="SettingsElementContainer">
        <AvatarNameCombo
          upperText={user?.name || "unk"}
          lowerText={user?.userId || "unk"}
          icon={user?.icon || undefined}
          size={88}
        />
      </div>
      <ElementContainer
        title={`Your friends (${user?.friends?.length?.toString() || "?"})`}
      >
        <div className="ProfileSettingsYourFriends">
          <RectangleScroller
            elements={
              user?.friends?.map((friendId) => ({
                name: friendId,
                key: friendId,
              })) || []
            }
            actionRemove={(key) => friendFunctions?.removeFriend(key)}
          />
          <IconButton className="AddBtn">
            {" "}
            {/*TODO: create an add friends menu*/}
            <Add />
          </IconButton>
        </div>
      </ElementContainer>

      <ElementContainer
        title={`Your friend requests (${
          user?.friendReq?.length?.toString() || "?"
        })`}
      >
        <RectangleScroller
          elements={
            user?.friends?.map((friendId) => ({
              name: friendId,
              key: friendId,
            })) || []
          }
          actionAdd={(key) => friendFunctions?.acceptFriendRequest(key)}
          actionRemove={(key) => friendFunctions?.declineFriendRequest(key)}
        />
      </ElementContainer>

      <ElementContainer
        title={`Your servers (${user?.servers?.length?.toString() || "?"})`}
      >
        <RectangleScroller
          elements={
            user?.servers?.map((serverId) => ({
              name: serverId,
              key: serverId,
            })) || []
          }
          actionRemove={(key) => {
            confirm(
              "Leaving this server",
              `Are you sure you want to leave this server? (${key})`,
              () => leaveServer && leaveServer(key)
            );
          }}
        />
      </ElementContainer>
    </>
  );
}
