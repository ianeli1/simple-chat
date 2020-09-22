import React, { useState, useRef } from "react";
import { Box, Typography, TextField, Button } from "@material-ui/core";

import * as r from "./reference";
import "./extraMenus.css";
//TODO: Rewrite all these as Material UI dialogs, ooops
export default function Login({
  signIn,
  signUp,
}: {
  signIn: (email: string, pass: string, callback: (x: string) => void) => void;
  signUp: (
    username: string,
    email: string,
    pass: string,
    callback: (x: string) => void
  ) => void;
}) {
  function handleLogin(error: string) {
    setPass("");
    switch (error) {
      case "email":
        setEmailError(true);
        setPassError(false);
        break;
      case "password":
        setEmailError(false);
        setPassError(true);
        break;
      default:
      //hide Login
    }
  }

  const [user, setUser] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [emailError, setEmailError] = useState(false); //todo
  const [passError, setPassError] = useState(false);
  const [register, setRegister] = useState(false);

  return (
    <div className="fullscreen">
      <Box className="Login">
        <Typography variant="h3">
          Welcome. Please{" "}
          <Button
            variant="outlined"
            style={{ fontSize: "3rem" }}
            onClick={() => setRegister(!register)}
          >
            {register ? "sign up." : "sign in."}
          </Button>
        </Typography>
        {register && (
          <TextField
            id="username"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            variant="filled"
            label="Username"
          />
        )}
        <TextField
          id="email"
          error={emailError}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          variant="filled"
          label="Email"
        />
        <TextField
          id="password"
          error={passError}
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          variant="filled"
          type="password"
          label="Password"
        />

        <Button
          variant="outlined"
          disabled={!email.length || !pass.length || (register && !user.length)}
          onClick={() => {
            if (register) signUp(user, email, pass, handleLogin);
            else signIn(email, pass, handleLogin);
          }}
        >
          {register ? "sign up" : "Log in"}
        </Button>
      </Box>
    </div>
  );
}

export function AddEmote({
  addEmote,
  close,
}: {
  addEmote: (emoteName: string, emote: File) => void;
  close: any;
}) {
  const [file, setFile] = useState<null | File>(null);
  const [emoteName, setEmoteName] = useState("");
  return (
    <div className="fullscreen">
      <Box className="AddEmote">
        <TextField
          id="debugMessageInput"
          value={emoteName}
          onChange={(e) => setEmoteName(e.target.value)}
          variant="outlined"
          label="Emote Name"
        />
        <input
          type="file"
          onChange={(e) => {
            setFile(e.target.files && e.target.files[0]);
          }}
        />

        <Button
          onClick={(e) => file && emoteName && addEmote(emoteName, file)}
          variant="contained"
        >
          Add emote
        </Button>
        <Button onClick={close} variant="contained">
          Close
        </Button>
      </Box>
    </div>
  );
}

export function Invite(props: {
  id: string;
  name: string;
  icon?: string;
  close: () => void;
}) {
  function copyToClipboard(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    textAreaRef.current != null && textAreaRef.current.select();
    document.execCommand("copy");
    (e.target as HTMLButtonElement).focus();
    setCopySuccess("Copied!");
  }
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [copySuccess, setCopySuccess] = useState<string>("Copy");
  return (
    <div className="fullscreen">
      <Box className="InviteWindow">
        <Typography variant="h5">Copy the following message!</Typography>
        <TextField
          inputRef={textAreaRef}
          multiline
          value={
            "<!invite>" +
            btoa(JSON.stringify({ id: props.id, name: props.name })) +
            "<!/invite>"
          }
          variant="outlined"
        />
        <Button onClick={copyToClipboard} variant="contained">
          {copySuccess}
        </Button>
        <Button onClick={props.close} variant="contained">
          Close
        </Button>
      </Box>
    </div>
  );
}

export function File(props: {
  user: User;
  cancel: any;
  sendMessage: (
    msg: Message,
    file?: File,
    updateLoad?: (percentage: Number) => void
  ) => void;
}) {
  function handleFirebaseUpload(file: File) {
    return () => {
      if (file) {
        props.sendMessage(
          { name: props.user.name, message: msg, timestamp: "0" },
          file
        );
      }
    };
  }

  const [msg, setMsg] = useState("");
  const [file, setFile] = useState<null | File>(null); //change the class for the box element
  const [progress, setProgress] = useState<Number>(0); //TODO: implement the progress bar
  return (
    <div className="fullscreen">
      <Box className="Login">
        <input
          type="file"
          onChange={(e) => {
            setFile(e.target.files && e.target.files[0]);
          }}
        />
        <TextField
          id="debugMessageInput"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          variant="outlined"
          label="Message"
        />
        <Button
          onClick={(e) => file && handleFirebaseUpload(file)()}
          variant="contained"
          disabled={Boolean(progress)}
        >
          {progress ? progress : "Upload"}
        </Button>
        <Button onClick={props.cancel}>Cancel</Button>
      </Box>
    </div>
  );
}
