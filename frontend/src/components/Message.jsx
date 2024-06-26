import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { FaRegCheckCircle } from "react-icons/fa";
import "moment/locale/vi";
import Thumbnail from "./Thumbnail";
import { TbMessageCircleOff } from "react-icons/tb";
import { AiOutlineDelete } from "react-icons/ai";
import { PiShareFatLight } from "react-icons/pi";
import { deleteMessageAction, recallMessageAction } from "../store/actions/messengerAction";
import ForwardMessageModal from "./ForwardMessageModal";

const Message = ({ message, currentFriend, scrollRef, members, typingMessage, socket, friends, forwardMessage }) => {
  const { myInfo } = useSelector((state) => state.auth);
  const imageRegex = /\.(jpg|jpeg|png|gif|bmp)$/;
  const dispatch = useDispatch();
  const [isModalForwardOpen, setModalForwardOpen] = useState(false);
  const [messageForward, setMessageForward] = useState("");

  const handleCloseForwardModal = () => {
    setModalForwardOpen(false);
  };

  const openForwardModal = (message) => {
    setModalForwardOpen(true);
    setMessageForward(message);
  };

  const recallMessage = (message) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thu hồi tin nhắn này?")) {
      const memberIds = members.map((mem) => mem.userId._id).filter((id) => id !== myInfo.id);
      dispatch(recallMessageAction(message));
      message.recall = true;
      message.memberIds = memberIds;
      socket.current.emit("messageRecall", message);
    }
  };
  const deleteMessage = (message) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tin nhắn này ở phía bạn?")) {
      dispatch(deleteMessageAction(message, myInfo.id));
    }
  };
  return (
    <>
      <div className="message-show">
        {message && message.length > 0
          ? message.map((m, index) =>
              m.senderId === myInfo.id ? (
                <div key={m._id} ref={scrollRef} className="my-message">
                  <div className="image-message">
                    <div className="my-text">
                      {m.deletedBy?.includes(myInfo.id) ? (
                        ""
                      ) : m.recall ? (
                        <p className="message-text recall-message">
                          Tin nhắn đã thu hồi
                          <div className="time">{moment(m.createdAt).format("HH:mm")} </div>
                        </p>
                      ) : (
                        <p className="message-text">
                          {m.message.text === "" ? (
                            imageRegex.test(m.message.image) ? (
                              <img loading="lazy" src={`https://iuh-cnm-chatapp.s3.ap-southeast-1.amazonaws.com/${m.message.image}`} alt="" />
                            ) : (
                              <Thumbnail myFile={true} url={m.message.image} />
                            )
                          ) : (
                            m.message.text
                          )}
                          <div className="time">{moment(m.createdAt).format("HH:mm")} </div>
                          <div className="more">
                            <PiShareFatLight className="icon" onClick={() => openForwardModal(m)} />
                            <AiOutlineDelete className="icon" onClick={() => deleteMessage(m)} />
                            <TbMessageCircleOff className="icon" onClick={() => recallMessage(m)} />
                          </div>
                        </p>
                      )}

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
              ) : m.deletedBy?.includes(myInfo.id) ? (
                ""
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
                        {m.recall ? (
                          <p className="message-text recall-message">
                            Tin nhắn đã thu hồi
                            <div className="time">{moment(m.createdAt).format("HH:mm")} </div>
                          </p>
                        ) : (
                          <p className="message-text">
                            {m.message.text === "" ? (
                              imageRegex.test(m.message.image) ? (
                                <img loading="lazy" src={`https://iuh-cnm-chatapp.s3.ap-southeast-1.amazonaws.com/${m.message.image}`} alt="" />
                              ) : (
                                <Thumbnail url={m.message.image} />
                              )
                            ) : (
                              m.message.text
                            )}
                            <div className="time">{moment(m.createdAt).format("HH:mm")}</div>
                            <div className="more">
                              <PiShareFatLight className="icon" onClick={() => openForwardModal(m)} />
                              <AiOutlineDelete className="icon" onClick={() => deleteMessage(m)} />
                            </div>
                          </p>
                        )}
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
      <ForwardMessageModal
        isOpen={isModalForwardOpen}
        onClose={handleCloseForwardModal}
        friends={friends}
        messageForward={messageForward}
        currentFriend={currentFriend}
        forwardMessage={forwardMessage}
      />
    </>
  );
};

export default Message;
