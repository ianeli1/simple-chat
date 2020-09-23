import { Tooltip, Box, Avatar, Typography } from "@material-ui/core";
import React from "react";
import { Emote } from "./Emote";

type BasicMessageProps = {
  message: Message;
};

export const BasicMessage = (props: BasicMessageProps) => {
  function splitByRegex(
    regex: RegExp,
    x: string,
    createThis: (x: string) => any
  ) {
    let index = 0;
    let output = [];
    let result: RegExpExecArray | null = regex.exec(x);
    while (result) {
      if (index !== result.index) {
        output.push(x.slice(index, result.index));
      }
      index = result.index + result[0].length;
      output.push(createThis(result[1]));
      result = regex.exec(x);
    }
    return output;
  }
  const EMOTE_REGEX = /<:(.*?):>/gi;

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
            {splitByRegex(EMOTE_REGEX, message.message, (x) => (
              <Emote
                emoteName={x}
                url={(message.emotes && message.emotes[x]) || ""}
              />
            ))}
          </Box>
        ) : (
          <Typography variant="body1">{message.message}</Typography>
        ))}
    </div>
  );
};
