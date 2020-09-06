import React from "react"
import { Box, Typography, TextField, Button } from "@material-ui/core"


export default function Login(props) {
    const [user, setUser] = useState("")
    const [pass, setPass] = useState("")
    return (
        <div className="fullscreen">
            <Box className="Login">
                <Typography variant="h3">
                    Welcome. Please sign in.
                </Typography>
                <TextField
                id="username"
                value={user}
                onChange={(e) =>
                  setUser(e.target.value)
                }
                variant="outlined"
                label="Username"
                />
                <TextField
                id="password"
                value={pass}
                onChange={(e) =>
                  setPass(e.target.value)
                }
                variant="outlined"
                label="Password"
                />
                <Button
                variant="outlined"
                onClick={
                    //idk
                }
                >
                    Log in
                </Button>
            </Box>
        </div>
    );
}

