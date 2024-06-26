import { LOGOUT_SUCCESS } from "../types/authType";
import {
  ACCEPT_ADD_FRIEND,
  ACCEPT_ADD_FRIEND_SOCKET,
  ADD_MEMBER_TO_GROUP_SUCCESS,
  CREATE_NEW_GROUP_SUCCESS,
  DELETE_MESSAGE_SUCCESS,
  FRIEND_GET_SUCCESS,
  GET_MEMBER_SUCCESS,
  GET_REQUEST_ADD_FRIEND_SUCCESS,
  GROUPS_GET_SUCCESS,
  LEAVE_GROUP_SUCCESS,
  MESSAGE_GET_SUCCESS,
  MESSAGE_GET_SUCCESS_CLEAR,
  MESSAGE_SEND_SUCCESS,
  PROMOTE_SUCCESS,
  RECALL_MESSAGE_SOCKET,
  RECALL_MESSAGE_SUCCESS,
  REMOVE_MEMBER_SUCCESS,
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

const mergeUniqueFriends = (arr1, arr2) => {
  // Tạo một Map để lưu trữ các đối tượng theo id
  let map = new Map();

  // Đưa các đối tượng từ arr1 vào map
  arr1.forEach((obj) => map.set(obj.fndInfo._id, obj));

  // Lặp qua các đối tượng từ arr2
  arr2.forEach((obj) => {
    // Nếu không có đối tượng nào trong map có cùng id, thêm vào map
    if (!map.has(obj.fndInfo._id)) {
      map.set(obj.fndInfo._id, obj);
    }
  });

  // Chuyển đổi map thành mảng các đối tượng
  let mergedArray = Array.from(map.values());

  return mergedArray;
};

export const messengerReducer = (state = messengerState, action) => {
  const { type, payload } = action;

  if (type === FRIEND_GET_SUCCESS) {
    const newList = mergeUniqueFriends(state.friends, payload.friends).sort((a, b) => new Date(b.msgInfo.createdAt) - new Date(a.msgInfo.createdAt));

    return {
      ...state,
      friends: newList,
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
    const newList = mergeUniqueFriends(state.friends, payload.groups).sort((a, b) => new Date(b.msgInfo.createdAt) - new Date(a.msgInfo.createdAt));
    return {
      ...state,
      groups: payload.groups,
      friends: newList,
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
    const newFriend = [{ fndInfo: payload, msgInfo: { createdAt: Date.now() } }];
    const newList = mergeUniqueFriends(state.friends, newFriend).sort((a, b) => new Date(b.msgInfo.createdAt) - new Date(a.msgInfo.createdAt));
    return {
      ...state,
      friends: newList,
      requestAddFriend: state.requestAddFriend.filter((u) => u._id !== payload._id),
    };
  }

  if (type === ACCEPT_ADD_FRIEND_SOCKET) {
    const newList = mergeUniqueFriends(state.friends, [payload]).sort((a, b) => new Date(b.msgInfo.createdAt) - new Date(a.msgInfo.createdAt));
    return {
      ...state,
      friends: newList,
    };
  }
  if (type === CREATE_NEW_GROUP_SUCCESS) {
    return {
      ...state,
      friends: [payload.message, ...state.friends],
    };
  }
  if (type === REMOVE_MEMBER_SUCCESS) {
    return {
      ...state,
      members: state.members.filter((m) => m.userId._id !== payload.message),
    };
  }
  if (type === LEAVE_GROUP_SUCCESS) {
    return {
      ...state,
      friends: state.friends.filter((f) => f.fndInfo._id !== payload.message),
    };
  }
  if (type === ADD_MEMBER_TO_GROUP_SUCCESS) {
    return {
      ...state,
      members: payload.message,
    };
  }
  if (type === RECALL_MESSAGE_SUCCESS) {
    //find message recall
    const index = state.message.findIndex((m) => m._id === payload.message._id);
    state.message[index].recall = true;

    //last message
    if (index === state.message.length - 1) {
      const conversationIndex = state.friends.findIndex((f) => f.fndInfo._id === payload.message.groupId || f.fndInfo._id === payload.message.receiverId);
      state.friends[conversationIndex].msgInfo.recall = true;
    }
    return { ...state };
  }

  if (type === DELETE_MESSAGE_SUCCESS) {
    //find message delete
    const index = state.message.findIndex((m) => m._id === payload.message._id);
    if (index >= 0) state.message[index].deletedBy = [payload.deletedBy];
    // if deleted message is last message
    if (index === state.message.length - 1) {
      const conversationIndex = state.friends.findIndex((f) => f.fndInfo._id === payload.message.groupId || f.fndInfo._id === payload.message.receiverId);
      state.friends[conversationIndex].msgInfo.deletedBy = [payload.deletedBy];
    }
    return { ...state };
  }
  if (type === RECALL_MESSAGE_SOCKET) {
    if (payload.current) {
      const index = state.message.findIndex((m) => m._id === payload.message._id);
      if (index >= 0) state.message[index].recall = true; //set current message recall realtime
    }
    let conversationIndex;
    if (payload.message.groupId) {
      conversationIndex = state.friends.findIndex((f) => f.fndInfo._id === payload.message.groupId);
    } else if (payload.message.senderId) {
      conversationIndex = state.friends.findIndex((f) => f.fndInfo._id === payload.message.senderId);
    }
    if (conversationIndex >= 0) {
      // if message recall is  last message
      if (state.friends[conversationIndex].msgInfo._id === payload.message._id) {
        state.friends[conversationIndex].msgInfo.recall = true;
      }
    }

    return { ...state };
  }
  if (type === PROMOTE_SUCCESS) {
    const index = state.members.findIndex((m) => m.userId._id === payload.message);
    if (index >= 0) {
      state.members[index].role = "subadmin";
    }
    console.log(state.members);
    return {
      ...state,
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
