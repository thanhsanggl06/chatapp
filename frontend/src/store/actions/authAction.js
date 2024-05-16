import axios from "axios";
import {
  CHECK_ACCOUNT_VERIFICATION,
  LOGIN_FAIL,
  LOGIN_SUCCESS,
  LOGOUT_SUCCESS,
  REGISTER_FAIL,
  REGISTER_SUCCESS,
  SEND_EMAIL_FAIL,
  SEND_EMAIL_SUCCESS,
  VERIFY_FAIL,
  VERIFY_SUCCESS,
} from "../types/authType";

export const userRegister = (data) => {
  return async (dispatch) => {
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    try {
      const response = await axios.post("/api/register", data, config);
      localStorage.setItem("authToken", response.data.token);

      dispatch({
        type: REGISTER_SUCCESS,
        payload: {
          successMessage: response.data.successMessage,
          token: response.data.token,
        },
      });
    } catch (error) {
      dispatch({
        type: REGISTER_FAIL,
        payload: {
          error: error.response.data.error.errorMessage,
        },
      });
    }
  };
};

export const userLogin = (data) => {
  return async (dispatch) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      const response = await axios.post("/api/login", data, config);
      localStorage.setItem("authToken", response.data.token);

      dispatch({
        type: LOGIN_SUCCESS,
        payload: {
          successMessage: response.data.successMessage,
          token: response.data.token,
        },
      });
    } catch (error) {
      dispatch({
        type: LOGIN_FAIL,
        payload: {
          error: error.response.data.error.errorMessage,
        },
      });
    }
  };
};

export const checkAccountVerification = (id) => async (dispatch) => {
  try {
    const response = await axios.post(`/api/check-verification/${id}`);
    dispatch({
      type: CHECK_ACCOUNT_VERIFICATION,
      payload: {
        verification: response.data.verification,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export const sendVerifyCode = () => async (dispatch) => {
  try {
    const response = await axios.post(`/api/send-verify-code`);
  } catch (error) {
    console.log(error);
  }
};

export const checkVerifyCode = (code) => async (dispatch) => {
  try {
    const response = await axios.post(`/api/check-verification-code`, { code: code });
    dispatch({
      type: VERIFY_SUCCESS,
      payload: {
        successMessage: response.data.message,
        verification: response.data.verification,
      },
    });
  } catch (error) {
    console.log(error);
    dispatch({
      type: VERIFY_FAIL,
      payload: {
        error: error.response.data.message,
        verification: error.response.data.verification,
      },
    });
  }
};

export const userLogout = () => async (dispatch) => {
  try {
    const response = await axios.post("/api/user-logout");
    if (response.data.success) {
      localStorage.removeItem("authToken");
      dispatch({ type: LOGOUT_SUCCESS });
    }
  } catch (error) {}
};
