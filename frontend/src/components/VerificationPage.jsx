import React, { useEffect, useState } from "react";
import { useAlert } from "react-alert";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { checkAccountVerification, checkVerifyCode, sendVerifyCode, userLogout } from "../store/actions/authAction";
import { ERROR_MESSAGE_CLEAR, SUCCESS_MESSAGE_CLEAR } from "../store/types/authType";

const VerificationPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const alert = useAlert();

  const [code, setCode] = useState("");

  const { loading, authenticate, error, successMessage, myInfo, verification } = useSelector((state) => state.auth);

  const inputHandle = (e) => {
    setCode(e.target.value);
  };

  const logout = () => {
    dispatch(userLogout());
  };

  const handleCheckVerifyCode = (e) => {
    e.preventDefault();

    dispatch(checkVerifyCode(code));
  };

  useEffect(() => {
    if (authenticate) {
      dispatch(checkAccountVerification(myInfo.id));
    }
    if (!authenticate) {
      navigate("/login");
    }
    if (authenticate && verification) {
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
    <div className="wrapper">
      <div className="verification-container">
        <div className="verification-box">
          <button className="logout-button" onClick={logout}>
            Đăng xuất
          </button>
          <h2>Xác Thực Tài Khoản Của Bạn</h2>
          <p>
            Mã xác minh đã được gửi đến email <strong>{myInfo.email}</strong> của bạn. Vui lòng nhập mã vào ô bên dưới để xác minh tài khoản của bạn.
          </p>
          <form onSubmit={handleCheckVerifyCode}>
            <label htmlFor="verification-code">Mã xác minh</label>
            <input type="text" id="verification-code" onChange={inputHandle} name="verification-code" value={code} required />
            <input type="submit" value="Xác minh" className="btn" />
          </form>
          <p className="resend">
            Chưa nhận được mã xác minh?{" "}
            <a
              onClick={() =>
                dispatch(sendVerifyCode())
                  .then(() => {
                    alert.success("Mã xác minh đã được gửi lại thành công!");
                  })
                  .catch(() => {
                    alert.error("Đã xảy ra lỗi khi gửi lại mã xác minh");
                  })
              }
            >
              Gửi lại
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
