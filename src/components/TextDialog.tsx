import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@material-ui/core";
import React, { useState } from "react";

export interface TDProps {
  open: boolean;
  close: () => void;
  title: string;
  text: string;
  onPositive: (text: string) => void;
}

export function TextDialog(props: TDProps) {
  const [text, setText] = useState("");

  function handleSubmit(text: string) {
    props.onPositive(text);
    setText("");
    props.close();
  }

  return (
    <Dialog
      open={props.open}
      onClose={props.close}
      className="TextDialog"
      style={{ zIndex: 2001 }}
    >
      <DialogTitle>{props.title}</DialogTitle>
      <DialogContent className="TextDialogContent">
        <div className="TextDialogContentInner">
          <Typography variant="body1">{props.text}</Typography>
        </div>
        <TextField
          value={text}
          onChange={(e) => setText(e.target.value)}
          variant="outlined"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={props.close}>Cancel</Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => handleSubmit(text)}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
