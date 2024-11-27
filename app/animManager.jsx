"use client"
import { createContext, useContext, useEffect, useReducer } from 'react';
// let currAnim be anim name only
export const initialState = {
  playIndivAnim: [],
  currAnim: null,
  action: null,
  fade:false
};

export function reducer(state, action) {
  switch (action.type) {
    case "playIndivAnim":
      return { ...state, playIndivAnim: action.payload };
    case "playIndivAnimFin":
      return { ...state, playIndivAnim: [] };
    case "fadeAnim":
          return { ...state, fade: true}
    case "fadeAnimFin":
      return { ...state, fade: false,currAnim:null }
    case "setCurrAnim":
      return {...state,currAnim:action.payload}
    default:
      throw new Error("Unknown action type");
  }
}


const AnimManagerContext = createContext();
export function useAnimManagerContext() {
  const context = useContext(AnimManagerContext);
  if (context === undefined)
    throw new Error("CitiesContext was used outside the CitiesProvider");
  return context;
}
// export const useAnimManagerContext = () => useContext(AnimManagerContext);

export const AnimManagerProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const playIndivAnim = (animation) => {
    dispatch({ type: "playIndivAnim", payload: animation });
  };
  
  const playIndivAnimFin = () => {
    dispatch({ type: "playIndivAnimFin" });
  };
  const fadeAnim = () => {
    console.log("fading animations")
      dispatch({type:'fadeAnim'})
    }
    const fadeAnimFin = () => {
      dispatch({type:'fadeAnimFin'})
  }
    const setCurrAnim = (animation) => {
      dispatch({type:'setCurrAnim',payload:animation})
  }
  
  return (
    <AnimManagerContext.Provider value={{ 
        state,
        dispatch,
        playIndivAnim,
          playIndivAnimFin,
      fadeAnim,
      setCurrAnim,
      fadeAnimFin
        }}>
      {children}
    </AnimManagerContext.Provider>
  );
};
