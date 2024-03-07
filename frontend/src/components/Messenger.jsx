import React, { useEffect, useState, useRef } from "react";
import { FaEllipsisH, FaEdit, FaSistrix } from "react-icons/fa";
import ActiveFriend from "./ActiveFriend";
import Friends from "./Friends";
import RightSide from "./RightSide";
import { useDispatch, useSelector } from "react-redux";
import { getFriends, messageSend, getMessage, imageMessageSend, getGroups, getMessageGroup, getGroupMembers } from "../store/actions/messengerAction";
import { io } from "socket.io-client";

const Messenger = () => {
  const dispatch = useDispatch();
  const scrollRef = useRef();
  const socket = useRef();

  const [currentFriend, setCurrentFriend] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [activeFriends, setActiveFriends] = useState("");
  const { myInfo } = useSelector((state) => state.auth);
  const { friends, message, groups, members } = useSelector((state) => state.messenger);

  useEffect(() => {
    socket.current = io("ws://localhost:8000");
  }, []);

  useEffect(() => {
    socket.current.emit("addUser", myInfo.id, myInfo);
  }, []);

  useEffect(() => {
    socket.current.on("getUsers", async (users) => {
      const friendIds = friends?.map((fd) => fd._id);
      const friendsActive = users.filter((u) => {
        return friendIds.includes(u.userId);
      });
      setActiveFriends(friendsActive);
    });
  }, [friends]);

  // const id = useSelector((state) => state.auth.myInfo.id);

  const inputHandle = (e) => {
    setNewMessage(e.target.value);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    let data;
    if (currentFriend.username) {
      data = {
        senderName: myInfo.username,
        receiverId: currentFriend._id,
        message: newMessage ? newMessage : "❤",
      };
    } else {
      data = {
        senderName: myInfo.username,
        groupId: currentFriend._id,
        message: newMessage ? newMessage : "❤",
      };
    }
    dispatch(messageSend(data));
    setNewMessage("");
  };

  const emojiSend = (e) => {
    setNewMessage(`${newMessage}` + e);
  };

  const imageSend = (e) => {
    if (e.target.files.length !== 0) {
      const imageName = e.target.files[0].name;
      const newImageName = Date.now() + imageName;
      let formData = new FormData();
      if (currentFriend.username) {
        formData.append("senderName", myInfo.username);
        formData.append("imageName", newImageName);
        formData.append("receiverId", currentFriend._id);
        formData.append("image", e.target.files[0]);
      } else {
        formData.append("senderName", myInfo.username);
        formData.append("imageName", newImageName);
        formData.append("groupId", currentFriend._id);
        formData.append("image", e.target.files[0]);
      }

      dispatch(imageMessageSend(formData));
    }
  };

  useEffect(() => {
    dispatch(getFriends(myInfo.id));
    dispatch(getGroups());
  }, []);

  useEffect(() => {
    if (friends && friends.length > 0) {
      setCurrentFriend(friends[0]);
    }
  }, [friends]);

  useEffect(() => {
    if (currentFriend.username) {
      dispatch(getMessage(currentFriend?._id));
    } else if (currentFriend.name) {
      dispatch(getMessageGroup(currentFriend?._id));
      dispatch(getGroupMembers(currentFriend?._id));
    }
  }, [currentFriend?._id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  return (
    <div className="messenger">
      <div className="row">
        <div className="col-3">
          <div className="left-side">
            <div className="top">
              <div className="image-name">
                <div className="image">
                  <img src={`/image/${myInfo.image}`} alt="" />
                </div>
                <div className="name">
                  <h3> {myInfo.username} </h3>
                </div>
              </div>

              <div className="icons">
                <div className="icon">
                  <FaEllipsisH />
                </div>
                <div className="icon">
                  <FaEdit />
                </div>
              </div>
            </div>

            <div className="friend-search">
              <div className="search">
                <button>
                  <FaSistrix />
                </button>
                <input type="text" placeholder="Search" className="form-control" />
              </div>
            </div>

            <div className="active-friends">{activeFriends && activeFriends.length > 0 ? <ActiveFriend activeFriends={activeFriends} setCurrentFriend={setCurrentFriend} /> : ""}</div>
            <div className="friends">
              {friends && friends.length > 0
                ? friends.concat(groups).map((fd) => (
                    <div className={currentFriend?._id === fd?._id ? "hover-friend active" : "hover-friend"} onClick={() => setCurrentFriend(fd)}>
                      <Friends friend={fd} />
                    </div>
                  ))
                : "No friend"}
            </div>
          </div>
        </div>
        {currentFriend ? (
          <RightSide
            currentFriend={currentFriend}
            inputHandle={inputHandle}
            newMessage={newMessage}
            sendMessage={sendMessage}
            message={message}
            scrollRef={scrollRef}
            emojiSend={emojiSend}
            imageSend={imageSend}
            members={members}
            activeFriends={activeFriends}
          />
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default Messenger;
