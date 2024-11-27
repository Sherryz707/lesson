import React, { useState } from "react";
import { useAppContext } from "../store";
import { useAnimManagerContext } from "../animManager";
const correctSound = "/sounds/correct.mp3"; // Path to correct sound
const wrongSound = "/sounds/wrong.mp3"; // Path to wrong sound

const Modal = () => {
  const { state, submitAnswer } = useAppContext();
  const {
    state: animState,
    playIndivAnim,
    playIndivAnimFin,
    fadeAnim,
    setCurrAnim,
  } = useAnimManagerContext();
  const { answer, modalVisible, animToFade } = state;
  const [answerStatus, setAnswerStatus] = useState(null); // null, 'correct', 'wrong'
  const [allowSound, setAllowSound] = useState(true); // Control whether sound can be played
  const [isButtonDisabled, setIsButtonDisabled] = useState(false); // Control button state

  if (!modalVisible) return null;
  const playSound = (sound) => {
    if (!allowSound) return;
    const audio = new Audio(sound);
    audio.play();
  };
  const handleAnswerCheck = (MyAns) => {
    console.log("=====inside handle answer check IN MODAL ==========");
    // if (isButtonDisabled) return;
    fadeAnim(); // Prevent further clicks
    setIsButtonDisabled(true); // Disable button
    const randomOutcome = Math.random(); // Generate a random number between 0 and 1

    let isCorrect = false;

    if (randomOutcome < 0.5) {
      MyAns = answer;
    } else {
      MyAns = "Z";
    }

    if (answer === MyAns) {
      playSound(correctSound);
      setAnswerStatus("correct");

      playIndivAnim([
        {
          animation: "Clapping",
          facialExpression: "smile",
          audio: "C-C.mp3",
        },
      ]);
    } else {
      playSound(wrongSound);
      setAnswerStatus("wrong");
      playIndivAnim([
        {
          animation: "Sad",
          facialExpression: "sad",
          audio: "welcome.mp3",
        },
      ]);
    }

    setTimeout(() => {
      // playIndivAnimFin();
      // Re-enable button after feedback
      // Submit answer after a total of 5 seconds
      answerStatus === "wrong" ? setCurrAnim("Sad") : setCurrAnim("Clapping");
      setAnswerStatus(null);
      setIsButtonDisabled(false);
      console.log("SUBMITTING ANSWER");
      submitAnswer(MyAns);
    }, 12000); // Reset status after 2 seconds
  };
  return (
    <div
      className={` z-10 fixed top-1/2 right-[62px] transform translate-y-[-50%] bg-gray-800 rounded-lg shadow-2xl transition-all duration-300 h-[60%] w-[40%] ${
        answerStatus === "wrong" ? "border-4 border-red-500" : ""
      } ${answerStatus === "correct" ? "border-4 border-green-500" : ""}`}
    >
      <div className={`flex flex-col items-center justify-center h-full`}>
        {/* Webcam Placeholder */}
        <div className="relative w-full h-full bg-gray-900 rounded-lg flex items-center justify-center">
          {answerStatus && (
            <div
              className={`absolute inset-0 ${
                answerStatus === "correct" ? "bg-green-400" : "bg-red-500"
              } bg-opacity-50 flex items-center justify-center text-3xl font-bold text-white`}
            >
              {answerStatus === "correct" ? "Correct!" : "Wrong!"}
            </div>
          )}
          <p className="text-gray-400">[ Webcam Screen Placeholder ]</p>
        </div>

        {/* Answer Button for Checking */}
        <button
          className={`mt-4 px-4 py-2 text-white font-semibold bg-blue-500 rounded-lg hover:bg-blue-600 ${
            isButtonDisabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={() => handleAnswerCheck("A")} // Simulating correct/wrong answer
          disabled={isButtonDisabled} // Disable button
        >
          Check Answer
        </button>
      </div>
    </div>
  );
};
export default Modal;
