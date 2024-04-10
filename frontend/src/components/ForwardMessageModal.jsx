import React, { useState } from "react";
import { FaSistrix } from "react-icons/fa";
import { IoIosRadioButtonOff, IoIosRadioButtonOn } from "react-icons/io";
import { CiCircleRemove } from "react-icons/ci";
import { useAlert } from "react-alert";
import { useDispatch } from "react-redux";
import { FaFile } from "react-icons/fa";

const ForwardMessageModal = ({ isOpen, onClose, friends, messageForward, currentFriend, forwardMessage }) => {
  const alert = useAlert();
  const dispatch = useDispatch();
  const infoFriends = friends.map((f) => f.fndInfo).filter((f) => f._id !== currentFriend._id);
  const [selectedUser, setSelectedUser] = useState([]);
  const [searchResult, setSearchResult] = useState(infoFriends);
  const [search, setSearch] = useState("");

  const videoRegex = /\.(mp4|webm|ogg)$/;
  const imageRegex = /\.(jpg|jpeg|png|gif|bmp)$/;

  const handleSearchUser = async (e) => {
    setSearch(e.target.value);
    const lowercaseKeyword = search.toLowerCase();
    if (e.target.value !== "") {
      const rs = infoFriends.filter(
        (f) => f.username?.toLowerCase().includes(lowercaseKeyword) || f.email?.toLowerCase().includes(lowercaseKeyword) || f.name?.toLowerCase().includes(lowercaseKeyword)
      );
      setSearchResult(rs);
    } else {
      setSearchResult(infoFriends);
    }
  };

  const toggleSelectUser = (userToAdd) => {
    if (selectedUser.map((u) => u._id).includes(userToAdd._id)) {
      setSelectedUser(selectedUser.filter((u) => u._id !== userToAdd._id));
      return;
    }
    setSelectedUser([...selectedUser, userToAdd]);
  };

  const cancelFn = () => {
    setSearch("");
    setSelectedUser([]);
    setSearchResult([]);
    onClose();
  };

  return (
    <div className={`modal ${isOpen ? "open" : ""}`}>
      <div className="modal-content-group">
        <div className="modal-header">
          <span className="close" onClick={cancelFn}>
            &times;
          </span>
          <h2>Chuyển tiếp tin nhắn</h2>
        </div>
        <div className="modal-body">
          <div className="search">
            <button>
              <FaSistrix />
            </button>
            <input onChange={handleSearchUser} type="text" placeholder="Search" className="form-control" value={search} />
          </div>

          <div className="selected_users">
            {selectedUser.map((u) => (
              <div className="user">
                <CiCircleRemove
                  className="badge_remove"
                  onClick={() => {
                    toggleSelectUser(u);
                  }}
                />
                <div className="avatar">
                  <img src={`https://iuh-cnm-chatapp.s3.ap-southeast-1.amazonaws.com/${u.image}`} alt="" />
                </div>
                <span className="name">{u.username || u.name}</span>
              </div>
            ))}
          </div>
          <h4>Bạn bè & Nhóm</h4>
          {searchResult && searchResult.length > 0 ? (
            <div className="search_results">
              {searchResult.map((u) => (
                <div key={u._id} className="user" onClick={() => toggleSelectUser(u)}>
                  <div className="user-info">
                    <div className="image">
                      <img src={`https://iuh-cnm-chatapp.s3.ap-southeast-1.amazonaws.com/${u.image}`} alt="img" />
                    </div>
                    <div className="name">
                      <h3>{u.username || u.name}</h3>
                    </div>
                  </div>
                  <div className="select-icon">{selectedUser.map((u) => u._id).includes(u._id) ? <IoIosRadioButtonOn /> : <IoIosRadioButtonOff />}</div>
                </div>
              ))}
            </div>
          ) : (
            ""
          )}
          <div className="content-forward">
            <h4>Nội dung chia sẻ</h4>
            {messageForward.message?.text ? (
              <div className="content-text">
                <textarea value={messageForward.message?.text} cols="100" rows="5" disabled></textarea>
              </div>
            ) : videoRegex.test(messageForward.message?.image) ? (
              <div className="content-video">
                <video src={`https://iuh-cnm-chatapp.s3.ap-southeast-1.amazonaws.com/${messageForward.message?.image}`}></video>
                <span className="content-name">Video</span>
              </div>
            ) : imageRegex.test(messageForward.message?.image) ? (
              <div className="content-image">
                <img src={`https://iuh-cnm-chatapp.s3.ap-southeast-1.amazonaws.com/${messageForward.message?.image}`} alt="" />
                <span className="content-name">Hình ảnh</span>
              </div>
            ) : (
              <div className="file-download-link">
                <FaFile className="file-icon" />
                <span className="file-name">{messageForward.message?.image}</span>
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <div className="form-group">
            <input
              type="submit"
              onClick={() => {
                forwardMessage(selectedUser, messageForward);
                cancelFn();
              }}
              value="Chia sẻ"
              className="btn"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForwardMessageModal;
