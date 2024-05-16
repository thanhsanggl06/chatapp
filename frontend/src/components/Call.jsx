import React, { useEffect } from "react";
import { FaMicrophone } from "react-icons/fa6";
import { FcEndCall } from "react-icons/fc";

const Call = ({ isOpen, onClose, isCalling, stream, setStream, myVideo, userVideo }) => {
  useEffect(() => {
    if (isCalling) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        setStream(stream);
        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }
      });
    } else {
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
        setStream(null);
      }

      if (myVideo.current) {
        myVideo.current.srcObject = null;
      }
    }
  }, [isCalling]);

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
              <video ref={userVideo} muted playsInline autoPlay />
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
            <div className="icon">
              <FcEndCall />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Call;
