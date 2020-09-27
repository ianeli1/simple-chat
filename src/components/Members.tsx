import { Avatar, Badge, Box, Typography } from "@material-ui/core";
import { withStyles } from "@material-ui/styles";
import React from "react";
import { Widget } from "./Widget";

export function Members(props: {
  users: { [key: string]: User };
  debug?: () => void;
}) {
  const OnlineBadge = withStyles((theme) => ({
    badge: {},
    dot: {
      height: "12px",
      "min-width": "12px",
      "border-radius": "6px",
    },
    colorPrimary: {
      backgroundColor: "#44b700",
      color: "#44b700",
    },
    colorSecondary: {
      backgroundColor: "#ff0000",
      color: "#ff0000",
    },
  }))(Badge);

  return (
    <Widget title="Online users">
      {Object.values(props.users).map((x) => (
        <Box className="MessageName">
          <OnlineBadge
            overlap="circle"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            variant="dot"
            color={x.status === "offline" ? "secondary" : "primary"}
          >
            <Avatar>{(x.name && x.name[0]) || "X"}</Avatar>
          </OnlineBadge>

          <Typography variant="h5">{x.name || "USER"}</Typography>
        </Box>
      ))}
      {/*props.debug && (
          <Button onClick={() => props.debug && props.debug()}>
            PRINT DEBUG
          </Button>
        )*/}
    </Widget>
  );
}
