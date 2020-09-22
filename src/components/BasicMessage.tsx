import { Tooltip, Box, Avatar, Typography } from "@material-ui/core";
import React from "react";
import { Emote } from "./Emote";

type BasicMessageProps = {
  message: Message;
};

export const BasicMessage = (props: BasicMessageProps) => {
  const { message } = props;
  return (
    <div className="BasicMessage">
      <Tooltip
        title={String(new Date(Number(message.timestamp.slice(0, -1))))
          .split(" ")
          .slice(0, 5)
          .join(" ")}
        arrow
        placement="top"
      >
        <Box className="MessageName">
          <Avatar>{message.name[0]}</Avatar>
          <Typography variant="h5">{message.name}</Typography>
        </Box>
      </Tooltip>

      {message.message &&
        (message.emotes ? (
          <Box>
            {() => {
              //there HAS to be a better way of doing this
              const regex = /<:[a-zA-Z0-9]+:>/gi;
              let emoteList = message.message.match(regex) || [];
              return message.message
                .split(regex)
                .map((x) => (x ? x : emoteList.shift()))
                .map((x) => {
                  if (x) {
                    if (regex.test(x))
                      return (
                        <Emote
                          emoteName={x.slice(2, -2)}
                          url={
                            (message.emotes &&
                              message.emotes[x.slice(2, -2)]) ||
                            ""
                          }
                        />
                      );
                    else return <p>{x}</p>;
                  } else {
                    return;
                  }
                });
            }}
          </Box>
        ) : (
          <Typography variant="body1">{message.message}</Typography>
        ))}
    </div>
  );
};
