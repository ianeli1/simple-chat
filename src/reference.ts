/*
users {
    "userId": { //User object
        name: string,
        icon?: "iconId",
        status?:
        servers: ["serverId1"...]
    }
}

servers {
    "serverId": { 
        data: {
            name: "Name of the server",
            icon: "iconId"
            owner: "userId of the owner",
            typing: ["user1", "user2"...],
            channels: ["channel1", "channel2"]
        },
        members: {
            "userId": { //User object
                name: "Name of the user",
                icon: "userIcon",
                status: "whatever"
            }
        }
        channels: {
            "channel": { //Channel object
                "timestamp"+"[0-9]": { //Message Object

                }
            }
        }
    }
}*/

export interface User { 
    name: string,
    userId: string,
    icon?: string,
    status?: "online" | "idle" | "dnd" | "offline" //add invisible?
    servers?: string[]
}



export interface Channel {
    [key: string]: Message
}

export interface Message {
    name: string,
    userId?: string,
    message: string,
    image?: string,
    timestamp: number //deprecated?
}

export interface Server {
    id: string,
    channels: string[],
    name: string,
    icon?: string,
    owner: string
    typing?: {
        [key: string]: string
    }
}
