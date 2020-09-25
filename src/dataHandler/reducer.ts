export enum serverACT {
  SET_DATA,
  SET_MEMBERS,
  SET_CHANNEL,
}

export function serverReducer(state: Data = {}, action: Action): Data {
  switch (action.type) {
    case serverACT.SET_DATA:
      if (action.data && action.serverId) {
        return {
          ...state,
          [action.serverId]: {
            ...state[action.serverId],
            data: action.data,
          },
        };
      } else return state;
    case serverACT.SET_MEMBERS:
      if (action.members && action.serverId) {
        return {
          ...state,
          [action.serverId]: {
            ...state[action.serverId],
            members: action.members,
          },
        };
      } else return state;
    case serverACT.SET_CHANNEL:
      if (action.channel && action.channelName && action.serverId) {
        return {
          ...state,
          [action.serverId]: {
            ...state[action.serverId],
            channels: {
              ...state[action.serverId].channels,
              [action.channelName]: action.channel,
            },
          },
        };
      } else return state;
    default:
      return state;
  }
}
