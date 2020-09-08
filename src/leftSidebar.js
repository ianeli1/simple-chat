import React from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
} from "@material-ui/core";
import { handler } from "./data";

//TODO divide everything into components

export default class LeftSidebar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      user: props.user || { name: "USER" },
      channelList: [],
      creatingChannel: false,
      currentChannel: props.currentChannel || ""
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

  componentWillReceiveProps(props){
    this.setState({ currentChannel: props.currentChannel })
  }

  render() {
    return (
      <Box id="channelSelection">
        <List component="nav" aria-label="main channels">
          {this.state.channelList.map((x) => (
            <ListItem button selected={this.state.currentChannel == x} onClick={this.props.changeChannel(x)}>
              <ListItemText primary={"#" + x} />
            </ListItem>
          ))}
          <ListItem
            button
            onClick={() =>
              this.setState({
                creatingChannel: {
                  name: "",
                },
              })
            }
          >
            <ListItemText primary="Add new channel" />
          </ListItem>
        </List>
        {this.state.creatingChannel && (
          <Popup
            title="Create a new channel"
            desc="You are creating a new channel idk what to write here"
            close={() =>
              this.setState({
                creatingChannel: false,
              })
            }
          >
            <Box>
              <TextField
                id="NewChannelName"
                value={this.state.creatingChannel.name}
                onChange={(e) =>
                  this.setState({
                    creatingChannel: {
                      name: e.target.value,
                    },
                  })
                }
                variant="outlined"
                label="Name"
              />
              <Button
                onClick={() => {
                  handler.createChannel(
                    this.state.creatingChannel.name,
                    this.state.user.name
                  );
                  this.setState({
                    creatingChannel: false,
                  });
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
