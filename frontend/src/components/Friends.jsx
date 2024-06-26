import React from "react";
import moment from "moment";
import { FaRegCheckCircle } from "react-icons/fa";
import "moment/locale/vi";

const Friends = (props) => {
  const { fndInfo, msgInfo } = props.friend;
  const { id } = props.myInfo;
  return (
    <div className="friend">
      <div className="friend-image">
        <div className="image">
          <img src={`https://iuh-cnm-chatapp.s3.ap-southeast-1.amazonaws.com/${fndInfo.image}`} alt="" />
        </div>
      </div>

      <div className="friend-name-seen">
        <div className="friend-name">
          <h4 className={msgInfo.senderId !== id && msgInfo.status !== undefined && msgInfo.status !== "seen" ? "unseen_message Fd_name" : "Fd_name"}>
            {fndInfo?.username ? fndInfo?.username : fndInfo?.name}
          </h4>
          <div className="msg-time">
            {msgInfo && msgInfo.senderId === id ? <span>Bạn :</span> : <span></span>}
            {msgInfo.deletedBy?.includes(id) ? (
              ""
            ) : msgInfo.recall ? (
              <span>Tin nhắn đã thu hồi</span>
            ) : msgInfo && msgInfo.message?.text ? (
              <span>{msgInfo.message.text.slice(0, 10) + "..."}</span>
            ) : msgInfo && msgInfo.message?.image ? (
              <span>Đã gửi 1 file</span>
            ) : (
              <span>Đã trở thành bạn bè</span>
            )}

            <span>{msgInfo && msgInfo.message ? "-" + moment(msgInfo.createdAt).startOf("mini").fromNow() : ""}</span>
          </div>
        </div>
        {id === msgInfo?.senderId && fndInfo.username ? (
          <div className="seen-unseen-icon">
            {msgInfo.status === "seen" ? (
              <img src={`https://iuh-cnm-chatapp.s3.ap-southeast-1.amazonaws.com/${fndInfo.image}`} alt="" />
            ) : (
              <div className="delivared">
                {" "}
                <FaRegCheckCircle />
              </div>
            )}
          </div>
        ) : id !== msgInfo?.senderId ? (
          <div className="seen-unseen-icon">{msgInfo?.status !== undefined && msgInfo?.status !== "seen" ? <div className="seen-icon"></div> : ""}</div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default Friends;
