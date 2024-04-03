import { LOGOUT_SUCCESS } from "../types/authType";
import {
  ACCEPT_ADD_FRIEND,
  CREATE_NEW_GROUP_SUCCESS,
  FRIEND_GET_SUCCESS,
  GET_MEMBER_SUCCESS,
  GET_REQUEST_ADD_FRIEND_SUCCESS,
  GROUPS_GET_SUCCESS,
  MESSAGE_GET_SUCCESS,
  MESSAGE_GET_SUCCESS_CLEAR,
  MESSAGE_SEND_SUCCESS,
  SEEN_MESSAGE,
  SOCKET_MESSAGE,
  SOCKET_MESSAGE_NEW,
  UPDATE,
} from "../types/messengerType";

const messengerState = {
  friends: [],
  message: [],
  members: [],
  groups: [],
  messageSendSuccess: false,
  messageGetSuccess: false,
  requestAddFriend: [],
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
      messageGetSuccess: true,
    };
  }
  if (type === MESSAGE_SEND_SUCCESS) {
    return {
      ...state,
      message: [...state.message, payload.message],
      messageSendSuccess: true,
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
      messageSendSuccess: false,
    };
  }

  if (type === SEEN_MESSAGE) {
    const index = state.friends.findIndex((f) => f.fndInfo._id === payload.msgInfo.receiverId || f.fndInfo._id === payload.msgInfo.groupId);
    state.friends[index].msgInfo.status = "seen";
    return { ...state };
  }

  if (type === UPDATE) {
    const index = state.friends.findIndex((f) => f.fndInfo._id === payload.id);

    if (state.friends[index].msgInfo.status) {
      state.friends[index].msgInfo.status = "seen";
    }
    return { ...state };
  }

  if (type === MESSAGE_GET_SUCCESS_CLEAR) {
    return { ...state, messageGetSuccess: false };
  }
  if (type === GET_REQUEST_ADD_FRIEND_SUCCESS) {
    return {
      ...state,
      requestAddFriend: payload.request,
    };
  }
  if (type === ACCEPT_ADD_FRIEND) {
    return {
      ...state,
      requestAddFriend: payload,
    };
  }
  if (type === CREATE_NEW_GROUP_SUCCESS) {
    return {
      ...state,
      friends: [payload.message, ...state.friends],
    };
  }
  if (type === LOGOUT_SUCCESS) {
    return {
      friends: [],
      message: [],
      members: [],
      groups: [],
      requestAddFriend: [],
      messageSendSuccess: false,
      messageGetSuccess: false,
    };
  }

  return state;
};
