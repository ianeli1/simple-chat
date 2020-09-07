import React from "react";
import { Box } from "@material-ui/core";
import "./App.css";
import ChatBox from "./chatElements"
import LeftSidebar from "./leftSidebar"
import { RightSidebar } from "./rightSidebar";
import Login from "./extraMenus"
import {handler} from "./data"
 

 //APP is supposed to be divided in three parts, the left sidebar(channels, etc)
 //the center is for the message component
 //the right should be for cool widgets (users online, top messagers idk)
 //each element should handle itself with no interference
 //finally, the toolbar should be able to hide both sidebars
class App extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      currentChannel: "exampleChannel",
      user: false
    };
    
    this.handleChannelChange = this.handleChannelChange.bind(this)
    this.handleSetUser = this.handleSetUser.bind(this)

   
  }

  componentDidMount(){
    handler.getUserData((user) => this.handleSetUser(user))
  }

  handleChannelChange(newChannel){
    return () => this.setState({ currentChannel: newChannel })
  }

  handleSetUser(user){
    this.setState({
      user: user
    }, () => console.log(this.state))
  }
  

  render() {
    return (
      <Box className="App">
        {
          !this.state.user && <Login setUser={this.handleSetUser} />
        }
        <LeftSidebar changeChannel={this.handleChannelChange} user={this.state.user} />
        <ChatBox currentChannel={this.state.currentChannel} user={this.state.user} />
        <RightSidebar user={this.state.user} />
      </Box>
    );
  }
}



export default App;
