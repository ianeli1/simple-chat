import {
  AppBar,
  Dialog,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Slide,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { TransitionProps } from "@material-ui/core/transitions/transition";
import { Close } from "@material-ui/icons";
import React, { useState } from "react";
import "../css/Settings.css";
import { ProfileSettings } from "../components/Settings/Profile";

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
            <ListItem button onClick={() => setCurrent(name)}>
              <ListItemText primary={name} />
            </ListItem>
          ))}
        </List>
        <div className="SettingsCurrent">{SettingsPages[current]()}</div>
      </div>
    </Dialog>
  );
}
