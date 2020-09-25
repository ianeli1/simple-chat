import React, { createContext, useEffect, useReducer } from "react";
import { serverACT, serverReducer } from "../dataHandler/reducer";
import { Handler } from "../handler2";

interface MiscData {
  user: User | null;
  currentServer: string | null;
  currentChannel: string | null;
}

export enum MiscACT {
  SET_USER = 69,
  SET_CURRENT_CHANNEL,
  SET_CURRENT_SERVER,
}

function miscReducer(state: MiscData, action: Action) {
  switch (action.type) {
    case MiscACT.SET_USER:
      if (action.user) {
        return {
          ...state,
          user: action.user,
        };
      } else return state;
    case MiscACT.SET_CURRENT_CHANNEL:
      if (action.current && state.currentServer) {
        return {
          ...state,
          currentChannel: action.current,
        };
      } else return state;
    case MiscACT.SET_CURRENT_SERVER:
      if (action.current) {
        return {
          ...state,
          currentChannel: null,
          currentServer: action.current,
        };
      }
    default:
      return state;
  }
}

interface rootState {
  misc: MiscData;
  servers: Data;
}

function rootReducer(state: rootState, action: Action) {
  if (action.type in MiscACT) {
    return {
      ...state,
      misc: miscReducer(state.misc, action),
    };
  } else if (action.type in serverACT) {
    return {
      ...state,
      servers: serverReducer(state.servers, action),
    };
  } else return state;
}

function dispatchMiddleware(dispatch: React.Dispatch<Action>) {
  return (action: Action) => {
    switch (action.type) {
      default:
        return dispatch(action);
    }
  };
}

export const dataContext = createContext<[rootState, React.Dispatch<Action>]>(
  undefined!
);
const handler = new Handler();
export function Intermediary(props: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(rootReducer, {
    misc: {
      user: null,
      currentChannel: null,
      currentServer: null,
    },
    servers: {},
  });
  useEffect(() => {
    handler.connect(dispatch);
    handler.getUser();
  }, []);

  return (
    <dataContext.Provider value={[state, dispatchMiddleware(dispatch)]}>
      {props.children}
    </dataContext.Provider>
  );
}
