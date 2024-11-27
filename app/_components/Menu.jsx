"use client"
import React from "react";
import { useAppContext } from "../store";
const Menu = () => {
  const { state, startLesson,restart } = useAppContext();

  if(state.status=="active"){
    return null
  }
  // Dynamic button text based on status
  const getStatusText = () => {
    switch (state.status) {
      case "loading":
        return "Loading...";
      case "ready":
        return "Press to start...";
      case "active":
        return "Start!";
      case "finished":
        return "Finished!";
      default:
        return `Unknown State: ${state.status}`;
    }
  };

  const handleButtonClick = () => {
    if (state.status === "ready") {
      startLesson();
    }
    if (state.status === "finished") {
      
    console.log("RESTARTING THIS SHIT MAN IN MENU")
      restart();
    }
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-b from-pink-200 to-pink-100 flex items-center justify-center backdrop-blur-sm">
      <button
        onClick={handleButtonClick}
        className={`px-6 py-3 text-white font-bold text-xl rounded-lg shadow-lg transition-all ${
          state.status === "active" || state.status === "finished"
            ? "bg-green-500 hover:bg-green-600"
            : state.status === "loading"
            ? "bg-yellow-500 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
        disabled={state.status === "loading"}
      >
        {getStatusText()}
      </button>
    </div>
  );
};

export default Menu;
