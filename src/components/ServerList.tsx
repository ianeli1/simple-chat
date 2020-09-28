import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  TextField,
  Button,
  Typography,
  ListItemIcon,
} from "@material-ui/core";
import { Home } from "@material-ui/icons";
import React, { useState } from "react";

export function ServerList({
  serverList,
  changeServer,
  createServer,
  goHome,
}: {
  serverList: string[];
  changeServer: (id: string) => void;
  createServer: (serverName: string) => void;
  goHome: () => void;
}) {
  const [creatingServer, setCreatingServer] = useState<
    { name: string } | false
  >(false);
  return (
    <Box id="ServerList">
      <List component="nav" aria-label="server-picker">
        <ListItem button onClick={goHome}>
          <ListItemIcon>
            <Home />
          </ListItemIcon>
        </ListItem>
        {serverList &&
          serverList.length &&
          serverList.map((x) => (
            <ListItem button onClick={() => changeServer(x)}>
              <ListItemAvatar>
                <Avatar>{x}</Avatar>
              </ListItemAvatar>
            </ListItem>
          ))}
        <ListItem button onClick={() => setCreatingServer({ name: "" })}>
          <ListItemAvatar>
            <Avatar>+</Avatar>
          </ListItemAvatar>
        </ListItem>
      </List>
      {creatingServer && (
        <Popup
          title="Create a new server"
          desc="You are creating a new server no I absolutely didn't reuse code"
          close={() => setCreatingServer(false)}
        >
          <Box>
            <TextField
              id="NewServerName"
              value={creatingServer.name}
              onChange={(e) =>
                setCreatingServer({
                  name: e.target.value,
                })
              }
              variant="outlined"
              label="Name"
            />
            <Button
              onClick={() => {
                //todo add
                if (creatingServer.name) {
                  createServer(creatingServer.name);
                  setCreatingServer(false);
                }
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

export function Popup({
  //TODO: REPLACE THIS WITH DIALOG FROM MUI
  title,
  desc,
  children,
  close,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
  close: () => void;
}) {
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
