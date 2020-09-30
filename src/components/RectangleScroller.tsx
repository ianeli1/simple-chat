import { Avatar, IconButton, Paper, Typography } from "@material-ui/core";
import { Add, Close } from "@material-ui/icons";
import React, { useCallback } from "react";
import { ASElement } from "./AvatarScroller";
import "../css/RectangleScroller.css";

interface RectangleProps {
  element: ASElement;
  actionAdd: () => void;
  actionRemove: () => void;
}

function Rectangle(props: RectangleProps) {
  return (
    <Paper className="Rectangle">
      <div className="RectangleContainer">
        {props.element.icon ? (
          <Avatar alt={props.element.name} src={props.element.icon} />
        ) : (
          <Avatar>{props.element.name[0]}</Avatar>
        )}
        <Typography variant="subtitle1" classes={{ root: "RectangleText" }}>
          {props.element.name}
        </Typography>
      </div>
      <IconButton onClick={props.actionAdd} classes={{ root: "AddBtn" }}>
        {" "}
        {/*Settings.css */}
        <Add />
      </IconButton>
      <IconButton
        size="small"
        className="RectangleX"
        onClick={props.actionRemove}
      >
        <Close />
      </IconButton>
    </Paper>
  );
}

interface ScrollerProps {
  elements: ASElement[];
  actionAdd: (key: string) => void;
  actionRemove: (key: string) => void;
}

export function RectangleScroller(props: ScrollerProps) {
  const actionAdd = useCallback(props.actionAdd, []);
  const actionRemove = useCallback(props.actionRemove, []);
  return (
    <div className="RectangleScroller">
      {(props.elements || []).map((element) => (
        <Rectangle
          actionAdd={() => actionAdd(element.key)}
          actionRemove={() => actionRemove(element.key)}
          element={element}
        />
      ))}
    </div>
  );
}
