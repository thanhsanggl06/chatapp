import React from "react";
import { FaPhoneAlt, FaVideo, FaRocketchat } from "react-icons/fa";
import Message from "./Message";
import MessageSend from "./MessageSend";
import FriendInfo from "./FriendInfo";

const RightSide = (props) => {
  const {
    currentFriend,
    newMessage,
    inputHandle,
    sendMessage,
    message,
    scrollRef,
    emojiSend,
    imageSend,
    members,
    activeFriends,
    handleCallVideo,
    typingMessage,
    myInfo,
    friends,
    setCurrentFriend,
    setModalGroupOpen,
    socket,
    forwardMessage,
  } = props;
  return (
    <div className="col-9">
      <div className="right-side">
        <input type="checkbox" id="dot" />
        <div className="row">
          <div className="col-8">
            <div className="message-send-show">
              <div className="header">
                <div className="image-name">
                  <div className="image">
                    <img src={`https://iuh-cnm-chatapp.s3.ap-southeast-1.amazonaws.com/${currentFriend.image}`} alt="" />
                    {activeFriends && activeFriends.length > 0 && activeFriends.some((af) => af.userInfo.id === currentFriend._id) ? <div className="active-icon"></div> : ""}
                  </div>
                  <div className="name">
                    <h3> {currentFriend.username ? currentFriend.username : currentFriend.name} </h3>
                  </div>
                </div>

                <div className="icons">
                  <div className="icon">
                    <FaPhoneAlt />
                  </div>

                  <div className="icon" onClick={handleCallVideo}>
                    <FaVideo />
                  </div>

                  <div className="icon">
                    <label htmlFor="dot">
                      <FaRocketchat />
                    </label>
                  </div>
                </div>
              </div>
              <Message
                message={message}
                currentFriend={currentFriend}
                scrollRef={scrollRef}
                members={members}
                typingMessage={typingMessage}
                socket={socket}
                friends={friends}
                forwardMessage={forwardMessage}
              />
              <MessageSend newMessage={newMessage} inputHandle={inputHandle} sendMessage={sendMessage} emojiSend={emojiSend} imageSend={imageSend} />
            </div>
          </div>

          <div className="col-4">
            <FriendInfo friends={friends} currentFriend={currentFriend} activeFriends={activeFriends} members={members} myInfo={myInfo} setCurrentFriend={setCurrentFriend} socket={socket} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSide;
