"use client";
import { createContext, useContext, useEffect, useReducer } from "react";

export const initialState = {
  lessons: [],
  status: "loading", // 'loading', 'ready', 'active', 'finished',
  currentLessonIndex: 0,
  answer: null,
  points: 0,
  highscore: 0,
  modalVisible: false,
  playIndivAnim: [],
  animToFade: null,
  animFadeStatus: false,
};

export function reducer(state, action) {
  switch (action.type) {
    case "dataReceived":
      return { ...state, lessons: action.payload, status: "ready" };
    case "dataFailed":
      return { ...state, status: "error" };
    case "startLesson":
      return {
        ...state,
        status: "active",
        modalVisible: false,
        currentLessonIndex: 0,
      };
    case "AnimFinishShowModal":
      return { ...state, modalVisible: true };
    case "submitAnswer":
      const lesson = state.lessons[state.currentLessonIndex];
      const isCorrect = action.payload === lesson.modal.answer;
      return {
        ...state,
        answer: action.payload,
        points: isCorrect ? state.points + lesson.modal.points : state.points,
        modalVisible: false,
      };
    case "playIndivAnim":
      return { ...state, playIndivAnim: action.payload };
    case "playIndivAnimFin":
      return { ...state, playIndivAnim: [] };
    case "nextLesson":
      const nextLessonIndex = state.currentLessonIndex + 1;
      const hasMoreLessons = nextLessonIndex < state.lessons.length;
      return hasMoreLessons
        ? {
            ...state,
            currentLessonIndex: nextLessonIndex,
            answer: null,
            status: "active",
          }
        : {
            ...state,
            status: "finished",
            highscore: Math.max(state.points, state.highscore),
          };
    case "SetAnimFade":
      return { ...state, animToFade: action.payload };
    case "FadeOutAnim":
      return { ...state, animFadeStatus: true };
    case "EmptyAnimToFade":
      return { ...state, animToFade: null, animFadeStatus: false };
    case "restart":
      return { ...initialState, lessons: state.lessons, status: "ready" };
    default:
      throw new Error("Unknown action type");
  }
}

const AppContext = createContext();
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined)
    throw new Error("CitiesContext was used outside the CitiesProvider");
  return context;
}
// export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    console.log("Fetching data from /data.json...");
    const timer = setTimeout(() => {
      // Simple fetch with .then() instead of async/await
      fetch("/data.json")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch data");
          }
          return response.json(); // Convert response to JSON
        })
        .then((lessons) => {
          console.log("Dispatching lessons:", lessons);
          dispatch({ type: "dataReceived", payload: lessons });
        })
        .catch((error) => {
          console.error("Error fetching lessons:", error);
          dispatch({ type: "dataFailed" });
        });
    }, 500); // Simulate a delay for fetching data

    return () => clearTimeout(timer);
  }, []);

  const dataReceived = (payload) => {
    dispatch({ type: "dataReceived", payload });
  };
  const EmptyFadeAnim = () => {
    dispatch({ type: "EmptyAnimToFade" });
  };
  const SetAnimToFade = (payload) => {
    dispatch({ type: "SetAnimFade", payload });
  };
  const dataFailed = () => {
    dispatch({ type: "dataFailed" });
  };

  const startLesson = () => {
    dispatch({ type: "startLesson" });
  };

  const animFinishShowModal = () => {
    dispatch({ type: "AnimFinishShowModal" });
  };

  const submitAnswer = (answer) => {
    dispatch({ type: "submitAnswer", payload: answer });
    dispatch({ type: "nextLesson" });
  };

  const playIndivAnim = (animation) => {
    dispatch({ type: "playIndivAnim", payload: animation });
  };

  const playIndivAnimFin = () => {
    dispatch({ type: "playIndivAnimFin" });
  };

  const nextLesson = () => {
    dispatch({ type: "nextLesson" });
  };

  const restart = () => {
    console.log("RESTARTING THIS SHIT MAN IN STORE");
    dispatch({ type: "restart" });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        dataReceived,
        dataFailed,
        startLesson,
        animFinishShowModal,
        submitAnswer,
        playIndivAnim,
        playIndivAnimFin,
        EmptyFadeAnim,
        nextLesson,
        restart,
        SetAnimToFade,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
