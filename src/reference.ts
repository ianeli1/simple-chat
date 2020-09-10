
export interface User { 
    name: string,
    userId: string,
    icon?: string
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
}
