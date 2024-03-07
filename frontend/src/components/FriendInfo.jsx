import React from "react";
import { FaCaretSquareDown } from "react-icons/fa";

const FriendInfo = (props) => {
  const { currentFriend, activeFriends } = props;
  return (
    <div className="friend-info">
      <input type="checkbox" id="gallery" />
      <div className="image-name">
        <div className="image">
          <img src={`/image/${currentFriend.image}`} alt="" />
        </div>

        <div className="active-user">
          {activeFriends && activeFriends.length > 0 && activeFriends.some((af) => af.userId === currentFriend._id) ? "Online" : currentFriend.username ? "Offline" : ""}
        </div>

        <div className="name">
          <h4>{currentFriend.username ? currentFriend.username : currentFriend.name}</h4>
        </div>
      </div>

      <div className="others">
        <div className="custom-chat">
          <h3>Tùy chỉnh </h3>
          <FaCaretSquareDown />
        </div>

        <div className="privacy">
          <h3>Quyền riêng tư </h3>
          <FaCaretSquareDown />
        </div>
        {currentFriend.name ? <h3>Members</h3> : ""}

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
    </div>
  );
};

export default FriendInfo;
