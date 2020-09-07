import React, {useState} from "react"
import { Box, Typography, TextField, Button } from "@material-ui/core"
import {handler} from "./data"
import "./extraMenus.css"

export default function Login(props) {
    function handleLogin(user){
        setPass("")
        switch(user){
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



    const [user, setUser] = useState("")
    const [pass, setPass] = useState("")
    const [emailError, setEmailError] = useState(false) //todo
    const [passError, setPassError] = useState(false)

    return (
        <div className="fullscreen">
            <Box className="Login">
                <Typography variant="h3">
                    Welcome. Please sign in.
                </Typography>
                <TextField
                id="username"
                error={emailError}
                value={user}
                onChange={(e) =>
                  setUser(e.target.value)
                }
                variant="filled"
                label="Username"
                />
                <TextField
                id="password"
                error={passError}
                value={pass}
                onChange={(e) =>
                  setPass(e.target.value)
                }
                variant="filled"
                type="password"
                label="Password"
                />
                <Button
                variant="outlined"
                disabled={!user.length || !pass.length}
                onClick={
                    () => {
                        handler.signIn(user, pass, handleLogin)
                    }
                }
                >
                    Log in
                </Button>
            </Box>
        </div>
    );
}

