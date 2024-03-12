import { FRIEND_GET_SUCCESS, GET_MEMBER_SUCCESS, GROUPS_GET_SUCCESS, MESSAGE_GET_SUCCESS, MESSAGE_SEND_SUCCESS, SOCKET_MESSAGE, SOCKET_MESSAGE_NEW } from "../types/messengerType";

const messengerState = {
  friends: [],
  message: [],
  members: [],
  groups: [],
};

export const messengerReducer = (state = messengerState, action) => {
  const { type, payload } = action;

  if (type === FRIEND_GET_SUCCESS) {
    return {
      ...state,
      friends: [...state.friends, ...payload.friends].sort((a, b) => new Date(b.msgInfo.createdAt) - new Date(a.msgInfo.createdAt)),
    };
  }
  if (type === MESSAGE_GET_SUCCESS) {
    return {
      ...state,
      message: payload.message,
    };
  }
  if (type === MESSAGE_GET_SUCCESS) {
    return {
      ...state,
      message: payload.message,
    };
  }
  if (type === MESSAGE_SEND_SUCCESS) {
    return {
      ...state,
      message: [...state.message, payload.message],
    };
  }
  if (type === GROUPS_GET_SUCCESS) {
    return {
      ...state,
      groups: payload.groups,
      friends: [...state.friends, ...payload.groups].sort((a, b) => new Date(b.msgInfo.createdAt) - new Date(a.msgInfo.createdAt)),
    };
  }
  if (type === GET_MEMBER_SUCCESS) {
    return {
      ...state,
      members: payload.members,
    };
  }
  if (type === SOCKET_MESSAGE) {
    return {
      ...state,
      message: [...state.message, payload.message],
      friends: payload.friends,
    };
  }
  if (type === SOCKET_MESSAGE_NEW) {
    return {
      ...state,
      friends: payload.friends,
    };
  }
  return state;
};
