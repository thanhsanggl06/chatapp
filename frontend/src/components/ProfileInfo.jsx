import React, { useEffect } from "react";

const ProfileInfo = ({ isOpen, onClose, myInfo }) => {
  return (
    <div className={`modal ${isOpen ? "open" : ""}`}>
      <div className="modal-profile">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <h2>Thông tin người dùng</h2>
        <div className="profile">
          <div className="avatar">
            <img src={`https://iuh-cnm-chatapp.s3.ap-southeast-1.amazonaws.com/${myInfo.image}`} alt="" />
          </div>
          <div className="info">
            <h5>{myInfo.username}</h5>
            <h5>{myInfo.email}</h5>
            <h5>{new Date(myInfo.birthday).toLocaleDateString("vi-VN")}</h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
