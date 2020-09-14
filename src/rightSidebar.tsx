import React, { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Avatar,
  Typography,
  Badge,
  withStyles,
} from "@material-ui/core";
import { KeyboardArrowDown, KeyboardArrowUp } from "@material-ui/icons";
//import { handler } from "./handler"
import * as r from "./reference";
import "./rightSidebar.css";
import { Emote } from "./chatElements";
import { AddEmote } from "./extraMenus";

/*Ideas for the epic toolbar
-resizable widgets
-online friends widget


*/

type RightSidebarProps = {
  user: r.User;
  members: {
    [key: string]: r.User;
  };
  emotes: {
    [key: string]: string;
  };
  signOut: () => void;
  addEmote: (emoteName: string, emote: File) => void;
  debug: () => void;
};

type RightSidebarState = {
  user: r.User;
  members: {
    [key: string]: r.User;
  };
  emotes: {
    [key: string]: string;
  };
};

export class RightSidebar extends React.Component<
  RightSidebarProps,
  RightSidebarState
> {
  constructor(props: RightSidebarProps) {
    super(props);
    this.state = {
      user: props.user,
      members: {},
      emotes: {},
    };
  }

  componentDidMount() {}

  componentWillReceiveProps(props: RightSidebarProps) {
    this.setState({
      user: props.user,
      members: props.members,
      emotes: props.emotes,
    });
  }

  render() {
    return (
      <Box className="RightSidebar">
        <Box className="InnerRightSidebar">
          <Profile user={this.state.user} signOut={this.props.signOut} />
          {this.state.members && (
            <Members users={this.state.members} debug={this.props.debug} />
          )}
          <EmoteList
            addEmote={this.props.addEmote}
            emotes={this.state.emotes}
          />
        </Box>
      </Box>
    );
  }
}

function Widget(props: { title: string; children: React.ReactNode }) {
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

function Profile(props: { user: r.User; signOut: () => void }) {
  return (
    <Widget title="Profile">
      <Box className="Profile">
        <Box className="MessageName">
          <Avatar>{props.user.name[0]}</Avatar>
          <Typography variant="h5">{props.user.name}</Typography>
        </Box>
        <Button
          onClick={
            () => props.signOut() //Todo: implement
          }
        >
          Log Out
        </Button>

        <Typography>{props.user.name}</Typography>
      </Box>
    </Widget>
  );
}

function EmoteList({
  emotes,
  addEmote,
}: {
  emotes: { [key: string]: string };
  addEmote: (emoteName: string, emote: File) => void;
}) {
  const [add, setAdd] = useState<boolean>(false);
  return (
    <Widget title="Emote list">
      <Box>
        {Object.keys(emotes).map((key) => (
          <Box>
            <Emote emoteName={key} url={emotes[key]} />
            {"<:" + key + ":>"}
          </Box>
        ))}
        <Button onClick={() => setAdd(true)} variant="contained">
          Add
        </Button>
        {add && <AddEmote addEmote={addEmote} close={() => setAdd(false)} />}
      </Box>
    </Widget>
  );
}

function Members(props: {
  users: { [key: string]: r.User };
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
