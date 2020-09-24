import React from "react";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Hidden,
  Drawer,
} from "@material-ui/core";
import { Chat, HorizontalSplit } from "@material-ui/icons";
import "./css/App.css";
import ChatBox from "./containers/ChatBox";
import LeftSidebar from "./leftSidebar";
import { RightSidebar } from "./rightSidebar";
import Login, { Invite } from "./extraMenus";
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
  user: null | User; //implement,
  channel: Channel;
  members: {
    [key: string]: User;
  };
  data: ServerData | null;
  showRight: boolean;
  showLeft: boolean;
  invite: boolean;
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
      showLeft: false,
      invite: false,
    };
    this.handler = new Handler();
    this.handleChannelChange = this.handleChannelChange.bind(this);
    this.handleServerChange = this.handleServerChange.bind(this);
    this.openWindow = this.openWindow.bind(this);
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

  openWindow(window: string) {
    switch (window) {
      case "Invite":
        this.setState({ invite: true });
        break;
      default:
        console.error("App/openWindow: Couldn't find the window " + window);
    }
  }

  render() {
    //this looks hacky, fix
    const leftSidebar = this.state.user && (
      <LeftSidebar
        createServer={this.handler.createServer}
        channelList={(this.state.data && this.state.data.channels) || []}
        currentChannel={this.state.currentChannel}
        changeServer={this.handleServerChange}
        changeChannel={this.handleChannelChange}
        user={this.state.user}
        createChannel={this.handler.createChannel}
        openWindow={this.openWindow}
      />
    );
    const container =
      window !== undefined ? () => window.document.body : undefined;
    return (
      <Box className="Global">
        {this.state.invite && this.state.data && (
          <Invite
            id={this.state.currentServer}
            name={this.state.data.name}
            close={() => this.setState({ invite: false })}
          />
        )}
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
          <Hidden smUp>
            <Drawer
              container={container}
              variant="temporary"
              anchor="left"
              open={this.state.showLeft}
              onClose={() => this.setState({ showLeft: false })}
              ModalProps={{ keepMounted: true }}
              classes={{ paper: "drawerPaper" }}
            >
              {leftSidebar}
            </Drawer>
          </Hidden>
          <Hidden xsDown>
            <Drawer
              variant="persistent"
              open={this.state.showLeft}
              classes={{ paper: "drawerPaper" }}
            >
              {leftSidebar}
            </Drawer>
          </Hidden>
          {this.state.user && (
            <ChatBox
              joinServer={this.handler.joinServer}
              user={this.state.user}
              emotes={(this.state.data && this.state.data.emotes) || {}}
              channel={this.state.channel}
              sendMessage={this.handler.sendMessage}
            />
          )}
          {this.state.user &&
            this.state.showRight && ( //idea: on mobile, make the bg of the drawer transparent
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
