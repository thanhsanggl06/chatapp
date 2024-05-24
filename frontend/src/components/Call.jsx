import React, { useEffect } from "react";
import { FaMicrophone } from "react-icons/fa6";
import { FcEndCall } from "react-icons/fc";

const Call = ({ isOpen, onClose, myStream, setStream, myVideo, userVideo, peer, friendPeerId, currentCall }) => {
  useEffect(() => {
    if (isOpen) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          setStream(stream);
          if (myVideo.current) {
            myVideo.current.srcObject = stream;
          }
          const call = peer.current.call(friendPeerId, stream);
          currentCall.current = call;
          call.on("stream", (remoteStream) => {
            if (userVideo.current) {
              userVideo.current.srcObject = remoteStream;
            }
          });

          call.on("close", () => {
            endCall();
          });
        })
        .catch((error) => {
          console.error("Failed to get local stream", error);
        });
    } else {
      endCall();
    }
  }, [isOpen]);

  const endCall = () => {
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
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
  };

  return (
    <div className={`modal ${isOpen ? "open" : ""}`}>
      <div className="modal-content">
        <div className="modal-header">
          <span className="close" onClick={onClose}>
            &times;
          </span>
          <h2>Video Call Modal</h2>
        </div>
        <div className="modal-body">
          <div className="video-container">
            <div className="friend-video">
              <video ref={userVideo} playsInline autoPlay />
              <div className="my-video">
                <video ref={myVideo} muted playsInline autoPlay />
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <div className="call-action">
            <div className="icon">
              <FaMicrophone />
            </div>
            <div className="icon" onClick={onClose}>
              <FcEndCall />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Call;
