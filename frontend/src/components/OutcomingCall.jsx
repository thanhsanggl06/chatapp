import React from "react";

const OutcomingCall = ({ isOpen, callerName, callerAvatar, onReject }) => {
  return (
    <div className={`modal ${isOpen ? "open" : ""}`}>
      <div className="incoming-call-background">
        <div className="incoming-call">
          <div className="caller-info">
            <img src={`https://iuh-cnm-chatapp.s3.ap-southeast-1.amazonaws.com/${callerAvatar}`} alt={callerName} className="caller-avatar" />
            <p className="caller-name">{callerName}</p>
          </div>
          <div className="call-actions">
            <button className="reject-call-btn" onClick={onReject}>
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutcomingCall;
