import React, { useState } from "react";
import { FaSistrix } from "react-icons/fa";
import { IoIosRadioButtonOff, IoIosRadioButtonOn } from "react-icons/io";
import { CiCircleRemove } from "react-icons/ci";
import { useAlert } from "react-alert";
import { useDispatch } from "react-redux";
import { createNewGroup } from "../store/actions/messengerAction";
import axios from "axios";

const GroupChatModal = ({ isOpen, onClose }) => {
  const alert = useAlert();
  const dispatch = useDispatch();
  const [loadImage, setLoadImage] = useState("");
  const [image, setImage] = useState("");
  const [groupName, setGroupName] = useState("");
  const [selectedUser, setSelectedUser] = useState([]);
  const [searchResult, setSearchResult] = useState("");

  const handleSearchUser = async (e) => {
    if (e.target.value !== "") {
      const response = await axios.get(`/api/search?q=${e.target.value}`);
      setSearchResult(response.data.users);
      console.log(response.data.users);
    } else {
      setSearchResult([]);
    }
  };
  const createGroup = () => {
    if (selectedUser.length < 2) {
      alert.error("Phải có ít nhất 3 thành viên để tạo nhóm!");
      return;
    }
    if (!groupName) {
      alert.error("Vui lòng đặt tên cho nhóm chat!");
      return;
    }
    const formData = new FormData();
    const members = selectedUser.map((u) => ({
      userId: u._id.toString(),
      role: "member",
    }));

    formData.append("name", groupName);
    formData.append("image", image);
    formData.append("members", JSON.stringify(members));
    dispatch(createNewGroup(formData));
    setSelectedUser([]);
    setImage("");
    setLoadImage("");
    setGroupName("");
    onClose();
  };

  const toggleSelectUser = (userToAdd) => {
    if (selectedUser.map((u) => u._id).includes(userToAdd._id)) {
      setSelectedUser(selectedUser.filter((u) => u._id !== userToAdd._id));
      return;
    }
    setSelectedUser([...selectedUser, userToAdd]);
  };

  const fileHandle = (e) => {
    if (e.target.files.length !== 0) {
      setImage(e.target.files[0]);
    }

    const fileReader = new FileReader();
    fileReader.onload = () => {
      setLoadImage(fileReader.result);
    };

    fileReader.readAsDataURL(e.target.files[0]);
  };
  return (
    <div className={`modal ${isOpen ? "open" : ""}`}>
      <div className="modal-content-group">
        <div className="modal-header">
          <span className="close" onClick={onClose}>
            &times;
          </span>
          <h2>Tạo nhóm chat</h2>
        </div>
        <div className="modal-body">
          <div className="info-group">
            <input type="file" name="image" id="actual-btn" accept="image/*" onChange={fileHandle} hidden />
            <label htmlFor="actual-btn">{loadImage ? <img src={loadImage} className="avatar-group" /> : <img src="/image/cameraa.png" className="avatar-group" />}</label>
            <input type="text" onChange={(e) => setGroupName(e.target.value)} value={groupName} placeholder="Nhập tên nhóm" className="form-control" />
          </div>
          <div className="search">
            <button>
              <FaSistrix />
            </button>
            <input onChange={handleSearchUser} type="text" placeholder="Search" className="form-control" />
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
                <span className="name">{u.username}</span>
              </div>
            ))}
          </div>

          {searchResult && searchResult.length > 0 ? (
            <div className="search_results">
              {searchResult.map((u) => (
                <div key={u._id} className="user" onClick={() => toggleSelectUser(u)}>
                  <div className="user-info">
                    <div className="image">
                      <img src={`https://iuh-cnm-chatapp.s3.ap-southeast-1.amazonaws.com/${u.image}`} alt="img" />
                    </div>
                    <div className="name">
                      <h3>{u.username}</h3>
                    </div>
                  </div>
                  <div className="select-icon">{selectedUser.map((u) => u._id).includes(u._id) ? <IoIosRadioButtonOn /> : <IoIosRadioButtonOff />}</div>
                </div>
              ))}
            </div>
          ) : (
            ""
          )}
        </div>
        <div className="modal-footer">
          <div className="form-group">
            <input type="submit" onClick={createGroup} value="Tạo nhóm" className="btn" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupChatModal;
