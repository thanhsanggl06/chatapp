import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { userRegister } from "../store/actions/authAction";
import { useAlert } from "react-alert";
import { ERROR_MESSAGE_CLEAR, SUCCESS_MESSAGE_CLEAR } from "../store/types/authType";

const Register = () => {
  const alert = useAlert();
  const navigate = useNavigate();

  const { loading, authenticate, error, successMessage, myInfo } = useSelector((state) => state.auth);

  console.log(myInfo);

  const dispatch = useDispatch();

  const [state, setState] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    image: "defaultAvatar.jpg",
    birthday: "",
  });

  const [loadImage, setLoadImage] = useState("/image/defaultAvatar.jpg");
  const [gender, setGender] = useState("male");

  // inputHandle
  const inputHandle = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  //genderChange
  const onGenderChange = (e) => {
    setGender(e.target.value);
  };

  //fileHandle
  const fileHandle = (e) => {
    if (e.target.files.length !== 0) {
      setState({ ...state, [e.target.name]: e.target.files[0] });
    }

    const fileReader = new FileReader();
    fileReader.onload = () => {
      setLoadImage(fileReader.result);
    };

    fileReader.readAsDataURL(e.target.files[0]);
  };

  //Form submit handle
  const register = (e) => {
    const { username, confirmPassword, email, image, password, birthday } = state;
    e.preventDefault();

    const formData = new FormData();

    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("confirmPassword", confirmPassword);
    formData.append("image", image);
    formData.append("birthday", birthday);
    formData.append("gender", gender);

    dispatch(userRegister(formData));
  };

  useEffect(() => {
    if (authenticate) {
      navigate("/");
    }
    if (successMessage) {
      alert.success(successMessage);
      dispatch({ type: SUCCESS_MESSAGE_CLEAR });
    }
    if (error) {
      error.map((err) => alert.error(err));
      dispatch({ type: ERROR_MESSAGE_CLEAR });
    }
  }, [successMessage, error, authenticate]);

  return (
    <div className="register">
      <div className="card">
        <div className="card-header">
          <h3>Đăng ký</h3>
        </div>

        <div className="card-body">
          <form onSubmit={register}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="text" className="form-control" placeholder="Email" id="email" name="email" onChange={inputHandle} value={state.email} />
            </div>

            <div className="form-group">
              <label htmlFor="username">Tên người dùng</label>
              <input type="text" className="form-control" placeholder="User Name" id="username" name="username" onChange={inputHandle} value={state.username} />
            </div>

            <div className="form-group">
              <label htmlFor="birthday">Ngày sinh</label>
              <input type="date" className="form-control" placeholder="Birthday" id="birthday" name="birthday" onChange={inputHandle} value={state.birthday} />
            </div>

            <div className="form-group">
              <label htmlFor="gender">Giới tính</label>
              <div className="radio-group">
                <div style={{ marginRight: "35%" }}>
                  <input type="radio" name="gender" value="male" id="male" checked={gender === "male"} onChange={onGenderChange} />
                  <label htmlFor="regular">Nam</label>
                </div>
                <div>
                  <input type="radio" name="gender" value="female" id="female" checked={gender === "female"} onChange={onGenderChange} />
                  <label htmlFor="medium">Nữ</label>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <input type="password" className="form-control" placeholder="Password" id="password" name="password" onChange={inputHandle} value={state.password} />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Nhập lại mật khẩu</label>
              <input type="password" className="form-control" placeholder="Confirm Password" id="confirmPassword" name="confirmPassword" onChange={inputHandle} value={state.confirmPassword} />
            </div>

            <div className="form-group">
              <div className="file-image">
                <div className="image">{loadImage ? <img src={loadImage} /> : ""}</div>
                <div className="file">
                  <label htmlFor="image">Chọn hình ảnh</label>
                  <input type="file" className="form-control" id="image" name="image" onChange={fileHandle} />
                </div>
              </div>
            </div>

            <div className="form-group">
              <input type="submit" value="Đăng ký" className="btn" />
            </div>

            <div className="form-group">
              <span>
                <Link to="/login">Đăng nhập vào tài khoản của bạn</Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
