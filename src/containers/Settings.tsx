import {
  AppBar,
  Avatar,
  Collapse,
  Dialog,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Slide,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { TransitionProps } from "@material-ui/core/transitions/transition";
import { Close, ExpandLess, ExpandMore } from "@material-ui/icons";
import React, { useContext, useState } from "react";
import "../css/Settings.css";
import { ProfileSettings } from "../components/Settings/Profile";
import { userContext } from "../components/Intermediary";
import { Server } from "../components/Settings/Server";

interface SettingsProps {
  close: () => void;
  isOpen: boolean;
}

const Transition = React.forwardRef(
  (
    props: TransitionProps & { children?: React.ReactElement },
    ref: React.Ref<unknown>
  ) => <Slide direction="up" ref={ref} {...props} />
);

const SettingsPages: { [key: string]: () => JSX.Element } = {
  Profile: () => <ProfileSettings />,
};

export function Settings(props: SettingsProps) {
  const [current, setCurrent] = useState<keyof typeof SettingsPages>("Profile");
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [showServers, setShowServers] = useState(true);
  const { user } = useContext(userContext);
  return (
    <Dialog
      fullScreen
      open={props.isOpen}
      onClose={props.close}
      TransitionComponent={Transition}
      className="Settings"
    >
      <AppBar className="AppToolbarParent">
        <Toolbar className="SettingsBar">
          <IconButton edge="start" onClick={props.close}>
            <Close />
          </IconButton>
          <Typography variant="h6" classes={{ root: "ToolbarTitle" }}>
            Settings
          </Typography>
        </Toolbar>
      </AppBar>
      <div className="SettingsContent">
        <List className="SettingsSidebar">
          {Object.keys(SettingsPages).map((name) => (
            <ListItem
              button
              onClick={() => {
                setCurrent(name);
                setSelectedServer(null);
              }}
            >
              <ListItemText primary={name} />
            </ListItem>
          ))}
          <ListItem
            button
            onClick={() => {
              setShowServers(!showServers);
            }}
          >
            <ListItemText primary="Servers" />
            {showServers ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={showServers}>
            <List>
              {user &&
                user.servers?.map((serverId) => (
                  <ListItem button onClick={() => setSelectedServer(serverId)}>
                    <ListItemAvatar>
                      <Avatar>{serverId[0]}</Avatar>
                    </ListItemAvatar>
                    <ListItemText>{serverId}</ListItemText>
                  </ListItem>
                ))}
            </List>
          </Collapse>
        </List>
        <div className="SettingsCurrent">
          {selectedServer ? (
            <Server serverId={selectedServer} />
          ) : (
            SettingsPages[current]()
          )}
        </div>
      </div>
    </Dialog>
  );
}
