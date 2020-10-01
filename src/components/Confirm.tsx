import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
import React from "react";

export interface ConfirmProps {
  open: boolean;
  onNegative?: () => void;
  onNegativeLabel?: string;
  onPositive?: () => void;
  onPositiveLabel?: string;
  title?: string;
  text?: string;
}

export function Confirm(props: ConfirmProps) {
  return (
    <Dialog
      open={props?.open || false}
      onClose={props?.onNegative}
      style={{ zIndex: 99999 }}
    >
      <DialogTitle className="ConfirmTitle">{props?.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{props?.text}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={props?.onNegative} color="primary">
          {props?.onNegativeLabel || "Cancel"}
        </Button>

        <Button
          onClick={props?.onPositive}
          color="secondary"
          variant="contained"
        >
          {props?.onPositiveLabel || "Confirm"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
