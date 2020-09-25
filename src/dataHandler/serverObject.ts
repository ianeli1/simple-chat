import { Ref } from "react";
/** The server object
 * @description
 * This class depends on the Channel class to function
 */
import { ChannelObject } from "./channelObject";

export class ServerObject {
  data: ServerData | null;
  members: {
    [key: string]: User;
  };
  channels: {
    [key: string]: ChannelObject;
  };
  isInitialized: boolean;
  currentChannel: string;
  isAttached: boolean;
  private ref: Reference;

  /**
   * Creates a new Server object
   * @param serverId A server ID
   */
  constructor(serverRef: Reference) {
    this.data = null;
    this.members = {};
    this.channels = {};
    this.currentChannel = "";
    this.isInitialized = false;
    this.isAttached = false;
    this.ref = serverRef;
    this.getDebug = this.getDebug.bind(this);
  }

  /**
   * Initializes the data and members listeners for this server
   * @param updateMembers A function pointing to a React setState
   * @param updateData A function pointing to a React setState
   * @example
   * server.initialize((members) => this.setState({members}),
   *                   (data) => this.setState({data}))
   */
  async initialize(
    updateMembers: (serverMembers: { [key: string]: User }) => void,
    updateData: (serverData: ServerData) => void
  ): Promise<boolean> {
    try {
      if (this.isInitialized) {
        this.ref.db.off();
      }
      this.isInitialized = true;
      this.isAttached = true;
      await new Promise((resolve, reject) => {
        //wait until the first value
        this.ref.db.child("data").on("value", (snap) => {
          const firebaseReply = snap.val();
          this.data = {
            ...firebaseReply,
            channels: Object.values(firebaseReply.channels),
          };
          console.log({ data: this.data });
          this.isAttached && this.data && updateData(this.data);
          resolve();
        });
      });
      await new Promise((resolve, reject) => {
        this.ref.db.child("members").on("value", (snap) => {
          this.members = snap.val();
          console.log({ members: this.members });
          this.isAttached && updateMembers(this.members);
          resolve();
        });
      });
      return true;
    } catch (e) {
      console.log("An error ocurred while initializing this server");
      return false;
    }
  }

  /**
   * Loads a certain channel in this server
   * @param channel The name of the channel
   * @param updateChannel A function pointing to a React setState
   *
   * @example
   * server.getChannel("general", (channel) => this.setState({channel}))
   */
  async getChannel(
    channel: string,
    updateChannel: (channel: Channel) => void
  ): Promise<boolean> {
    if (this.data) {
      this.currentChannel.length && this.channels[this.currentChannel].detach();
      this.currentChannel = channel;
      if (Object.keys(this.channels).includes(channel)) {
        console.log("Attaching channel...", channel);
        this.channels[this.currentChannel].attach(updateChannel);
        return true;
      } else {
        this.channels[this.currentChannel] = new ChannelObject(
          {
            db: this.ref.db.child(`channels/${channel}`),
            storage: this.ref.storage.child(`channels/${channel}`),
          },
          this.currentChannel
        );
        await this.channels[this.currentChannel].initialize(updateChannel);
        return true;
      }
    } else return false;
  }

  /**
   * Adds an emote to this server
   * @param emoteName The name of the emote to be added
   * @param emote The image file
   */
  async addEmote(emoteName: string, emote: File) {
    const filename = emoteName + "." + emote.name.split(".").pop();
    const fileRef = this.ref.storage.child(`emotes/${filename})`);
    await fileRef.put(emote).then(async (snap) => {
      const downloadUrl = await fileRef.getDownloadURL();
      this.ref.db.child("data/emotes/" + emoteName).set(downloadUrl);
    });
  }

  /**
   * Creates a new channel in this server
   * @param channel The name of the channel to be created
   * @param currentUser [*Optional*] Specifies who that created the channel
   */
  createChannel(channel: string, currentUser?: User) {
    //TODO: only owners should be able to create channels
    const id = Date.now() + String(Math.floor(Math.random() * 9));
    const newNode = this.ref.db.child("channels").child(channel).child(id);
    if (currentUser) {
      newNode.set({
        name: currentUser.name,
        userId: currentUser.userId,
        message: "[System]: " + currentUser.name + " created the channel.",
        timestamp: id,
      });
    } else {
      newNode.set({
        name: "unknown",
        userId: "0",
        message: "[System]: someone created the channel.",
        timestamp: id,
      });
    }

    const newNode2 = this.ref.db.child("data").child("channels").push();
    newNode2.set(channel);
  }

  /**
   * **[For debug only]** Prints all the relevant data contained in this server object
   */
  getDebug() {
    console.log({
      data: this.data,
      members: this.members,
      channels: this.channels,
    });
  }

  /**
   * Detaches the server's listeners from the React state
   */
  detach() {
    this.isAttached = false;
    this.currentChannel.length && this.channels[this.currentChannel].detach();
  }

  /**
   * Attaches the server's listeners to a React state
   * @param updateMembers A function pointing to a React setState
   * @param updateData A function pointing to a React setState
   *
   * @example
   * server.detach()
   * //some code
   * server.attach((members) => this.setState({members}),
   *               (data) => this.setState({data}))
   */
  attach(
    updateMembers: (serverMembers: { [key: string]: User }) => void,
    updateData: (serverData: ServerData) => void
  ) {
    if (this.data) {
      this.isAttached = true;
      updateMembers(this.members);
      updateData(this.data);
    }
  }

  /**
   * Destroys all the listeners in this server's object (incluiding the channels')
   */
  destroy() {
    for (let elem of Object.keys(this.channels)) {
      this.channels[elem].destroy();
    }
    this.ref.db.off();
    this.channels = {};
  }
}
