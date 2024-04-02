import React from "react";
import { FaFile } from "react-icons/fa";

const Thumbnail = ({ url, myFile = false }) => {
  const videoRegex = /\.(mp4|webm|ogg)$/;
  return videoRegex.test(url) ? (
    <div>
      <video width={500} height={280} controls src={`https://iuh-cnm-chatapp.s3.ap-southeast-1.amazonaws.com/${url}`}></video>
    </div>
  ) : myFile ? (
    <a className="my-file-download-link" href={`https://iuh-cnm-chatapp.s3.ap-southeast-1.amazonaws.com/${url}`}>
      <span className="my-file-name">{url}</span>
      <FaFile className="my-file-icon" />
    </a>
  ) : (
    <a className="file-download-link" href={`https://iuh-cnm-chatapp.s3.ap-southeast-1.amazonaws.com/${url}`}>
      <FaFile className="file-icon" />
      <span className="file-name">{url}</span>
    </a>
  );
};

export default Thumbnail;
