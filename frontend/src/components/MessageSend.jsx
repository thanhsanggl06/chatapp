import React from "react";
import { FaPlusCircle, FaFileImage, FaGift, FaPaperPlane } from "react-icons/fa";

const MessageSend = ({ inputHandle, newMessage, sendMessage, emojiSend, imageSend }) => {
  const emojis = ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "😝", "😜", "🧐", "🤓", "😎", "😕", "🤑", "🥴", "😱"];

  return (
    <div className="message-send-section">
      <input type="checkbox" id="emoji" />
      <div className="file hover-attachment">
        <div className="add-attachment">Add Attachment</div>
        <FaPlusCircle />
      </div>

      <div className="file hover-image">
        <div className="add-image">Add Image</div>
        <input
          onChange={imageSend}
          type="file"
          id="pic"
          className="form-control"
          accept="image/jpeg, image/png, image/gif, application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, video/mp4, video/webm, video/ogg, video/avi, video/mkv, video/mov, video/wmv, video/flv, video/avchd, video/mpeg, video/3gp, video/rm, video/swf, video/vob"
        />
        <label htmlFor="pic">
          {" "}
          <FaFileImage />{" "}
        </label>
      </div>

      <div className="file hover-gift">
        <div className="add-gift">Add gift</div>
        <FaGift />
      </div>

      <div className="message-type">
        <input type="text" name="message" onChange={inputHandle} id="message" placeholder="Aa" className="form-control" value={newMessage} />

        <div className="file hover-gift">
          <label htmlFor="emoji"> ☺️</label>
        </div>
      </div>

      <div onClick={sendMessage} className="file">
        {newMessage ? <FaPaperPlane /> : "❤"}
      </div>

      <div className="emoji-section">
        <div className="emoji">
          {emojis.map((e, i) => (
            <span key={i} onClick={() => emojiSend(e)}>
              {e}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MessageSend;
