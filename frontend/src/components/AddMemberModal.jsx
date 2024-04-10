import React, { useState } from "react";
import { FaSistrix } from "react-icons/fa";
import { IoIosRadioButtonOff, IoIosRadioButtonOn } from "react-icons/io";
import { CiCircleRemove } from "react-icons/ci";
import { useAlert } from "react-alert";
import { useDispatch } from "react-redux";
import axios from "axios";
import { addMembersToGroup } from "../store/actions/messengerAction";

const AddMemberModal = ({ isOpen, onClose, members, currentFriend, socket, myInfo }) => {
  const alert = useAlert();
  const dispatch = useDispatch();
  const [selectedUser, setSelectedUser] = useState([]);
  const [searchResult, setSearchResult] = useState("");
  const [search, setSearch] = useState("");

  const membersId = members.map((m) => m.userId._id);

  const handleSearchUser = async (e) => {
    setSearch(e.target.value);
    if (e.target.value !== "") {
      const response = await axios.get(`/api/search?q=${e.target.value}`);
      setSearchResult(response.data.users);
      console.log(response.data.users);
    } else {
      setSearchResult([]);
    }
  };

  const handleAddMember = async () => {
    if (window.confirm("Bạn có chắc chắn muốn thêm những thành viên này vào nhóm?")) {
      const newMembers = selectedUser.map((u) => ({
        userId: u._id.toString(),
        role: "member",
      }));
      const rs = await dispatch(addMembersToGroup(currentFriend._id, newMembers));
      setSelectedUser([]);
      setSearchResult([]);
      setSearch("");
      onClose();
      if (rs) {
        const otherMembersId = membersId.filter((id) => id !== myInfo.id);
        socket.current.emit("memberChange", { groupId: currentFriend?._id, membersId: otherMembersId });
        socket.current.emit("groupEvent", { removeMember: false, newMembers });
        alert.success("Thêm thành viên mới thành công");
      }
    }
  };

  const toggleSelectUser = (userToAdd) => {
    if (selectedUser.map((u) => u._id).includes(userToAdd._id)) {
      setSelectedUser(selectedUser.filter((u) => u._id !== userToAdd._id));
      return;
    }
    setSelectedUser([...selectedUser, userToAdd]);
  };

  return (
    <div className={`modal ${isOpen ? "open" : ""}`}>
      <div className="modal-content-group">
        <div className="modal-header">
          <span className="close" onClick={onClose}>
            &times;
          </span>
          <h2>Thêm thành viên</h2>
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
                <span className="name">{u.username}</span>
              </div>
            ))}
          </div>

          {searchResult && searchResult.length > 0 ? (
            <div className="search_results">
              {searchResult.map((u) =>
                !membersId.includes(u._id) ? (
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
                ) : (
                  <div key={u._id} className="user is_member">
                    <div className="user-info">
                      <div className="image">
                        <img src={`https://iuh-cnm-chatapp.s3.ap-southeast-1.amazonaws.com/${u.image}`} alt="img" />
                      </div>
                      <div className="name">
                        <h3>{u.username}</h3>
                      </div>
                    </div>
                    <div className="select-icon">
                      <IoIosRadioButtonOn />
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            ""
          )}
        </div>
        <div className="modal-footer">
          <div className="form-group">
            <input type="submit" onClick={handleAddMember} value="Xác nhận" className="btn" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;
