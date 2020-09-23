import React from "react";
import {
  createStyles,
  Fade,
  makeStyles,
  Paper,
  Popover,
  Popper,
  Theme,
} from "@material-ui/core";
import { Emote } from "./Emote";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      //make it as wide as the screen on phones but a lil window on pc
      width: 200,
      height: 200,
      overflowY: "scroll",
      background: "darkgray",
    },
    emotes: {
      //use grid here, i don't want a list.
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "flex-start",
      "& > span": {
        padding: 5,
        width: 40,
        borderRadius: 3,
        "&:hover": {
          background: "gray",
        },
      },
    },
  })
);

type Props = {
  anchor: HTMLButtonElement | null;
  open: boolean;
  emotes: Emotes;
  onClose: () => void;
  onEmoteClick: (emoteName: string) => void;
};

export default function EmotePopper(props: Props) {
  const classes = useStyles();
  const firstEmoteRef = React.useRef<HTMLSpanElement>(null);
  const emotes = (
    <div className={classes.emotes}>
      {Object.entries(props.emotes).map(([emoteName, url], i) => (
        <Emote
          {...{ emoteName, url }}
          onClick={props.onEmoteClick}
          ref={i == 0 ? firstEmoteRef : undefined}
        />
      ))}
    </div>
  );
  React.useEffect(() => {
    //TODO: focus on the first element when it's first rendered
    if (firstEmoteRef.current) {
      console.log("Focused!");
      firstEmoteRef.current.focus();
    }
  }, []);
  return (
    props.anchor && (
      <Popover
        anchorEl={props.anchor}
        open={props.open}
        onClose={props.onClose}
      >
        <Paper className={classes.root}>{emotes}</Paper>
      </Popover>
    )
  );
}
