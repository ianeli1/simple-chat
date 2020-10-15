import {
  AppBar,
  Avatar,
  Collapse,
  createStyles,
  Dialog,
  Drawer,
  Hidden,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles,
  Slide,
  SwipeableDrawer,
  Theme,
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

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      position: "relative",
    },
    title: {
      marginLeft: theme.spacing(2),
      flex: 1,
    },
  })
);

export function Settings(props: SettingsProps) {
  const [current, setCurrent] = useState<keyof typeof SettingsPages>("Profile");
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [showServers, setShowServers] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const { user } = useContext(userContext);

  const epicSidebar = (
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
  );

  return (
    <Dialog
      fullScreen
      open={props.isOpen}
      onClose={props.close}
      TransitionComponent={Transition}
      className="Settings"
    >
      <AppBar className="AppToolbarParent" position="relative">
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
        <Hidden smUp>
          <SwipeableDrawer
            anchor="left"
            open={showSidebar}
            onClose={() => setShowSidebar(false)}
            onOpen={() => setShowSidebar(true)}
            style={{ zIndex: 99999 }}
            classes={{
              paper: "SettingsDrawerPaper",
            }}
          >
            {epicSidebar}
          </SwipeableDrawer>
        </Hidden>
        <Hidden xsDown>{epicSidebar}</Hidden>
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
