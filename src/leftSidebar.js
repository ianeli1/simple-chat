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
import { handler } from "./data";
import "./leftSidebar.css";

//TODO divide everything into components

export default class LeftSidebar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      user: props.user || { name: "USER" },
      channelList: [],
      creatingChannel: false,
      currentChannel: props.currentChannel || "",
      currentServer: 124124,
      servers: {
        124124: {
          id: 124124,
          name: "Test Server",
          icon: "test.png",
          channels: ["general", "memes", "idk"],
        },
        124125: {
          id: 124125,
          name: "Hughesnet",
          icon: "test.png",
          channels: ["general", "memes", "idk"],
        },
      },
    };
    handler.updateChannels((snap) =>
      this.setState(
        {
          channelList: Object.values(snap.val()),
          currentChannel: snap.val()[0],
        },
        () => this.props.changeChannel(this.state.currentChannel)()
      )
    ); //attach listener to channel list
  }

  componentWillReceiveProps(props) {
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

function ServerList({ serverList }) {
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
        <ListItemAvatar></ListItemAvatar>
      </List>
    </Box>
  );
}

function ChannelList({ channelList, currentChannel, changeChannel, user }) {
  const [creatingChannel, setCreatingChannel] = useState(false);
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
                handler.createChannel(creatingChannel.name, user.name);
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

function Popup({ title, desc, children, close }) {
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
