import React, { useEffect, useState } from "react";
import { FaCaretSquareDown } from "react-icons/fa";
import { IoIosRemoveCircleOutline, IoMdPersonAdd } from "react-icons/io";
import { GrUserAdmin } from "react-icons/gr";
import { CiLogout, CiSquareRemove } from "react-icons/ci";
import { AiFillMessage } from "react-icons/ai";
import { useAlert } from "react-alert";
import { useDispatch } from "react-redux";
import { disbandTheGroup, leaveGroup, removeMember, promoteSubAdmin } from "../store/actions/messengerAction";
import AddMemberModal from "./AddMemberModal";

const FriendInfo = (props) => {
  const alert = useAlert();
  const dispatch = useDispatch();
  const [isModalAddMemberOpen, setModalAddMember] = useState(false);

  const handleCloseModal = () => {
    setModalAddMember(false);
  };

  const { currentFriend, activeFriends, members, myInfo, friends, setCurrentFriend, socket } = props;
  const admin = members.find((m) => m.role === "admin");
  const admins = members.filter((m) => m.role === "admin" || m.role === "subadmin").map((m) => m.userId._id);
  const friendIds = friends.map((f) => f.fndInfo._id);

  const deleteMember = async (userId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thành viên này?")) {
      try {
        const rs = await dispatch(removeMember(currentFriend._id, userId));
        if (rs) {
          const otherMembersId = members.map((m) => m.userId._id).filter((id) => id !== myInfo.id);
          alert.success("Xóa thành viên ra khỏi đoạn chat thành công!");
          socket.current.emit("memberChange", { groupId: currentFriend?._id, membersId: otherMembersId });
          socket.current.emit("groupEvent", { removeMember: true, newMembers: [{ userId: userId }], groupId: currentFriend._id });
        }
      } catch (error) {
        alert.error("Xóa thành viên không thành công!");
      }
    }
  };

  const handleLeaveGroup = async () => {
    if (window.confirm("Bạn có chắc chắn muốn rời khỏi nhóm?")) {
      try {
        const rs = await dispatch(leaveGroup(currentFriend._id));
        if (rs) {
          const otherMembersId = members.map((m) => m.userId._id).filter((id) => id !== myInfo.id);
          setCurrentFriend("");
          alert.success("Rời nhóm thành công!");
          socket.current.emit("memberChange", { groupId: currentFriend?._id, membersId: otherMembersId });
        }
      } catch (error) {
        alert.error("Xảy ra lỗi trong quá trình rời nhóm!");
      }
    }
  };

  const disbandGroup = async () => {
    if (window.confirm("Bạn có chắc chắn muốn giải tán nhóm?")) {
      try {
        const rs = await dispatch(disbandTheGroup(currentFriend._id));
        if (rs) {
          setCurrentFriend("");
          alert.success("Giải tán nhóm thành công!");
        } else {
          alert.error("Giải tán nhóm không thành công!");
        }
      } catch (error) {
        alert.error("Giải tán nhóm không thành công!");
      }
    }
  };

  const promoteMemberToSubAdmin = async (user) => {
    if (window.confirm(`Bạn có chắc chắn muốn cấp quyền phó nhóm cho ${user.username}?`)) {
      try {
        const rs = await dispatch(promoteSubAdmin(currentFriend._id, user._id));
        if (rs) {
          const otherMembersId = members.map((m) => m.userId._id).filter((id) => id !== myInfo.id);
          alert.success("Cấp quyền thành công");
          socket.current.emit("memberChange", { groupId: currentFriend?._id, membersId: otherMembersId });
        } else {
          alert.error("Cấp quyền không thành công!");
        }
      } catch (error) {
        alert.error("Giải tán nhóm không thành công!");
      }
    }
  };
  return (
    <div className="friend-info">
      <input type="checkbox" id="gallery" />
      <div className="image-name">
        <div className="image">
          <img src={`https://iuh-cnm-chatapp.s3.ap-southeast-1.amazonaws.com/${currentFriend.image}`} alt="" />
        </div>

        <div className="active-user">
          {activeFriends && activeFriends.length > 0 && activeFriends.some((af) => af.userId === currentFriend._id) ? "Online" : currentFriend.username ? "Offline" : ""}
        </div>

        <div className="name">
          <h4>{currentFriend.username ? currentFriend.username : currentFriend.name}</h4>
        </div>
      </div>

      <div className="others">
        {currentFriend.name && (
          <div className="group-action">
            <div className="icon-action" onClick={() => setModalAddMember(true)}>
              <IoMdPersonAdd className="icon" />
              <span className="icon-label">Thêm thành viên</span>
            </div>
            <div className="icon-action" onClick={handleLeaveGroup}>
              <CiLogout className="icon" />
              <span className="icon-label">Rời nhóm</span>
            </div>
            {myInfo.id === admin?.userId._id && (
              <div className="icon-action">
                <CiSquareRemove className="icon red" onClick={disbandGroup} />
                <span className="icon-label">Giải tán nhóm</span>
              </div>
            )}
          </div>
        )}

        <div className="custom-chat">
          <h3>Tùy chỉnh </h3>
          <FaCaretSquareDown />
        </div>

        <div className="privacy">
          <h3>Quyền riêng tư </h3>
          <FaCaretSquareDown />
        </div>
        <input type="checkbox" id="member-list" />

        {currentFriend.name ? (
          <div className="members">
            <h3>Danh sách thành viên </h3>
            <label htmlFor="member-list">
              <FaCaretSquareDown />
            </label>
          </div>
        ) : (
          ""
        )}
        {currentFriend.name && (
          <div className="member-list">
            {members.map((u) => (
              <div key={u._id} className="user">
                <div className="user-info">
                  <div className="image">
                    <img src={`https://iuh-cnm-chatapp.s3.ap-southeast-1.amazonaws.com/${u.userId.image}`} alt="img" />
                  </div>
                  <div className="name">
                    <h3>{u.userId.username}</h3>
                    {u.userId._id === admin.userId._id ? <h5> - Trưởng nhóm</h5> : admins.includes(u.userId._id) && <h5> - Phó nhóm</h5>}
                  </div>
                </div>
                <div className="action">
                  {myInfo.id === admin.userId._id && myInfo.id !== u.userId._id && !admins.includes(u.userId._id) ? (
                    <GrUserAdmin className="action-icon" onClick={() => promoteMemberToSubAdmin(u.userId)} />
                  ) : (
                    ""
                  )}
                  {myInfo.id !== u.userId._id && friendIds.includes(u.userId._id) ? <AiFillMessage className="action-icon" onClick={() => setCurrentFriend(u.userId)} /> : ""}
                  {admins.includes(myInfo.id) && myInfo.id !== u.userId._id && admin.userId._id !== u.userId._id ? (
                    <IoIosRemoveCircleOutline className="action-icon" onClick={() => deleteMember(u.userId._id)} />
                  ) : (
                    ""
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="media">
          <h3>File đã chia sẽ </h3>
          <label htmlFor="gallery">
            <FaCaretSquareDown />
          </label>
        </div>
      </div>

      <div className="gallery">
        <img src="/image/16964casio-mtp-m100l-7avdf-nam-thumb-600x600.jpg" alt="" />
        <img src="/image/16964casio-mtp-m100l-7avdf-nam-thumb-600x600.jpg" alt="" />
        <img src="/image/16964casio-mtp-m100l-7avdf-nam-thumb-600x600.jpg" alt="" />
        <img src="/image/16964casio-mtp-m100l-7avdf-nam-thumb-600x600.jpg" alt="" />
      </div>
      <AddMemberModal isOpen={isModalAddMemberOpen} onClose={handleCloseModal} members={members} currentFriend={currentFriend} socket={socket} myInfo={myInfo}></AddMemberModal>
    </div>
  );
};

export default FriendInfo;
