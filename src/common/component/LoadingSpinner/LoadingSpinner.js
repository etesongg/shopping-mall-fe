import React from "react";
import { BeatLoader } from "react-spinners";
import "./LoadingSpinner.style.css";

const LoadingSpinner = () => {
  return (
    <div className="spinner-wrapper">
      <BeatLoader color="#E50915" size={15} />
    </div>
  );
};

export default LoadingSpinner;
