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
import { handler } from "./handler";
import "./leftSidebar.css";
import * as r from "./reference"
import { FormatListBulletedOutlined } from "@material-ui/icons";

//TODO divide everything into components

type LeftSidebarProps = {
    user: r.User,
    currentChannel: string,
    changeChannel: (newChannel: string) => () => void
}

type LeftSidebarState = {
    user: r.User,
    channelList: string[],
    creatingChannel: boolean,
    currentChannel: string
    currentServer: string,
    servers: {
        [key: string]: r.Server
    }
}
export default class LeftSidebar extends React.Component<LeftSidebarProps, LeftSidebarState>{
  constructor(props: LeftSidebarProps) {
    super(props);

    this.state = {
      user: props.user || { name: "USER" },
      channelList: [],
      creatingChannel: false,
      currentChannel: props.currentChannel || "",
      currentServer: "124124",
      servers: {
        124124: {
          id: "124124",
          name: "Test Server",
          icon: "test.png",
          channels: ["general", "memes", "idk"],
        },
        124125: {
          id: "124125",
          name: "Test Server 2",
          icon: "test.png",
          channels: ["general", "memes", "idk"],
        }
      },
    };
    handler.updateChannels((channelList: Array<string>) =>
      this.setState(
        {
          channelList: channelList,
          currentChannel: channelList[0],
        },
        () => this.props.changeChannel(this.state.currentChannel)()
      )
    ); //attach listener to channel list
  }

  componentWillReceiveProps(props: LeftSidebarProps) {
    this.setState({ currentChannel: props.currentChannel });
  }

  render() {
    return (
      <Box id="LeftSidebar">
        <ServerList serverList={this.state.servers} />
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

function ServerList({ serverList }: { serverList: {[key: string]: r.Server} }) {
  return (
    <Box id="ServerList">
      <List component="nav" aria-label="server-picker">
        {Object.values(serverList).map((x) => (
          <ListItem button>
            <ListItemAvatar>
              <Avatar alt={x.name[0]} src="no.jpg" />
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
                handler.createChannel(creatingChannel.name, user);
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
