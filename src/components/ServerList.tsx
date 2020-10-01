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
import { create } from "domain";
import React, { useContext, useState } from "react";
import { menuContext } from "./Intermediary";

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
  const { textDialog } = useContext(menuContext);
  const [creatingServer, setCreatingServer] = useState<
    { name: string } | false
  >(false);
  return (
    <Box id="ServerList">
      <List component="nav" aria-label="server-picker">
        <ListItem button onClick={goHome}>
          <ListItemIcon className="HomeIcon">
            <Home /> {/*LeftSidebar.css*/}
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
        <ListItem
          button
          onClick={() =>
            void textDialog(
              "Creating a server",
              "Enter the name of the new server",
              (text) => createServer(text)
            )
          }
        >
          <ListItemAvatar>
            <Avatar>+</Avatar>
          </ListItemAvatar>
        </ListItem>
      </List>
    </Box>
  );
}
