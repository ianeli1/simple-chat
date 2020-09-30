import {
  Badge,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@material-ui/core";
import React, { ChangeEvent, useEffect, useState } from "react";
import "../css/ImageSelector.css";
import { uploadImage } from "../dataHandler/stateLessFunctions";

export interface ISProps {
  open: boolean;
  close: () => void;
  title: string;
  onPositive: (name: string, fileUrl: string) => Promise<void> | void;
  text: string;
  textAfter?: string;
  placeholder?: string;
  isEmote?: boolean;
}

export function ImageSelector(props: ISProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(0);
  const [imgUrl, setImgUrl] = useState<string | undefined>(undefined);
  const [text, setText] = useState("");

  useEffect(() => {
    setFile(null);
    setImgUrl(undefined);
  }, [props.title]);

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setImgUrl(URL.createObjectURL(event.target.files[0]));
    } else {
      setFile(null);
      setImgUrl(undefined);
    }
  }

  async function handleSubmit() {
    if (file && text) {
      const url = await uploadImage(file, props.isEmote || false, (per) =>
        setLoading(per)
      );
      await props.onPositive(text, url);
      props.close();
      setFile(null);
      setImgUrl(undefined);
      setText("");
      setLoading(0);
    }
  }

  return (
    <Dialog
      open={props.open}
      onClose={loading ? undefined : props.close}
      style={{ zIndex: 2000 }}
    >
      <DialogTitle>{props.title}</DialogTitle>
      <DialogContent className="ImageSelectorContent">
        <label htmlFor="image-picker">
          <input
            style={{ display: "none" }}
            accept="image/*"
            type="file"
            onChange={handleImage}
            name="image-picker"
            id="image-picker"
            disabled={Boolean(loading)}
          />
          <Badge color="primary" badgeContent="+">
            <span className="ImageSelectorSpan">
              <img className="ImageSelectorImage" src={imgUrl} />
            </span>
          </Badge>
        </label>
        <div className="ImageSelectorInnerContent">
          <Typography variant="h6">{props.text}</Typography>
          <TextField
            variant="outlined"
            placeholder={props.placeholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Typography variant="h6">{props.textAfter}</Typography>
        </div>
      </DialogContent>
      <DialogActions>
        <Button
          color="primary"
          onClick={props.close}
          disabled={Boolean(loading)}
        >
          Cancel
        </Button>
        <Button
          color="secondary"
          onClick={handleSubmit}
          disabled={Boolean(loading)}
        >
          {loading ? `${loading.toFixed(1)}%` : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
