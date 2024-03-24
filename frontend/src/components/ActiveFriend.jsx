import React from "react";

const ActiveFriend = ({ activeFriends, setCurrentFriend }) => {
  return (
    <div className="active-friend">
      <div className="image-active-icon">
        {activeFriends && activeFriends.length > 0
          ? activeFriends.map((af) => (
              <div
                key={af.userInfo.id}
                className="image"
                onClick={() =>
                  setCurrentFriend({
                    _id: af.userInfo.id,
                    email: af.userInfo.email,
                    image: af.userInfo.image,
                    username: af.userInfo.username,
                  })
                }
              >
                <img src={`https://iuh-cnm-chatapp.s3.ap-southeast-1.amazonaws.com/${af.userInfo.image}`} alt="" />
                <div className="active-icon"></div>
              </div>
            ))
          : ""}
      </div>
    </div>
  );
};

export default ActiveFriend;
