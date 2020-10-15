import {
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { AvatarNameCombo } from "./AvatarNameCombo";
import "../css/UserProfile.css";
import { createFriendRequestFuncs } from "../dataHandler/userFunctions";
import { getProfile } from "../dataHandler/miscFunctions";

type UserProfileType = {
  profileId: string | null;
  user: User | null;
  close: () => void;
  open: boolean;
  friendFunctions: ReturnType<typeof createFriendRequestFuncs> | null;
};

export function UserProfile(props: UserProfileType) {
  const [profile, setProfile] = useState<User | null>(null);
  useEffect(() => {
    if (props.profileId) {
      getProfile(props.profileId)
        .then((user) => setProfile(user))
        .catch((e) => {
          console.log("Userprofile, an error ocurred", e);
          setProfile(null);
        });
    }
  }, [props.profileId]);

  return (
    <Dialog open={props.open} onClose={props.close} className="UserProfile">
      {props.user?.friends && profile && props.profileId ? (
        <>
          <DialogTitle className="UserProfileTitle">
            <AvatarNameCombo
              upperText={profile.name}
              icon={profile.icon || undefined}
            />
          </DialogTitle>
          <DialogContent className="UserProfileContent">
            <div className="UserProfileContentInner">
              <div className="UserProfileLeft">
                <Typography variant="h6">Status</Typography>
                <Typography variant="body1">Soon...</Typography>
              </div>
              <Divider orientation="vertical" />
              <div className="UserProfileRight">
                {props.user.friends.includes(props.profileId) ? (
                  <>
                    <Button variant="outlined">Chat</Button>
                    <Button
                      variant="outlined"
                      onClick={() =>
                        props.profileId &&
                        props.friendFunctions?.removeFriend(props.profileId)
                      }
                    >
                      Remove Friend
                    </Button>
                  </>
                ) : props.user.userId == props.profileId ? (
                  <Typography variant="h6">{"It's you :)"}</Typography>
                ) : (
                  <Button
                    variant="outlined"
                    onClick={() =>
                      props.profileId &&
                      props.friendFunctions?.sendFriendRequest(props.profileId)
                    }
                  >
                    Add friend
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </>
      ) : (
        <CircularProgress />
      )}
    </Dialog>
  );
}
