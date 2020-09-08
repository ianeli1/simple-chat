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
    const [email, setEmail] = useState("")
    const [pass, setPass] = useState("")
    const [emailError, setEmailError] = useState(false) //todo
    const [passError, setPassError] = useState(false)
    const [register, setRegister] = useState(false)

    return (
        <div className="fullscreen">
            <Box className="Login">
                <Typography variant="h3">
                    Welcome. Please <Button variant="outlined" style={{fontSize: "3rem"}} onClick={() => setRegister(!register)} >{register ? "sign up." : "sign in."}</Button>
                </Typography>
                {register &&
                    <TextField
                    id="username"
                    value={user}
                    onChange={(e) =>
                      setUser(e.target.value)
                    }
                    variant="filled"
                    label="Username"
                    />
                }
                <TextField
                id="email"
                error={emailError}
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                variant="filled"
                label="Email"
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
                disabled={!email.length || !pass.length || (register && !user.length)}
                onClick={
                    () => {
                        if(register) handler.createUser(user, email, pass, handleLogin)
                        else handler.signIn(email, pass, handleLogin)
                    }
                }
                >
                    {register ? "sign up" : "Log in"}
                </Button>
            </Box>
        </div>
    );
}

export function File(props){
    function handleFirebaseUpload(){
        console.log("Uploading...",{file})
        handler.sendMessageWithImage({name: props.user.name, message: msg}, file)

    }

    const [msg, setMsg] = useState("")
    const [file, setFile] = useState(null) //change the class for the box element
    return (
        <div className="fullscreen">
            <Box className="Login"> 
                <input 
                    type="file"
                    onChange={
                        (e) => {
                            console.log(e.target.files)
                            setFile(e.target.files[0])
                        }
                    }
                />
                <TextField 
                id="debugMessageInput"
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                variant="outlined"
                label="Message"
                />
                <Button
                onClick={
                    handleFirebaseUpload
                }
                variant="filled"
                >
                    Upload
                </Button>
                <Button
                onClick={props.cancel}
                >
                    Cancel
                </Button>
            </Box>
        </div>
    )
}

