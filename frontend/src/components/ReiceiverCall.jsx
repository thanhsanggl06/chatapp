import React, { useEffect } from "react";

const ReiceiverCall = ({ isOpen, onClose, answerCall, myVideo, setStream }) => {
  useEffect(() => {
    // navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
    //   setStream(stream);
    //   if (myVideo.current) {
    //     myVideo.current.srcObject = stream;
    //   }
    // });
  }, []);
  return (
    <div className={`modal ${isOpen ? "open" : ""}`}>
      <div className="modal-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <h2>Video Call Modal</h2>
        <h5>Có cuộc gọi đến</h5>
        <button onClick={answerCall}>Nghe máy</button>
      </div>
    </div>
  );
};

export default ReiceiverCall;
