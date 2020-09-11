import React from "react";
import { Box } from "@material-ui/core";
import "./App.css";
import ChatBox from "./chatElements"
import LeftSidebar from "./leftSidebar"
import { RightSidebar } from "./rightSidebar";
import Login from "./extraMenus"
//import {handler} from "./handler"
import * as r from "./reference"
import { Handler } from "./handler2";

 

 //APP is supposed to be divided in three parts, the left sidebar(channels, etc)
 //the center is for the message component
 //the right should be for cool widgets (users online, top messagers idk)
 //each element should handle itself with no interference
 //finally, the toolbar should be able to hide both sidebars



type AppProps = {

}

type AppState = {
    loading: boolean,
    currentChannel: string,
    user: null | r.User //implement,
    channel: r.Channel,
    members: {
      [key: string]: r.User
    },
    data: r.Server | null
}
class App extends React.Component<AppProps, AppState> {
  private handler: Handler
  constructor(props: AppProps) {
    super(props);
    this.state = {
      loading: true,
      currentChannel: "exampleChannel",
      user: null,
      channel: {},
      members: {},
      data: null
    };
    this.handler = new Handler()
    this.handleChannelChange = this.handleChannelChange.bind(this)
    this.handleServerChange = this.handleServerChange.bind(this)
  }

  componentDidMount(){
    //handler.getUserData((user: r.User) => this.handleSetUser(user))
    this.handler.getUser((user) => this.setState({user}))
  }

  handleServerChange(newServer: string){
    return () => {
      this.handler.loadServer(newServer, (members) => this.setState({members}), (data) => this.setState({data}))
    }
  }

  handleChannelChange(newChannel: string){
    return () => {
      if(newChannel !== this.state.currentChannel) this.handler.getChannel(newChannel, (channel) => this.setState({channel}))
    } 
  }

  render() { //this looks hacky, fix
    return (
      <Box className="App">
        {
          !this.state.user && <Login />
        }
        {
          this.state.user && <LeftSidebar channelList={this.state.data && this.state.data.channels || []} currentChannel={this.state.currentChannel} changeServer={this.handleServerChange} changeChannel={this.handleChannelChange} user={this.state.user} />
        }
        {
          this.state.user && <ChatBox user={this.state.user} channel={this.state.channel} sendMessage={this.handler.sendMessage} />
        }
        {
          this.state.user && <RightSidebar user={this.state.user} online={this.state.members} />
        }
        
      </Box>
    );
  }
}



export default App;
