import axios from "axios";
import { FRIEND_GET_SUCCESS, GET_MEMBER_SUCCESS, GROUPS_GET_SUCCESS, MESSAGE_GET_SUCCESS, MESSAGE_SEND_SUCCESS } from "../types/messengerType";

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
