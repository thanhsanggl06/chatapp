import axios from "axios";
import {
  CREATE_NEW_GROUP_SUCCESS,
  FRIEND_GET_SUCCESS,
  GET_MEMBER_SUCCESS,
  GET_REQUEST_ADD_FRIEND_SUCCESS,
  GROUPS_GET_SUCCESS,
  MESSAGE_GET_SUCCESS,
  MESSAGE_SEND_SUCCESS,
  REMOVE_MEMBER_SUCCESS,
} from "../types/messengerType";

export const getFriends = (id) => async (dispatch) => {
  try {
    const response = await axios.get(`/api/get-friends/${id}`);
    dispatch({
      type: FRIEND_GET_SUCCESS,
      payload: {
        friends: response.data.friends,
      },
    });
  } catch (error) {
    console.log(error.response.data);
  }
};

export const getGroups = () => async (dispatch) => {
  try {
    const response = await axios.get(`/api/get-groups`);
    dispatch({
      type: GROUPS_GET_SUCCESS,
      payload: {
        groups: response.data.groups,
      },
    });
  } catch (error) {
    console.log(error.response.data);
  }
};

export const getGroupMembers = (id) => async (dispatch) => {
  try {
    const response = await axios.get(`/api/get-member-group/${id}`);
    dispatch({
      type: GET_MEMBER_SUCCESS,
      payload: {
        members: response.data.members,
      },
    });
  } catch (error) {
    console.log(error.response.data);
  }
};

export const messageSend = (data) => async (dispatch) => {
  try {
    const response = await axios.post("/api/send-message", data);
    dispatch({
      type: MESSAGE_SEND_SUCCESS,
      payload: {
        message: response.data.message,
      },
    });
  } catch (error) {
    console.log(error.response.data);
  }
};

export const getMessage = (id) => {
  return async (dispatch) => {
    try {
      const response = await axios.get(`/api/get-message/${id}`);
      dispatch({
        type: MESSAGE_GET_SUCCESS,
        payload: {
          message: response.data.message,
        },
      });
    } catch (error) {
      console.log(error);
    }
  };
};

export const getMessageGroup = (id) => {
  return async (dispatch) => {
    try {
      const response = await axios.get(`/api/get-message-group/${id}`);
      dispatch({
        type: MESSAGE_GET_SUCCESS,
        payload: {
          message: response.data.message,
        },
      });
    } catch (error) {
      console.log(error);
    }
  };
};

export const createNewGroup = (data) => {
  return async (dispatch) => {
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    try {
      const response = await axios.post(`/api/create-new-group`, data, config);
      dispatch({
        type: CREATE_NEW_GROUP_SUCCESS,
        payload: {
          message: response.data.message,
        },
      });
    } catch (error) {
      console.log(error);
    }
  };
};

export const imageMessageSend = (data) => async (dispatch) => {
  try {
    const response = await axios.post(`/api/image-message-send`, data);
    dispatch({
      type: MESSAGE_SEND_SUCCESS,
      payload: {
        message: response.data.message,
      },
    });
  } catch (error) {
    console.log(error.response.data);
  }
};

export const seenMessage = (msg) => async (dispatch) => {
  try {
    const response = await axios.post(`/api/seen-message`, msg);
  } catch (error) {
    console.log(error.response.message);
  }
};

export const getRequestAddFriends = () => async (dispatch) => {
  try {
    const response = await axios.get("/api/get-requestAddFriends");
    dispatch({
      type: GET_REQUEST_ADD_FRIEND_SUCCESS,
      payload: {
        request: response.data.request,
      },
    });
  } catch (error) {
    console.log(error.response.message);
  }
};

export const removeMember = (groupId, userId) => async (dispatch) => {
  try {
    const response = await axios.delete(`/api/group/${groupId}/remove-member/${userId}`);
    dispatch({
      type: REMOVE_MEMBER_SUCCESS,
      payload: {
        message: userId,
      },
    });
  } catch (error) {
    console.log(error.response.message);
  }
};
