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

  return (
    <Dialog open={props.open} onClose={props.close} className="TextDialog">
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
          onClick={() => props.onPositive(text)}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
