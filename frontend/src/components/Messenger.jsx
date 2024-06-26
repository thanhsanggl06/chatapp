import React, { useEffect, useState, useRef } from "react";
import { FaEllipsisH, FaSistrix, FaSignOutAlt, FaUserFriends } from "react-icons/fa";
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
import { checkAccountVerification, sendVerifyCode, userLogout } from "../store/actions/authAction";
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
import { useNavigate } from "react-router-dom";
import IncomingCall from "./IncomingCall";
import OutcomingCall from "./OutcomingCall";
import Peer from "peerjs";

const Messenger = () => {
  const [notificationSPlay] = useSound(notificationSound);

  const dispatch = useDispatch();
  const scrollRef = useRef();
  const socket = useRef();
  const alert = useAlert();
  const navigate = useNavigate();

  //for call
  const [outcoming, setOutcoming] = useState(false);
  const [incoming, setIncoming] = useState(false);
  const [calling, setIsCalling] = useState(false);
  const [modalIncoming, setModalIncoming] = useState(false);
  const [caller, setCaller] = useState();
  const [peerId, setPeerId] = useState(null);
  const peer = useRef(null);
  const [friendPeerId, setFriendPeerId] = useState();
  const currentCall = useRef(null);

  //

  const [myStream, setStream] = useState();
  const [remoteStream, setRemoteStream] = useState(null);
  const myVideo = useRef();
  const userVideo = useRef();

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
  const { myInfo, verification } = useSelector((state) => state.auth);
  const { friends, message, members, messageSendSuccess, messageGetSuccess, requestAddFriend } = useSelector((state) => state.messenger);

  useEffect(() => {
    // socket.current = io("ws://192.168.1.141:8000");
    socket.current = io("ws://13.212.127.23:8000");
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

    //for call
    socket.current.on("incomingCall", (data) => {
      incomingCall(data);
    });

    socket.current.on("callResponse", (data) => {
      if (data.accept) {
        setFriendPeerId(data.friendPeerId);
        callVideo();
      } else {
        if (myStream) {
          myStream.getTracks().forEach((track) => track.stop());
          setStream(null);
        }
        setIsCalling(false);
        setModalCallOpen(false);
        setOutcoming(false);
        setIncoming(false);
        setModalIncoming(false);
        setCaller();
        if (currentCall.current) {
          currentCall.current.close(); // Đóng cuộc gọi hiện tại
          currentCall.current = null;
        }
      }
    });
  }, []);

  //check verifycation

  useEffect(() => {
    dispatch(checkAccountVerification(myInfo.id));
  }, []);

  useEffect(() => {
    if (!verification) {
      navigate("/verify");
      dispatch(sendVerifyCode());
    }
  }, [verification]);

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

  //for Call

  const handleCallVideo = () => {
    setModalCallOpen(true);
    setOutcoming(true);
    setCaller({ from: { id: currentFriend._id, username: currentFriend.username, image: currentFriend.image } });
    socket.current.emit("hey", { to: currentFriend._id, from: { id: myInfo.id, username: myInfo.username, image: myInfo.image } });
    // Thêm logic xử lý khi ấn nút call video ở đây
  };

  const incomingCall = (data) => {
    setModalIncoming(true);
    setIncoming(true);
    setCaller(data);
  };

  useEffect(() => {
    const newPeer = new Peer({
      host: "13.212.127.23",
      port: 9000,
      path: "/myapp",
      config: {
        iceServers: [
          { urls: ["stun:hk-turn1.xirsys.com"] },
          {
            username: "Jr-m_oZKLNSN116yrUctmvT8fImWG20taUhcYm6p9w4CCyz-RHHBmrwxOmtrw91qAAAAAGZS7cd0aGFuaHNhbmdnbHAwNg==",
            credential: "02f62eea-1b37-11ef-b303-0242ac120004",
            urls: [
              "turn:hk-turn1.xirsys.com:80?transport=udp",
              "turn:hk-turn1.xirsys.com:3478?transport=udp",
              "turn:hk-turn1.xirsys.com:80?transport=tcp",
              "turn:hk-turn1.xirsys.com:3478?transport=tcp",
              "turns:hk-turn1.xirsys.com:443?transport=tcp",
              "turns:hk-turn1.xirsys.com:5349?transport=tcp",
            ],
          },
        ],
      },
    });
    peer.current = newPeer;

    newPeer.on("open", (id) => {
      setPeerId(id); // Set the peer ID
    });

    // Handle incoming calls
    newPeer.on("call", (call) => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        setStream(stream);
        myVideo.current.srcObject = stream;
        call.answer(stream); // Answer the call with local stream
        currentCall.current = call;
        call.on("stream", (remoteStream) => {
          if (userVideo.current) {
            userVideo.current.srcObject = remoteStream; // Show remote stream
          }
        });

        call.on("close", () => {
          if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
          }

          if (myVideo.current) {
            myVideo.current.srcObject = null;
          }

          if (userVideo.current) {
            userVideo.current.srcObject = null;
          }

          if (currentCall.current) {
            currentCall.current.close(); // Đóng cuộc gọi hiện tại
            currentCall.current = null;
          }
        });
      });
    });

    // Cleanup function
    return () => {
      if (myStream) {
        myStream.getTracks().forEach((track) => track.stop());
      }
      if (peer.current) {
        peer.current.destroy();
      }
    };
  }, []);

  const acceptCall = () => {
    callVideo();
    socket.current.emit("acceptCall", { to: caller.from.id, from: { id: myInfo.id, username: myInfo.username, image: myInfo.image }, friendPeerId: peerId });
  };

  const callVideo = () => {
    setIsCalling(true);
    setModalIncoming(false);
    setModalCallOpen(false);
  };

  const handleRejectCall = () => {
    setIsCalling(false);
    setModalCallOpen(false);
    setOutcoming(false);
    setIncoming(false);
    setModalIncoming(false);
    socket.current.emit("rejectCall", { to: caller.from.id, from: { id: myInfo.id, username: myInfo.username, image: myInfo.image } });
    setCaller();
    if (currentCall.current) {
      currentCall.current.close(); // Đóng cuộc gọi hiện tại
      currentCall.current = null;
    }
  };

  const handleCloseModal = () => {
    setModalGroupOpen(false);
    setModalCallOpen(false);
    setIsCalling(false);
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
            setCalling={setIsCalling}
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
      <Call
        isOpen={calling}
        onClose={handleRejectCall}
        myStream={myStream}
        setStream={setStream}
        myVideo={myVideo}
        userVideo={userVideo}
        remoteStream={remoteStream}
        setRemoteStream={setRemoteStream}
        peer={peer}
        peerId={peerId}
        setPeerId={setPeerId}
        friendPeerId={friendPeerId}
        currentCall={currentCall}
        outcoming={outcoming}
      ></Call>
      <OutcomingCall isOpen={isModalCallOpen} callerName={currentFriend.username} callerAvatar={currentFriend.image} onReject={handleRejectCall}></OutcomingCall>
      <IncomingCall isOpen={modalIncoming} callerName={caller?.from?.username} callerAvatar={caller?.from?.image} onReject={handleRejectCall} onAccept={acceptCall}></IncomingCall>
      <ProfileInfo isOpen={profileOpen} onClose={handleCloseProfileInfo} myInfo={myInfo}></ProfileInfo>
      <GroupChatModal isOpen={isModalGroupOpen} onClose={handleCloseModal} socket={socket}></GroupChatModal>
      {/* <ReiceiverCall isOpen={isReceivingCall} onClose={handleCloseReiceiverCallModal} answerCall={answerCall} myVideo={myVideo} setStream={setStream}></ReiceiverCall> */}
    </div>
  );
};

export default Messenger;
