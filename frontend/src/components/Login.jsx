import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { checkAccountVerification, userLogin } from "../store/actions/authAction";
import { useDispatch, useSelector } from "react-redux";
import { useAlert } from "react-alert";
import { ERROR_MESSAGE_CLEAR, SUCCESS_MESSAGE_CLEAR } from "../store/types/authType";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const alert = useAlert();

  const { loading, authenticate, error, successMessage, myInfo, verification } = useSelector((state) => state.auth);

  const [state, setState] = useState({
    email: "",
    password: "",
  });

  const inputHandle = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  const login = (e) => {
    e.preventDefault();

    dispatch(userLogin(state));
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
  }, [successMessage, error, authenticate, verification]);

  return (
    <div className="register">
      <div className="card">
        <div className="card-header">
          <h3>Đăng nhập</h3>
        </div>

        <div className="card-body">
          <form onSubmit={login}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="text" onChange={inputHandle} className="form-control" placeholder="Email" id="email" name="email" value={state.email} />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <input type="password" onChange={inputHandle} className="form-control" placeholder="Password" id="password" name="password" value={state.password} />
            </div>

            <div className="form-group">
              <input type="submit" value="Đăng nhập" className="btn" />
            </div>

            <div className="form-group">
              <span>
                <Link to="/register">Chưa có tài khoản</Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
