import React from "react";
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <div className="register">
      <div className="card">
        <div className="card-header">
          <h3>Đăng nhập</h3>
        </div>

        <div className="card-body">
          <form>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="text" className="form-control" placeholder="Email" id="email" />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <input type="password" className="form-control" placeholder="Password" id="password" />
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
