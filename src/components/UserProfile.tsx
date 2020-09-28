import {
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from "@material-ui/core";
import React, {
  useContext,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { AvatarNameCombo } from "./AvatarNameCombo";
import "../css/UserProfile.css";
import {
  dataContext,
  getProfile,
  removeFriend,
  sendFriendRequest,
} from "./Intermediary";

type UserProfileType = {
  userId: string | null;
  close: () => void;
  open: boolean;
};

function useUserProfile() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [state] = useContext(dataContext);
  useEffect(() => {
    const curr = state.misc.user;
    if (curr) {
      setCurrentUser(curr);
    } else {
      setCurrentUser(null);
    }
  }, [state.misc.user]);

  return { currentUser };
}

export function UserProfile(props: UserProfileType) {
  const [user, setUser] = useState<User | null>(null);
  const { currentUser } = useUserProfile();
  useEffect(() => {
    props.open &&
      (async function () {
        if (props.userId) {
          setUser(await getProfile(props.userId));
        } else setUser(null);
      })();
  }, [props.userId]);

  return (
    <Dialog open={props.open} onClose={props.close} className="UserProfile">
      {user && currentUser?.friends ? (
        <>
          <DialogTitle className="UserProfileTitle">
            <AvatarNameCombo upperText={user.name} />
          </DialogTitle>
          <DialogContent className="UserProfileContent">
            <div className="UserProfileContentInner">
              <div className="UserProfileLeft">
                <Typography variant="h6">Status</Typography>
                <Typography variant="body1">Soon...</Typography>
              </div>
              <Divider orientation="vertical" />
              <div className="UserProfileRight">
                {Object.keys(currentUser.friends).includes(user.userId) ? (
                  <>
                    <Button variant="outlined">Chat</Button>
                    <Button
                      variant="outlined"
                      onClick={() => removeFriend(user.userId)}
                    >
                      Remove Friend
                    </Button>
                  </>
                ) : user.userId === currentUser.userId ? (
                  <Typography variant="h6">{"It's you :)"}</Typography>
                ) : (
                  <Button
                    variant="outlined"
                    onClick={() => sendFriendRequest(user.userId)}
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
