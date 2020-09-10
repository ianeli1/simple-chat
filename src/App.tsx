import React from "react";
import { Box } from "@material-ui/core";
import "./App.css";
import ChatBox from "./chatElements"
import LeftSidebar from "./leftSidebar"
import { RightSidebar } from "./rightSidebar";
import Login from "./extraMenus"
import {handler} from "./handler"
import * as r from "./reference"
 

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
    user: false | r.User //implement
}
class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {
      loading: true,
      currentChannel: "exampleChannel",
      user: false
    };
    
    this.handleChannelChange = this.handleChannelChange.bind(this)
    this.handleSetUser = this.handleSetUser.bind(this)

   
  }

  componentDidMount(){
    handler.getUserData((user: r.User) => this.handleSetUser(user))
  }

  handleChannelChange(newChannel: string){
    
    return () => {
      if(newChannel !== this.state.currentChannel) this.setState({ currentChannel: newChannel })
    } 
  }

  handleSetUser(user: r.User){
    this.setState({
      user: user
    }, () => console.log("setUser:",this.state))
  }
  

  render() { //this looks hacky, fix
    return (
      <Box className="App">
        {
          !this.state.user && <Login />
        }
        {
          this.state.user && <LeftSidebar currentChannel={this.state.currentChannel} changeChannel={this.handleChannelChange} user={this.state.user} />
        }
        {
          this.state.user && <ChatBox currentChannel={this.state.currentChannel} user={this.state.user} />
        }
        {
          this.state.user && <RightSidebar user={this.state.user} />
        }
        
      </Box>
    );
  }
}



export default App;
