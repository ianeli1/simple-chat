import * as r from "./reference"
import * as firebase from "firebase"
import {firebaseConfig} from "./secretKey"




firebase.initializeApp(firebaseConfig)

export class Handler{
    user: r.User | null;
    servers: {
        [key: string]: Server
    }
    currentServer: string;
    constructor(){
        this.user = null;
        this.servers = {}
        this.currentServer = "";
        this.sendMessage = this.sendMessage.bind(this)
        this.getChannel = this.getChannel.bind(this)
        this.getUser = this.getUser.bind(this)
        this.loadServer = this.loadServer.bind(this)
    }

    createChannel(channelName: string){
        //implement
    }

    signOut(){
        //implement
    }

    getUser(updateUser: (user: r.User | null) => void){
        firebase.auth().onAuthStateChanged(async (user) => {
            if(user){
                
                this.user = await (await firebase.database().ref("users/"+user.uid).once("value")).val()
                this.user && (() => this.user.userId = user.uid)()
                console.log("Got user:", {user, userData: this.user})
            }else{
                this.user = null
            }
            updateUser(this.user)
        })
    }

    loadServer(serverId: string, updateMembers: (serverMembers: {[key: string]: r.User}) => void, updateData: (serverData: r.Server) => void){
        this.currentServer.length && this.servers[this.currentServer].detach();
        this.currentServer = serverId;
        if(Object.keys(this.servers).includes(serverId)){
            this.servers[this.currentServer].attach();
        }else{
            this.servers[this.currentServer] = new Server(serverId);
            this.servers[this.currentServer].initialize(updateMembers, updateData);
        }
    }

    getChannel(channel: string, updateChannel: (channel: r.Channel) => void){
        this.servers[this.currentServer].getChannel(channel, updateChannel)
    }

    sendMessage(msg: r.Message, file?: File){
        const curr = this.servers[this.currentServer].currentChannel
        this.servers[this.currentServer].channels[curr].sendMessage(msg, file)
    }
}


class Server{
    data: r.Server;
    members: {
        [key: string]: r.User
    };
    channels: {
        [key: string]: Channel
    };
    isInitialized: boolean;
    currentChannel: string;
    isAttached: boolean;
    private ref: firebase.database.Reference;
    constructor(serverId: string){
        this.data = {
            id: serverId,
            name: "",
            channels: [],
            owner: ""
        };
        this.members = {}
        this.channels = {}
        this.currentChannel = "";
        this.isInitialized = false;
        this.isAttached = false;
        this.ref = firebase.database().ref("servers/"+serverId+"")
    }

    initialize(updateMembers: (serverMembers: {[key: string]: r.User}) => void, updateData: (serverData: r.Server) => void){
        if(this.isInitialized){
            this.ref.off()
        }
        this.isInitialized = true;
        this.isAttached = true;
        this.ref.child("data").on("value", (snap) => {
            this.data = {...this.data, ...snap.val()}
            console.log({data: this.data})
            this.isAttached && updateData(this.data)
        })
        this.ref.child("members").on("value", (snap) => {
            this.members = snap.val()
            console.log({members: this.members})
            this.isAttached && updateMembers(this.members)
        })
    }

    getChannel(channel: string, updateChannel: (channel: r.Channel) => void){
        this.currentChannel.length && this.channels[this.currentChannel].detach()
        this.currentChannel = channel;
        if(Object.keys(this.channels).includes(channel)){
            this.channels[this.currentChannel].attach()
        }else{
            this.channels[this.currentChannel] = new Channel(this.data.id, this.currentChannel)
            this.channels[this.currentChannel].initialize(updateChannel)
        }
    }

    detach(){
        this.isAttached = false;
        this.channels[this.currentChannel].detach()
    }

    attach(){
        this.isAttached = true;
        this.channels[this.currentChannel].attach()
    }

    destroy(){
        for(let elem of Object.keys(this.channels)){
            this.channels[elem].destroy()
        }
        this.ref.off()
        this.channels = {}
    }
}

class Channel{
    serverId: string;
    name: string;
    cache: r.Channel;
    isInitialized: boolean;
    isAttached: boolean;
    private ref: firebase.database.Reference;
    constructor(serverId: string, channelName: string){
        this.serverId = serverId;
        this.name = channelName;
        this.cache = {};
        this.ref = firebase.database().ref("servers/"+this.serverId+"/channels/"+this.name)
        this.isInitialized = false;
        this.isAttached = false;
    }

    detach(){
        this.isAttached = false;
    }

    attach(){
        this.isAttached = true;
    }

    destroy(){
        this.ref.off()
        this.cache = {}
    }

    initialize(updateState: (channel: r.Channel) => void){
        if(this.isInitialized){
            this.ref.off()
        }
        this.isAttached = true;
        this.ref.orderByKey().limitToLast(15).on("child_added", async (snap) => {
            if(snap.key){
                const temp = snap.val()
                this.cache[snap.key] = temp;
                if(temp.image) temp.image = await this.getImage(temp.image);
                this.isAttached && updateState(this.cache)
            }
        })
    }

    async sendMessage(msg: r.Message, file?: File){
        const id = Date.now() + String(Math.floor(Math.random()*9));
        console.log({id, msg})
        const writer = this.ref.child(id)
        if(file){
            const filename = "servers/"+this.serverId+"/channels/"+this.name+"/"+id+file?.name.split(".").pop()
            await firebase.storage().ref(filename).put(file)
            await writer.set({...msg, image: filename})
        }
        await writer.set(msg)
    }

    async getImage(imageId: string){
        return await firebase.storage().ref("servers/"+this.serverId+"/channels/"+this.name+"/"+imageId)
            .getDownloadURL();
    }
}