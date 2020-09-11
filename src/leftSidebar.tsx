import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from "@material-ui/core";
//import { handler } from "./handler";
import "./leftSidebar.css";
import * as r from "./reference"
import { FormatListBulletedOutlined } from "@material-ui/icons";

//TODO divide everything into components

type LeftSidebarProps = {
    user: r.User,
    currentChannel: string,
    channelList: string[],
    changeChannel: (newChannel: string) => () => void,
    changeServer: (serverId: string) => () => void
}

type LeftSidebarState = {
    user: r.User,
    channelList: string[],
    creatingChannel: boolean,
    currentChannel: string
    currentServer: string,
}
export default class LeftSidebar extends React.Component<LeftSidebarProps, LeftSidebarState>{
  constructor(props: LeftSidebarProps) {
    super(props);

    this.state = {
      user: props.user,
      channelList: [],
      creatingChannel: false,
      currentChannel: props.currentChannel || "",
      currentServer: "124124",
    };
  }

  componentWillReceiveProps(props: LeftSidebarProps) {
    this.setState({ currentChannel: props.currentChannel, user: props.user, channelList: props.channelList });
  }

  render() {
    return (
      <Box id="LeftSidebar">
        {
          this.state.user.servers && <ServerList serverList={this.state.user.servers} changeServer={this.props.changeServer} />
        }
        <ChannelList
          currentChannel={this.state.currentChannel}
          channelList={this.state.channelList}
          changeChannel={this.props.changeChannel}
          user={this.state.user}
        />
      </Box>
    );
  }
}

function ServerList({ serverList, changeServer }: { serverList: string[], changeServer: (serverId: string) => () => void }) {
  return (
    <Box id="ServerList">
      <List component="nav" aria-label="server-picker">
        {serverList.map((x) => (
          <ListItem button onClick={changeServer(x)}>
            <ListItemAvatar>
              <Avatar>{x}</Avatar>
            </ListItemAvatar>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

function ChannelList({ channelList, currentChannel, changeChannel, user }: {channelList: Array<string>, currentChannel: string, changeChannel: (newChannel: string) => () => void, user: r.User}) {
  const [creatingChannel, setCreatingChannel] = useState<{name: string} | false>(false);
  return (
    <Box id="channelSelection">
      <List component="nav" aria-label="main channels">
        {channelList.map((x) => (
          <ListItem
            button
            selected={currentChannel === x}
            onClick={changeChannel(x)}
          >
            <ListItemText primary={"#" + x} />
          </ListItem>
        ))}
        <ListItem
          button
          onClick={() =>
            setCreatingChannel({
              name: "",
            })
          }
        >
          <ListItemText primary="Add new channel" />
        </ListItem>
      </List>
      {creatingChannel && (
        <Popup
          title="Create a new channel"
          desc="You are creating a new channel idk what to write here"
          close={() => setCreatingChannel(false)}
        >
          <Box>
            <TextField
              id="NewChannelName"
              value={creatingChannel.name}
              onChange={(e) =>
                setCreatingChannel({
                  name: e.target.value,
                })
              }
              variant="outlined"
              label="Name"
            />
            <Button
              onClick={() => {
                //todo add
                setCreatingChannel(false);
              }}
            >
              Create
            </Button>
          </Box>
        </Popup>
      )}
    </Box>
  );
}

function Popup({ title, desc, children, close }: { title: string, desc: string, children: React.ReactNode, close: () => void }) {
  return (
    <Box className="Popup">
      <Box className="Popup_inside">
        <Button className="closePopup" onClick={close}>
          x
        </Button>
        <Box className="PopupInfo">
          <Typography variant="h5" component="h1" classes={{ h5: "lightFont" }}>
            {title}
          </Typography>
          <Typography variant="body1">{desc}</Typography>
        </Box>
        <Box className="PopupInner">{children}</Box>
      </Box>
    </Box>
  );
}
