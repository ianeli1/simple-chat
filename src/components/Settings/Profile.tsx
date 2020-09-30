import { IconButton, Typography } from "@material-ui/core";
import React, { useContext } from "react";
import { AvatarNameCombo } from "../AvatarNameCombo";
import { userContext } from "../Intermediary";
import { RectangleScroller } from "../RectangleScroller";
import "../../css/ProfileSettings.css";
import { Add } from "@material-ui/icons";
import { ElementContainer } from "./ElementContainer";

export function ProfileSettings() {
  const { user, friendFunctions } = useContext(userContext);

  return (
    <>
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
            actionAdd={(key) => void null /*idk, dms?*/}
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
          actionAdd={
            (key) => friendFunctions?.acceptFriendRequest(key) /*idk, dms?*/
          }
          actionRemove={
            (key) => void null /*TODO: add method to delete friend req */
          }
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
          actionAdd={
            (key) =>
              void null /*TODO: This option should be disabled and hide the add? idfk */
          }
          actionRemove={
            (key) => void null /*TODO: add method to leave servers */
          }
        />
      </ElementContainer>
    </>
  );
}
