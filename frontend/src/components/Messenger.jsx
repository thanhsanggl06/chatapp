import React, { useEffect, useState, useRef } from "react";
import { FaEllipsisH, FaEdit, FaSistrix } from "react-icons/fa";
import ActiveFriend from "./ActiveFriend";
import Friends from "./Friends";
import RightSide from "./RightSide";
import { useDispatch, useSelector } from "react-redux";
import { getFriends, messageSend, getMessage } from "../store/actions/messengerAction";

const Messenger = () => {
  const dispatch = useDispatch();
  const scrollRef = useRef();
  // const id = useSelector((state) => state.auth.myInfo.id);
  const [currentFriend, setCurrentFriend] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const inputHandle = (e) => {
    setNewMessage(e.target.value);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    const data = {
      senderName: myInfo.username,
      receiverId: currentFriend._id,
      message: newMessage ? newMessage : "❤",
    };
    // console.log(newMessage);
    dispatch(messageSend(data));
    setNewMessage("");
  };

  const { myInfo } = useSelector((state) => state.auth);
  const { friends, message } = useSelector((state) => state.messenger);

  useEffect(() => {
    dispatch(getFriends(myInfo.id));
  }, []);

  useEffect(() => {
    if (friends && friends.length > 0) {
      setCurrentFriend(friends[0]);
    }
  }, [friends]);

  useEffect(() => {
    dispatch(getMessage(currentFriend?._id));
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

            <div className="active-friends">
              <ActiveFriend />
            </div>
            <div className="friends">
              {friends && friends.length > 0
                ? friends.map((fd) => (
                    <div className={currentFriend._id === fd._id ? "hover-friend active" : "hover-friend"} onClick={() => setCurrentFriend(fd)}>
                      <Friends friend={fd} />
                    </div>
                  ))
                : "No friend"}
            </div>
          </div>
        </div>
        {currentFriend ? <RightSide currentFriend={currentFriend} inputHandle={inputHandle} newMessage={newMessage} sendMessage={sendMessage} message={message} scrollRef={scrollRef} /> : ""}
      </div>
    </div>
  );
};

export default Messenger;
