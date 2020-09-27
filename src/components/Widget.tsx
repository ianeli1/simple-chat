import { Box, Typography, IconButton } from "@material-ui/core";
import { KeyboardArrowUp, KeyboardArrowDown } from "@material-ui/icons";
import React, { useState } from "react";

export function Widget(props: { title: string; children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);
  return (
    <Box className="Widget">
      <Box className="WidgetAdmin">
        <Typography style={{ flex: 1 }}>{props.title}</Typography>
        <IconButton
          onClick={() => setHidden(!hidden)}
          style={{ height: "20px", width: "20px", flex: "none" }}
        >
          {hidden ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
        </IconButton>
      </Box>
      {!hidden && <Box className="WidgetInner">{props.children}</Box>}
    </Box>
  );
}
