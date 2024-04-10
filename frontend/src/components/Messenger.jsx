import React, { useEffect, useState, useRef } from "react";
import { FaEllipsisH, FaEdit, FaSistrix, FaSignOutAlt, FaUserFriends } from "react-icons/fa";
import { MdGroups } from "react-icons/md";
import ActiveFriend from "./ActiveFriend";
import Friends from "./Friends";
import RightSide from "./RightSide";
import { useDispatch, useSelector } from "react-redux";
import {
  getFriends,
  messageSend,
  getMessage,
  imageMessageSend,
  getGroups,
  getMessageGroup,
  getGroupMembers,
  seenMessage,
  getRequestAddFriends,
  forwardMessageAction,
} from "../store/actions/messengerAction";
import { userLogout } from "../store/actions/authAction";
import { io } from "socket.io-client";
import { useAlert } from "react-alert";
import toast, { Toaster } from "react-hot-toast";
import useSound from "use-sound";
import notificationSound from "../audio/notification.mp3";
import Call from "./Call";
import axios from "axios";
import { ACCEPT_ADD_FRIEND, ACCEPT_ADD_FRIEND_SOCKET, LEAVE_GROUP_SUCCESS, RECALL_MESSAGE_CURRENT, RECALL_MESSAGE_SOCKET } from "../store/types/messengerType";
import ProfileInfo from "./ProfileInfo";
import GroupChatModal from "./GroupChatModal";
import ReiceiverCall from "./ReiceiverCall";
import Peer from "simple-peer";
import { FaD } from "react-icons/fa6";

const Messenger = () => {
  const [notificationSPlay] = useSound(notificationSound);

  const dispatch = useDispatch();
  const scrollRef = useRef();
  const socket = useRef();
  const alert = useAlert();

  const [isCalling, setCalling] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callerSignal, setCallerSignal] = useState();
  const [isReceivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState();
  const [stream, setStream] = useState();
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  const [isModalCallOpen, setModalCallOpen] = useState(false);
  const [isModalGroupOpen, setModalGroupOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("tab1");
  const [currentFriend, setCurrentFriend] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newGroupEvent, setNewGroupEvent] = useState(false);
  const [removedGroup, setRemovedGroup] = useState("");
  const [memberChange, setMemberChange] = useState({ changeStatus: false, groupId: "" });
  const [socketMessage, setSocketMessage] = useState("");
  const [recallMessage, setRecallMessage] = useState("");
  const [newRequest, setNewRequest] = useState(false);
  const [typingMessage, setTypingMessage] = useState("");
  const [activeFriends, setActiveFriends] = useState("");
  const [searchUsers, setSearchUsers] = useState("");
  const { myInfo } = useSelector((state) => state.auth);
  const { friends, message, members, messageSendSuccess, messageGetSuccess, requestAddFriend } = useSelector((state) => state.messenger);

  useEffect(() => {
    socket.current = io("ws://localhost:8000");
    //socket.current = io("ws://54.254.206.58:8000");
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

    socket.current.on("messageRecallResponse", (data) => {
      setRecallMessage(data);
    });

    socket.current.on("acceptFriendResponse", (data) => {
      dispatch({
        type: ACCEPT_ADD_FRIEND_SOCKET,
        payload: data,
      });
    });

    socket.current.on("requestAddFriend", (senderName) => {
      notificationSPlay();
      toast.success(`${senderName} vừa gửi lời mời kết bạn.`);
      setNewRequest(true);
    });

    socket.current.on("groupEventResponse", (data) => {
      if (data.groupId) {
        dispatch({
          type: LEAVE_GROUP_SUCCESS,
          payload: {
            message: data.groupId,
          },
        });
        setRemovedGroup(data.groupId);
      } else {
        setNewGroupEvent(true);
      }
    });

    socket.current.on("memberChangeResponse", (groupId) => {
      setMemberChange({ changeStatus: true, groupId: groupId });
    });
  }, []);

  //realtime create group, add member
  useEffect(() => {
    if (newGroupEvent) {
      dispatch(getGroups());
      setNewGroupEvent(false);
    }
  }, [newGroupEvent]);

  useEffect(() => {
    if (removedGroup) {
      if (currentFriend?._id === removedGroup) {
        setCurrentFriend("");
      }
      setRemovedGroup("");
    }
  }, [removedGroup]);

  useEffect(() => {
    if (memberChange.changeStatus) {
      if (currentFriend?._id === memberChange.groupId) dispatch(getGroupMembers(currentFriend?._id));
      setMemberChange({ changeStatus: false, groupId: "" });
    }
  }, [memberChange.changeStatus]);

  useEffect(() => {
    let current = false;
    if (recallMessage.groupId) {
      if (currentFriend._id === recallMessage.groupId) current = true;
    } else {
      if (currentFriend._id === recallMessage.senderId) current = true;
    }

    dispatch({
      type: RECALL_MESSAGE_SOCKET,
      payload: {
        current: current,
        message: recallMessage,
      },
    });
  }, [recallMessage]);

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
    if (newRequest) {
      dispatch(getRequestAddFriends());
      setNewRequest(false);
    }
  }, [newRequest]);

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

  const forwardMessage = async (listFw, msg) => {
    for (const fd of listFw) {
      let data;
      if (fd.username) {
        data = {
          senderName: myInfo.username,
          receiverId: fd._id,
          message: msg.message,
        };
      } else {
        data = {
          senderName: myInfo.username,
          groupId: fd._id,
          message: msg.message,
        };
      }

      const rs = await dispatch(forwardMessageAction(data));
      if (rs !== false) {
        let datart = rs;
        if (fd.name) {
          const getMemberSuccess = await dispatch(getGroupMembers(fd._id));
          let memberIds;
          if (getMemberSuccess) {
            memberIds = members.map((mem) => mem.userId._id).filter((id) => id !== myInfo.id);
          }
          datart = {
            ...datart,
            memberIds,
          };
        }
        socket.current.emit("sendMessage", datart);
        const indexToMoveUp = friends.findIndex((con) => con.fndInfo._id === fd._id);
        moveFriendToTop(indexToMoveUp);
        friends[0].msgInfo = rs;
        dispatch({
          type: "SOCKET_MESSAGE_NEW",
          payload: {
            friends: friends,
          },
        });
      }
    }
    //back to member default of group
    if (currentFriend.name) {
      dispatch(getGroupMembers(currentFriend._id));
    }
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
        const maxSizeInBytes = 50 * 1024 * 1024; //50mb
        if (selectedFile.size > maxSizeInBytes) {
          alert.error(`Dung lượng tệp tin không được vượt quá 50MB.`);
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
      if (response.data.success) {
        socket.current.emit("addFriend", { senderName: myInfo.username, fdId });
      }
      const index = searchUsers.findIndex((u) => u._id === fdId);
      searchUsers[index].statusFriend = "request";
      setSearchUsers(JSON.parse(JSON.stringify(searchUsers)));
    } catch (error) {
      console.log(error);
    }
  };

  const acceptRequestFriend = async (user) => {
    try {
      const response = await axios.post(`/api/accept-friend-request/${user._id}`);
      console.log(response);
      let index;
      if (searchUsers && searchUsers.length > 0) {
        index = searchUsers.findIndex((u) => u._id === user._id);
      }
      if (index && index !== -1) {
        searchUsers[index].statusFriend = "accepted";
        setSearchUsers(JSON.parse(JSON.stringify(searchUsers)));
      }

      dispatch({
        type: ACCEPT_ADD_FRIEND,
        payload: user,
      });
      const data = {
        to: user._id,
        friend: {
          fndInfo: { _id: myInfo.id, username: myInfo.username, email: myInfo.email, image: myInfo.image },
          msgInfo: { createdAt: Date.now() },
        },
      };
      socket.current.emit("acceptFriend", data);
    } catch (error) {
      console.log(error);
    }
  };

  const changeTab = (tab) => {
    setActiveTab(tab);
  };

  const handleCallVideo = () => {
    setModalCallOpen(true);
    setCalling(true);
    // Thêm logic xử lý khi ấn nút call video ở đây
  };

  const handleCloseModal = () => {
    setModalGroupOpen(false);
    setModalCallOpen(false);
    setCalling(false);
  };

  const handleCloseReiceiverCallModal = () => {
    setReceivingCall(false);
  };

  const handleOpenProfileInfo = () => {
    setProfileOpen(true);
  };

  const handleCloseProfileInfo = () => {
    setProfileOpen(false);
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
                <div
                  className="image"
                  onClick={() => {
                    handleOpenProfileInfo();
                  }}
                >
                  <img src={`https://iuh-cnm-chatapp.s3.ap-southeast-1.amazonaws.com/${myInfo.image}`} alt="" />
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
                                      <img src={`https://iuh-cnm-chatapp.s3.ap-southeast-1.amazonaws.com/${u.image}`} alt="img" />
                                    </div>
                                    <div className="name">
                                      <h3>{u.username}</h3>
                                    </div>
                                  </div>
                                  <div className="add-friend">
                                    {u.statusFriend === "none" ? (
                                      <button onClick={() => addFriend(u._id)}>Kết bạn</button>
                                    ) : u.statusFriend === "pending" ? (
                                      <button onClick={() => acceptRequestFriend(u)}>Chấp nhận</button>
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
                                      <img src={`https://iuh-cnm-chatapp.s3.ap-southeast-1.amazonaws.com/${u.image}`} alt="img" />
                                    </div>
                                    <div className="name">
                                      <h3>{u.username}</h3>
                                    </div>
                                  </div>
                                  <div className="add-friend">
                                    <button onClick={() => acceptRequestFriend(u)}>Chấp nhận</button>
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
                <div className="icon" onClick={() => setModalGroupOpen(true)}>
                  <MdGroups />
                </div>
                <div onClick={() => setHide(!hide)} className="icon">
                  <FaEllipsisH />
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
            myInfo={myInfo}
            friends={friends}
            setCurrentFriend={setCurrentFriend}
            setCalling={setCalling}
            socket={socket}
            forwardMessage={forwardMessage}
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
      <Call isOpen={isModalCallOpen} onClose={handleCloseModal} isCalling={isCalling} stream={stream} setStream={setStream} myVideo={myVideo} userVideo={userVideo}></Call>
      <ProfileInfo isOpen={profileOpen} onClose={handleCloseProfileInfo} myInfo={myInfo}></ProfileInfo>
      <GroupChatModal isOpen={isModalGroupOpen} onClose={handleCloseModal} socket={socket}></GroupChatModal>
      {/* <ReiceiverCall isOpen={isReceivingCall} onClose={handleCloseReiceiverCallModal} answerCall={answerCall} myVideo={myVideo} setStream={setStream}></ReiceiverCall> */}
    </div>
  );
};

export default Messenger;
