import axios from "axios";

export const userRegister = (data) => {
  return async (dispatch) => {
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    try {
      const response = await axios.post("/api/register", data, config);
      console.log(response.data);
    } catch (error) {
      console.log(error.response.data);
    }
  };
};
