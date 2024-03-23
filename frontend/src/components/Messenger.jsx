import React, { useEffect, useState, useRef } from "react";
import { FaEllipsisH, FaEdit, FaSistrix, FaSignOutAlt, FaUserFriends } from "react-icons/fa";
import ActiveFriend from "./ActiveFriend";
import Friends from "./Friends";
import RightSide from "./RightSide";
import { useDispatch, useSelector } from "react-redux";
import { getFriends, messageSend, getMessage, imageMessageSend, getGroups, getMessageGroup, getGroupMembers, seenMessage, getRequestAddFriends } from "../store/actions/messengerAction";
import { userLogout } from "../store/actions/authAction";
import { io } from "socket.io-client";
import { useAlert } from "react-alert";
import toast, { Toaster } from "react-hot-toast";
import useSound from "use-sound";
import notificationSound from "../audio/notification.mp3";
import Call from "./Call";
import axios from "axios";
import { ACCEPT_ADD_FRIEND } from "../store/types/messengerType";

const Messenger = () => {
  const [notificationSPlay] = useSound(notificationSound);

  const dispatch = useDispatch();
  const scrollRef = useRef();
  const socket = useRef();
  const alert = useAlert();

  const [isModalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("tab1");
  const [currentFriend, setCurrentFriend] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [socketMessage, setSocketMessage] = useState("");
  const [typingMessage, setTypingMessage] = useState("");
  const [activeFriends, setActiveFriends] = useState("");
  const [searchUsers, setSearchUsers] = useState("");
  const { myInfo } = useSelector((state) => state.auth);
  const { friends, message, members, messageSendSuccess, messageGetSuccess, requestAddFriend } = useSelector((state) => state.messenger);

  useEffect(() => {
    socket.current = io("ws://localhost:8000");
    socket.current.on("getMessage", (data) => {
      setSocketMessage(data);
    });
    socket.current.on("typingMessageGet", (data) => {
      setTypingMessage(data);
    });

    socket.current.on("msgSeenResponse", (msg) => {
      dispatch({
        type: "SEEN_MESSAGE",
        payload: {
          msgInfo: msg,
        },
      });
    });
  }, []);

  const moveFriendToTop = (indexToMoveUp) => {
    if (indexToMoveUp !== -1 && indexToMoveUp !== 0) {
      const removedElement = friends.splice(indexToMoveUp, 1);
      friends.unshift(...removedElement);
    }
  };

  useEffect(() => {
    if (socketMessage && socketMessage.groupId) {
      if (currentFriend._id === socketMessage.groupId && socketMessage.senderId !== myInfo.id) {
        dispatch({
          type: "SOCKET_MESSAGE",
          payload: {
            message: socketMessage,
          },
        });
      }
    } else {
      if (socketMessage && currentFriend) {
        if (socketMessage.senderId === currentFriend._id && socketMessage.receiverId === myInfo.id) {
          socketMessage.status = "seen";
          dispatch({
            type: "SOCKET_MESSAGE",
            payload: {
              message: socketMessage,
            },
          });

          dispatch(seenMessage(socketMessage));
          socket.current.emit("messageSeen", socketMessage);
        }
      }
    }
  }, [socketMessage]);

  useEffect(() => {
    let indexToMoveUp = -1;
    if (socketMessage && socketMessage.senderId !== currentFriend._id && socketMessage.receiverId === myInfo.id) {
      notificationSPlay();
      toast.success(`${socketMessage.senderName} vừa gửi tin nhắn mới.`);
    } else if (socketMessage.groupId && socketMessage.groupId !== currentFriend._id) {
      notificationSPlay();
      toast.success(`Bạn có tin nhắn mới`);
    }
    if (socketMessage && socketMessage.groupId) {
      indexToMoveUp = friends.findIndex((fd) => fd.fndInfo._id === socketMessage.groupId);
    } else if (socketMessage && socketMessage.senderId) {
      indexToMoveUp = friends.findIndex((fd) => fd.fndInfo._id === socketMessage.senderId);
    }
    moveFriendToTop(indexToMoveUp);
    if (socketMessage && friends.length > 0) friends[0].msgInfo = socketMessage;
    dispatch({
      type: "SOCKET_MESSAGE_NEW",
      payload: {
        friends: friends,
      },
    });
    setSocketMessage("");
  }, [socketMessage]);

  useEffect(() => {
    // socket.current.emit("addUser", myInfo.id, myInfo);
    dispatch(getRequestAddFriends());
  }, []);

  useEffect(() => {
    socket.current.emit("addUser", myInfo.id, myInfo);
    socket.current.on("getUsers", async (users) => {
      const friendIds = friends?.map((fd) => fd.fndInfo._id);
      const friendsActive = users.filter((u) => {
        return friendIds.includes(u.userId);
      });
      setActiveFriends(friendsActive);
    });
  }, [friends]);

  // const id = useSelector((state) => state.auth.myInfo.id);

  const inputHandle = (e) => {
    setNewMessage(e.target.value);

    socket.current.emit("typingMessage", {
      senderId: myInfo.id,
      receiverId: currentFriend._id,
      msg: e.target.value,
    });
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

    // socket.current.emit("sendMessage", datart);
    socket.current.emit("typingMessage", {
      senderId: myInfo.id,
      receiverId: currentFriend._id,
      msg: "",
    });
    dispatch(messageSend(data));
    setNewMessage("");
  };

  const emojiSend = (e) => {
    setNewMessage(`${newMessage}` + e);
    socket.current.emit("typingMessage", {
      senderId: myInfo.id,
      receiverId: currentFriend._id,
      msg: `${newMessage}` + e,
    });
  };

  const imageSend = (e) => {
    if (e.target.files.length !== 0) {
      // check valid file size
      const selectedFile = e.target.files[0];
      if (selectedFile) {
        const maxSizeInBytes = 2 * 1024 * 1024;
        if (selectedFile.size > maxSizeInBytes) {
          alert.error(`Dung lượng tệp tin không được vượt quá 2MB.`);
          e.target.value = null; // Reset input value
          return;
        }
      }
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
    if (messageSendSuccess) {
      let data = message[message.length - 1];
      if (currentFriend.name) {
        const memberIds = members.map((mem) => mem.userId._id).filter((id) => id !== myInfo.id);
        data = {
          ...data,
          memberIds,
        };
      }
      socket.current.emit("sendMessage", data);
      const indexToMoveUp = friends.findIndex((fd) => fd.fndInfo._id === currentFriend._id);
      moveFriendToTop(indexToMoveUp);
      friends[0].msgInfo = message[message.length - 1];
      dispatch({
        type: "SOCKET_MESSAGE_NEW",
        payload: {
          friends: friends,
        },
      });
    }
  }, [messageSendSuccess]);

  useEffect(() => {
    dispatch(getFriends(myInfo.id));
    dispatch(getGroups());
  }, []);

  // useEffect(() => {
  //   if (friends && friends.length > 0) {
  //     // setCurrentFriend(friends[0].fndInfo);
  //   }
  // }, [friends]);

  useEffect(() => {
    if (message.length > 0) {
      if (message[message.length - 1].senderId !== myInfo.id && message[message.length - 1].status !== "seen") {
        if (!currentFriend.name) socket.current.emit("messageSeen", message[message.length - 1]);
        dispatch({
          type: "UPDATE",
          payload: { id: currentFriend._id },
        });
        dispatch(seenMessage({ _id: message[message.length - 1]._id }));
      }
    }
    dispatch({ type: "MESSAGE_GET_SUCCESS_CLEAR" });
  }, [messageGetSuccess]);

  useEffect(() => {
    if (currentFriend.username) {
      dispatch(getMessage(currentFriend?._id));
    } else if (currentFriend.name) {
      dispatch(getMessageGroup(currentFriend?._id));
      dispatch(getGroupMembers(currentFriend?._id));
    }
  }, [currentFriend?._id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "auto" });
  }, [message]);

  const [hide, setHide] = useState(true);
  const [afHide, setAfHide] = useState(true);

  const logout = () => {
    socket.current.emit("logout", myInfo.id);
    dispatch(userLogout());
  };

  const search = (e) => {
    const getFriendClass = document.getElementsByClassName("hover-friend");
    const frienNameClass = document.getElementsByClassName("Fd_name");
    for (var i = 0; i < getFriendClass.length, i < frienNameClass.length; i++) {
      let text = frienNameClass[i].innerText.toLowerCase();
      if (text.indexOf(e.target.value.toLowerCase()) > -1) {
        getFriendClass[i].style.display = "";
      } else {
        getFriendClass[i].style.display = "none";
      }
    }
  };

  const handleSearchUser = async (e) => {
    if (e.target.value !== "") {
      const response = await axios.get(`/api/search?q=${e.target.value}`);
      setSearchUsers(response.data.users);
      console.log(response.data.users);
    } else {
      setSearchUsers([]);
    }
  };

  const addFriend = async (fdId) => {
    try {
      const response = await axios.post(`/api/add-friend/${fdId}`);
      const index = searchUsers.findIndex((u) => u._id === fdId);
      searchUsers[index].statusFriend = "request";
      setSearchUsers(JSON.parse(JSON.stringify(searchUsers)));
    } catch (error) {
      console.log(error);
    }
  };

  const acceptRequestFriend = async (fdId) => {
    try {
      const response = await axios.post(`/api/accept-friend-request/${fdId}`);
      let index;
      if (searchUsers && searchUsers.length > 0) {
        index = searchUsers.findIndex((u) => u._id === fdId);
      }
      if (index && index !== -1) {
        searchUsers[index].statusFriend = "accepted";
        setSearchUsers(JSON.parse(JSON.stringify(searchUsers)));
      }
     
        dispatch({
          type: ACCEPT_ADD_FRIEND,
          payload: requestAddFriend.filter(u => u._id !== fdId)
        });
    } catch (error) {
      console.log(error);
    }
  };

  const changeTab = (tab) => {
    setActiveTab(tab);
  };

  const handleCallVideo = () => {
    setModalOpen(true);
    // Thêm logic xử lý khi ấn nút call video ở đây
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <div className="messenger">
      <Toaster
        position={"top-right"}
        reverseOrder={false}
        toastOptions={{
          style: {
            fontSize: "18px",
          },
        }}
      />
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
                  {requestAddFriend && requestAddFriend.length > 0 && <div className="request-add"></div>}
                  <FaUserFriends onClick={() => setAfHide(!afHide)} />
                  <div className={afHide ? "search_friend" : "search_friend show"}>
                    <div className="tab-buttons">
                      <button className={activeTab === "tab1" ? "active" : ""} onClick={() => changeTab("tab1")}>
                        Tìm kiếm
                      </button>
                      <button className={activeTab === "tab2" ? "active" : ""} onClick={() => changeTab("tab2")}>
                        Lời mời
                        {requestAddFriend && requestAddFriend.length > 0 && <div className="request-add"></div>}
                      </button>
                    </div>

                    {/* Nội dung của tab */}
                    <div className="tab-content">
                      {/* Hiển thị nội dung tương ứng với tab active */}
                      {activeTab === "tab1" && (
                        <div>
                          <div className="search">
                            <button>
                              <FaSistrix />
                            </button>
                            <input onChange={handleSearchUser} type="text" placeholder="Search" className="form-control" />
                          </div>
                          {searchUsers && searchUsers.length > 0 ? (
                            <div className="search_results">
                              {searchUsers.map((u) => (
                                <div className="user">
                                  <div className="user-info">
                                    <div className="image">
                                      <img src={`/image/${u.image}`} alt="img" />
                                    </div>
                                    <div className="name">
                                      <h3>{u.username}</h3>
                                    </div>
                                  </div>
                                  <div className="add-friend">
                                    {u.statusFriend === "none" ? (
                                      <button onClick={() => addFriend(u._id)}>Kết bạn</button>
                                    ) : u.statusFriend === "pending" ? (
                                      <button onClick={() => acceptRequestFriend(u._id)}>Kết bạn</button>
                                    ) : (
                                      ""
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            ""
                          )}
                        </div>
                      )}
                      {activeTab === "tab2" && (
                        <div>
                          {requestAddFriend && requestAddFriend.length > 0 ? (
                            <div className="search_results">
                              {requestAddFriend.map((u) => (
                                <div className="user">
                                  <div className="user-info">
                                    <div className="image">
                                      <img src={`/image/${u.image}`} alt="img" />
                                    </div>
                                    <div className="name">
                                      <h3>{u.username}</h3>
                                    </div>
                                  </div>
                                  <div className="add-friend">
                                    <button onClick={() => acceptRequestFriend(u._id)}>Chấp nhận</button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            ""
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div onClick={() => setHide(!hide)} className="icon">
                  <FaEllipsisH />
                </div>
                <div className="icon">
                  <FaEdit />
                </div>
                <div className={hide ? "theme_logout" : "theme_logout show"}>
                  <div onClick={logout} className="logout">
                    <FaSignOutAlt /> Đăng xuất
                  </div>
                </div>
              </div>
            </div>

            <div className="friend-search">
              <div className="search">
                <button>
                  <FaSistrix />
                </button>
                <input onChange={search} type="text" placeholder="Search" className="form-control" />
              </div>
            </div>

            <div className="active-friends">{activeFriends && activeFriends.length > 0 ? <ActiveFriend activeFriends={activeFriends} setCurrentFriend={setCurrentFriend} /> : ""}</div>
            <div className="friends">
              {friends && friends.length > 0
                ? friends.map((fd) => (
                    <div key={fd.fndInfo._id} className={currentFriend?._id === fd?.fndInfo._id ? "hover-friend active" : "hover-friend"} onClick={() => setCurrentFriend(fd.fndInfo)}>
                      <Friends myInfo={myInfo} friend={fd} />
                    </div>
                  ))
                : ""}
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
            handleCallVideo={handleCallVideo}
            typingMessage={typingMessage}
          />
        ) : (
          <div className="welcome">
            <h3>Chào mừng bạn đến với ứng dụng Chatiuh</h3>
            <div className="img-welcome">
              <img src="https://i.pinimg.com/originals/ea/0e/46/ea0e4660412b069442f5600926b18ae0.png" alt="Chào mừng bạn đến với ứng dụng" />
            </div>
          </div>
        )}
      </div>
      <Call isOpen={isModalOpen} onClose={handleCloseModal}></Call>
    </div>
  );
};

export default Messenger;
