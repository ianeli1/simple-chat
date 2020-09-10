import React, {useState} from "react";
import { Box, Button, IconButton, Avatar, Typography } from "@material-ui/core"
import { KeyboardArrowDown, KeyboardArrowUp } from '@material-ui/icons';
import { handler } from "./handler"
import * as r from "./reference"
import "./rightSidebar.css"

/*Ideas for the epic toolbar
-resizable widgets
-online friends widget


*/

type RightSidebarProps = {
    user: r.User
}

type RightSidebarState = {
    user: r.User,
    online: Array<r.User>
}

export class RightSidebar extends React.Component<RightSidebarProps, RightSidebarState>{
    constructor(props: RightSidebarProps){
        super(props);
        this.state = {
            user: props.user || {name: "USER"},
            online: []
        }
    }

    componentDidMount(){
        handler.getOnlineUsers((users: Array<r.User>) => this.setState({online: users}))
    }

    componentWillReceiveProps(props: RightSidebarProps){
        if(props.user){
            this.setState({
                user: props.user
            })
        }
    }

    render() {
        return (
        <Box className="RightSidebar">
            <Box className="InnerRightSidebar">
                <Profile user={this.state.user} />
                <Online users={this.state.online} />
            </Box>
        </Box>
        );
    };
};

function Widget(props: {title: string, children: React.ReactNode}){
    const [hidden, setHidden] = useState(false)
    return <Box className="Widget">
        <Box className="WidgetAdmin">
            <Typography style={{flex: 1}}>
                {props.title}
            </Typography>
            <IconButton onClick={() => setHidden(!hidden)} style={{height: "20px", width: "20px", flex: "none"}}>
                {hidden ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
        </Box>
        {!hidden && <Box className="WidgetInner">
            {props.children}
        </Box>}
    </Box>
}

function Profile(props: {user: r.User}) {
    return (
        <Widget 
        title="Profile"
        >
            <Box className="Profile">
                <Box className="MessageName">
                    <Avatar>{props.user.name[0]}</Avatar>
                    <Typography variant="h5">{props.user.name}</Typography>
                </Box>
                <Button onClick={
                    handler.signOut
                }>
                    Log Out
                </Button>

                <Typography>
                    {props.user.name}
                </Typography>
            </Box>
        </Widget>
    );
}

function Online(props: { users: Array<r.User>}){
    
    return (
        <Widget
        title="Online users"
        >
            {Object.values(props.users).map(x => (
                <Box className="MessageName">
                    <Avatar>{x.name[0]}</Avatar>
                <Typography variant="h5">{x.name}</Typography>
            </Box>
            ))}

            


        </Widget>
    )
}
