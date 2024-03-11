import React, { useEffect } from "react";

const Call = ({ isOpen, onClose }) => {
  return (
    <div className={`modal ${isOpen ? "open" : ""}`}>
      <div className="modal-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <h2>Video Call Modal</h2>
      </div>
    </div>
  );
};

export default Call;
