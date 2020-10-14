import { Fade, IconButton, Paper, Popper } from "@material-ui/core";
import { Delete, Edit } from "@material-ui/icons";
import React, { useMemo } from "react";
import { useRef } from "react";
import { useState } from "react";
import { BasicMessage } from "./BasicMessage";
import { ImageMessage } from "./ImageMessage";
import InviteMessage from "./InviteMessage";
type MessageProps = {
  id: number;
  message: Message;
  joinServer?: () => void;
  joined?: boolean;
  onProfileClick: (userId: string) => void;
  onMessageDelete?: (id: number) => void;
};

//TODO: connect join server + join using context

export function Message(props: MessageProps) {
  const { id, message, joinServer = undefined, joined = false } = props;
  const [showPopper, setShowPopper] = useState(false);
  const mouseActions = useMemo(
    () => ({
      onMouseEnter: () => setShowPopper(true),
      onMouseLeave: () => setShowPopper(false),
    }),
    [setShowPopper]
  );
  const divRef = useRef(null);
  return useMemo(
    () => (
      <div className="Message" {...mouseActions} ref={divRef}>
        {props.onMessageDelete && (
          <Popper
            open={showPopper}
            {...mouseActions}
            style={{ zIndex: 999999999999 }}
            anchorEl={divRef.current}
            transition
            placement="right"
          >
            {({ TransitionProps }) => (
              <Fade {...TransitionProps}>
                <Paper>
                  <IconButton>
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={() =>
                      props.onMessageDelete && props.onMessageDelete(props.id)
                    }
                  >
                    <Delete />
                  </IconButton>
                </Paper>
              </Fade>
            )}
          </Popper>
        )}
        <BasicMessage {...{ message }} onProfileClick={props.onProfileClick} />
        {message.invite && joinServer && (
          <InviteMessage invite={message.invite} {...{ joinServer, joined }} />
        )}
        {message.image && <ImageMessage imageUrl={message.image} />}
      </div>
    ),
    [message]
  );
}
