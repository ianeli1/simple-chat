import { IconButton, Typography } from "@material-ui/core";
import React, { useContext, useState } from "react";
import { AvatarNameCombo } from "../AvatarNameCombo";
import { menuContext, userContext } from "../Intermediary";
import { RectangleScroller } from "../RectangleScroller";
import "../../css/ProfileSettings.css";
import { Add } from "@material-ui/icons";
import { ElementContainer } from "./ElementContainer";
import { version } from "../../../package.json";

export function ProfileSettings() {
  const { user, friendFunctions, leaveServer, profileFunctions } = useContext(
    userContext
  );
  const { confirm, textDialog, imageSelect } = useContext(menuContext);

  return (
    <>
      <div className="SettingsElementContainer">
        <AvatarNameCombo
          upperText={user?.name || "unk"}
          lowerText={user?.userId || "unk"}
          icon={user?.icon || undefined}
          size={88}
          onAvatarClick={() =>
            imageSelect(
              "Profile picture",
              "<= Please select a new profile picture",
              (_, url) => void profileFunctions?.changeAvatar(url),
              false,
              undefined,
              true
            )
          }
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
            actionRemove={(key) =>
              confirm(
                "Remove this friend?",
                `Are you sure you want to remove ${key} from your friend list?`,
                () => friendFunctions?.removeFriend(key)
              )
            }
          />
          <IconButton
            className="AddBtn"
            onClick={() =>
              textDialog(
                "Add a friend",
                "Enter the User ID!\nIt looks like this: jDDsR95426fzWc0CoBYjKhnrrFa2",
                (text) => friendFunctions?.sendFriendRequest(text)
              )
            }
          >
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
            user?.friendReq?.map((friendId) => ({
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

      <ElementContainer title={"Version"}>
        <Typography variant="body1">{version}</Typography>
      </ElementContainer>
    </>
  );
}
