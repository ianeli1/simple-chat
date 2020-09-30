import { Button, CircularProgress, IconButton } from "@material-ui/core";
import { Add } from "@material-ui/icons";
import React, { useContext } from "react";
import { useServer } from "../../dataHandler/hooks";
import { AvatarNameCombo } from "../AvatarNameCombo";
import { AvatarScroller } from "../AvatarScroller";
import { confirmContext } from "../Intermediary";
import { RectangleScroller } from "../RectangleScroller";
import { ElementContainer } from "./ElementContainer";

interface ServerProps {
  serverId: string | null;
}

export function Server(props: ServerProps) {
  const { emoteFunctions, channelFunctions, serverData } = useServer(
    props.serverId || undefined
  );

  const confirm = useContext(confirmContext);

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
            onElementClick={(emoteName) =>
              /*TODO: add a remove emote method + confirm screen */
              void confirm(
                "Delete this emote?",
                `Are you sure you want to delete <:${emoteName}:>?`,
                () => emoteFunctions?.delete(emoteName)
              )
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
            {/*TODO: invoke add emote menu */}
            <Add />
          </IconButton>
        </div>
      </ElementContainer>

      <ElementContainer title="This server's channels">
        <div className="ProfileSettingsYourFriends">
          <RectangleScroller
            actionRemove={(key) =>
              confirm(
                "Delete this channel?",
                `Are you sure you want to delete #${key}?`,
                () => channelFunctions?.remove(key)
              )
            }
            elements={serverData.channels.map((channel) => ({
              key: channel,
              name: channel,
            }))}
            hideAvatar
          />
          <IconButton className="AddBtn">
            {/*TODO: invoke add emote menu */}
            <Add />
          </IconButton>
        </div>
      </ElementContainer>

      <ElementContainer title="DANGER ZONE">
        {/*TODO: add methods to leave and delete server */}
        <div className="ServerSettingsDanger">
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
