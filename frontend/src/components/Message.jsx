import React from "react";
import { useSelector } from "react-redux";
import moment from "moment";
import { FaRegCheckCircle } from "react-icons/fa";
import "moment/locale/vi";

const Message = ({ message, currentFriend, scrollRef, members, typingMessage }) => {
  const { myInfo } = useSelector((state) => state.auth);
  return (
    <>
      <div className="message-show">
        {message && message.length > 0
          ? message.map((m, index) =>
              m.senderId === myInfo.id ? (
                <div key={m._id} ref={scrollRef} className="my-message">
                  <div className="image-message">
                    <div className="my-text">
                      <p className="message-text">
                        {m.message.text === "" ? <img loading="lazy" src={`https://iuh-cnm-chatapp.s3.ap-southeast-1.amazonaws.com/${m.message.image}`} alt="" /> : m.message.text}
                        <div className="time">{moment(m.createdAt).format("HH:mm")} </div>
                      </p>
                      {index === message.length - 1 && m.senderId === myInfo.id ? (
                        m.status === "seen" ? (
                          <img className="img" src={`https://iuh-cnm-chatapp.s3.ap-southeast-1.amazonaws.com/${currentFriend.image}`} alt="" />
                        ) : (
                          <span>
                            <FaRegCheckCircle />
                          </span>
                        )
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div key={m._id} ref={scrollRef} className="fd-message">
                  {currentFriend?.name ? <span className="name">{m.senderName}</span> : ""}
                  <div className="image-message-time">
                    <img
                      src={
                        currentFriend?.username
                          ? `https://iuh-cnm-chatapp.s3.ap-southeast-1.amazonaws.com/${currentFriend.image}`
                          : `https://iuh-cnm-chatapp.s3.ap-southeast-1.amazonaws.com/${members.find((u) => u.userId._id === m.senderId)?.userId.image}`
                      }
                      alt={`${m.senderName}`}
                    />
                    <div className="message-time">
                      <div className="fd-text">
                        <p className="message-text">
                          {m.message.text === "" ? <img src={`https://iuh-cnm-chatapp.s3.ap-southeast-1.amazonaws.com/${m.message.image}`} alt="" /> : m.message.text}
                          <div className="time">{moment(m.createdAt).format("HH:mm")}</div>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )
          : ""}

        {}
      </div>
      {typingMessage && typingMessage.message && typingMessage.senderId === currentFriend._id ? (
        <div className="typing-message">
          <div className="fd-message">
            <div className="image-message-time">
              <img src={`https://iuh-cnm-chatapp.s3.ap-southeast-1.amazonaws.com/${currentFriend.image}`} alt="" />
              <div className="message-time">
                <div className="fd-text">
                  <p className="time">Đang nhập...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default Message;
