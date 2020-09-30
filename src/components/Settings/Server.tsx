import { Button, CircularProgress, IconButton } from "@material-ui/core";
import { Add } from "@material-ui/icons";
import React from "react";
import { useServer } from "../../dataHandler/hooks";
import { AvatarNameCombo } from "../AvatarNameCombo";
import { AvatarScroller } from "../AvatarScroller";
import { RectangleScroller } from "../RectangleScroller";
import { ElementContainer } from "./ElementContainer";

interface ServerProps {
  serverId: string | null;
}

export function Server(props: ServerProps) {
  const { addEmote, createChannel, serverData } = useServer(
    props.serverId || undefined
  );

  return serverData ? (
    <>
      <div className="SettingsElementContainer">
        <AvatarNameCombo
          upperText={serverData?.name || "unk"}
          lowerText={serverData.id || "unk"}
          icon={serverData.icon || undefined}
          size={88}
        />
      </div>

      <ElementContainer title="This server's emotes">
        <div className="ProfileSettingsYourFriends">
          {/*ProfileSettings.css */}
          <AvatarScroller
            onElementClick={
              (emoteName) =>
                void null /*TODO: add a remove emote method + confirm screen */
            }
            elements={
              serverData.emotes
                ? Object.entries(serverData.emotes).map(([emoteName, url]) => ({
                    key: emoteName,
                    name: emoteName,
                    icon: url,
                  }))
                : []
            }
          />
          <IconButton className="AddBtn">
            {" "}
            {/*TODO: invoke add emote menu */}{" "}
            {/*TODO: create an add friends menu*/}
            <Add />
          </IconButton>
        </div>
      </ElementContainer>

      <ElementContainer title="This server's channels">
        <RectangleScroller
          actionRemove={
            () => void null /*TODO: add a method to delete channels + confirm */
          }
          elements={serverData.channels.map((channel) => ({
            key: channel,
            name: channel,
          }))}
          hideAvatar
        />
      </ElementContainer>

      <ElementContainer title="DANGER ZONE">
        {/*TODO: add methods to leave and delete server */}
        <div className="ServerSettingsDanger">
          <Button variant="contained" color="secondary">
            Leave
          </Button>
          <Button variant="contained" color="secondary">
            Delete permanently
          </Button>
        </div>
      </ElementContainer>
    </>
  ) : (
    <CircularProgress />
  );
}
