import React from "react";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
} from "@material-ui/core";
import { Chat, HorizontalSplit } from "@material-ui/icons";
import "./App.css";
import ChatBox from "./chatElements";
import LeftSidebar from "./leftSidebar";
import { RightSidebar } from "./rightSidebar";
import Login from "./extraMenus";
//import {handler} from "./handler"
import * as r from "./reference";
import { Handler } from "./handler2";

//APP is supposed to be divided in three parts, the left sidebar(channels, etc)
//the center is for the message component
//the right should be for cool widgets (users online, top messagers idk)
//each element should handle itself with no interference
//finally, the toolbar should be able to hide both sidebars

type AppProps = {};

type AppState = {
  loading: boolean;
  currentChannel: string;
  currentServer: string;
  user: null | r.User; //implement,
  channel: r.Channel;
  members: {
    [key: string]: r.User;
  };
  data: r.Server | null;
  showRight: boolean;
  showLeft: boolean;
};
class App extends React.Component<AppProps, AppState> {
  private handler: Handler;
  constructor(props: AppProps) {
    super(props);
    this.state = {
      loading: true,
      currentChannel: "",
      currentServer: "",
      user: null,
      channel: {},
      members: {},
      data: null,
      showRight: true,
      showLeft: true,
    };
    this.handler = new Handler();
    this.handleChannelChange = this.handleChannelChange.bind(this);
    this.handleServerChange = this.handleServerChange.bind(this);
  }

  componentDidMount() {
    //handler.getUserData((user: r.User) => this.handleSetUser(user))
    this.handler.getUser((user) => this.setState({ user }));
  }

  handleServerChange(newServer: string) {
    return () => {
      this.handler.loadServer(
        newServer,
        (members) => this.setState({ members }),
        (data) => this.setState({ data, currentServer: newServer })
      );
    };
  }

  handleChannelChange(newChannel: string) {
    return () => {
      if (newChannel !== this.state.currentChannel)
        this.handler.getChannel(newChannel, (channel) =>
          this.setState({ channel, currentChannel: newChannel })
        );
    };
  }

  render() {
    //this looks hacky, fix
    return (
      <Box className="Global">
        {!this.state.user && (
          <Login
            signIn={this.handler.signIn}
            signUp={this.handler.createUser}
          />
        )}
        {this.state.user && (
          <AppToolbar
            currentServer={this.state.currentServer}
            currentChannel={this.state.currentChannel}
            toggleLeft={() => this.setState({ showLeft: !this.state.showLeft })}
            toggleRight={() =>
              this.setState({ showRight: !this.state.showRight })
            }
          />
        )}
        <Box className="App">
          {this.state.user && this.state.showLeft && (
            <LeftSidebar
              createServer={this.handler.createServer}
              channelList={(this.state.data && this.state.data.channels) || []}
              currentChannel={this.state.currentChannel}
              changeServer={this.handleServerChange}
              changeChannel={this.handleChannelChange}
              user={this.state.user}
              createChannel={this.handler.createChannel}
            />
          )}
          {this.state.user && (
            <ChatBox
              joinServer={this.handler.joinServer}
              user={this.state.user}
              emotes={(this.state.data && this.state.data.emotes) || {}}
              channel={this.state.channel}
              sendMessage={this.handler.sendMessage}
            />
          )}
          {this.state.user && this.state.showRight && (
            <RightSidebar
              user={this.state.user}
              members={this.state.members}
              emotes={(this.state.data && this.state.data.emotes) || {}}
              addEmote={this.handler.addEmote}
              signOut={this.handler.signOut}
              debug={this.handler.getDebug}
            />
          )}
        </Box>
      </Box>
    );
  }
}

function AppToolbar({
  currentServer,
  currentChannel,
  toggleLeft,
  toggleRight,
}: {
  currentServer: string;
  currentChannel: string;
  toggleLeft: () => void;
  toggleRight: () => void;
}) {
  return (
    <AppBar position="static">
      <Toolbar classes={{ root: "AppToolbar" }}>
        <IconButton edge="start" onClick={toggleLeft}>
          <Chat />
        </IconButton>
        <Typography variant="h6" classes={{ root: "ToolbarTitle" }}>
          Simple-Chat
        </Typography>
        {currentServer && currentChannel && (
          <Box className="ToolbarCurrent">
            <Typography variant="h6">
              {currentServer} - #{currentChannel}
            </Typography>
          </Box>
        )}
        <div className="ToolbarDummy" />
        <IconButton
          classes={{ root: "ToolbarButtonRight" }}
          onClick={toggleRight}
        >
          <HorizontalSplit />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

export default App;
