/**
 * The channel class
 */
export class ChannelObject {
  name: string;
  cache: Channel;
  isInitialized: boolean;
  isAttached: boolean;
  private ref: Reference;

  /**
   * Creates the Channel object
   * @param serverId The ID of the server this channel is a part of
   * @param channelName The name of the channel
   */
  constructor(serverRef: Reference, channelName: string) {
    this.name = channelName;
    this.cache = {};
    this.ref = {
      db: serverRef.db.child(`channels/${channelName}`),
      storage: serverRef.storage.child(`channels/${channelName}`),
    };
    this.isInitialized = false;
    this.isAttached = false;
    this.sendMessage = this.sendMessage.bind(this);
  }

  /**
   * Detaches the channel from the React state
   *
   * @example
   * channel.detach()
   * //some other code
   * channel.attach((channel) => this.setState({channel}))
   */
  detach() {
    this.isAttached = false;
  }

  /**
   * Attaches the listener to the React setState and inmediately updates the state.
   * @param updateState A function pointing to a React setState, if not specified the React state will not be updated until the channel is
   *
   * @example
   * channel.detach()
   * //some other code
   * channel.attach((channel) => this.setState({channel}))
   */
  attach(updateState?: (channel: Channel) => void) {
    updateState && updateState(this.cache);
    this.isAttached = true;
  }

  /**
   * Destroys the listener for this channel
   */
  destroy() {
    this.ref.db.off();
    this.cache = {};
  }

  /**
   * Starts listening for new messages on this channel
   * @param updateState A function pointing to a React setState
   *
   * @example
   * channel.initialize((channel: Channel) => this.setState({channel}));
   */
  async initialize(updateState: (channel: Channel) => void): Promise<boolean> {
    try {
      if (this.isInitialized) {
        this.ref.db.off();
      }
      this.isAttached = true;

      await new Promise((resolve, reject) => {
        this.ref.db
          .orderByKey()
          .limitToLast(15)
          .on("child_added", async (snap) => {
            if (snap.key) {
              const temp = snap.val();
              temp.timestamp = snap.key;
              this.cache[snap.key] = temp;
              if (temp.image) temp.image = await this.getImage(temp.image);
              this.isAttached && updateState(this.cache);
              resolve();
            }
          });
      });
      return true;
    } catch (e) {
      console.log("An error ocurred while initializing the channel", e);
      return false;
    }
  }

  /**
   * Sends a message in the current channel
   *
   * @param msg An object with the correct Message format
   * @param [file] The image file to be sent with the message
   */
  sendMessage(msg: Message, file?: File) {
    const id = Date.now() + String(Math.floor(Math.random() * 9));
    console.log({ id, msg });

    const writer = this.ref.db.child(id);
    if (file) {
      console.log({ file });
      const name = id + "." + file.name.split(".").pop();
      this.ref.storage
        .child(name)
        .put(file)
        .then(() => writer.set({ ...msg, image: name }))
        .catch((error) => console.log(error));
    } else writer.set(msg);
  }

  /**
   * Retrieves the download URL for the specified image
   *
   * @param imageId The ID of the image to obtain
   *
   * @returns The download URL
   *
   */
  async getImage(imageId: string) {
    return await this.ref.storage.child(imageId).getDownloadURL();
  }
}
