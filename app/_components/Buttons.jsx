import { useAnimManagerContext } from "../animManager";
import { useAppContext } from "../store";
export default function Buttons() {
  const { state} = useAppContext()
  const {state:animState,playIndivAnim,fadeAnim,setCurrAnim}=useAnimManagerContext()
    const { modalVisible,lessons, currentLessonIndex } = state
    if (!modalVisible) { return; }
    const handleClickR = () => {
      console.log("clicked!", lessons[currentLessonIndex].animations.slice(-1)[0].animation)
      fadeAnim()
      playIndivAnim(lessons[currentLessonIndex].animations.slice(-1))
      setCurrAnim(lessons[currentLessonIndex].animations.slice(-1)[0].animation)
  };

  const handleClickHalfX = () => {
    console.log("0.5x button clicked");
  };

  return (
    <div className="z-10 fixed top-1/2 left-[62px] flex flex-col items-center translate-y-[-50%] ">
      <button
        onClick={()=>handleClickR()}
        className="w-12 h-12 bg-pink-500 text-black text-lg rounded-full mb-2 cursor-pointer border-none"
      >
        R
      </button>
      <button
        onClick={handleClickHalfX}
        className="w-12 h-12 bg-pink-500 text-black text-lg rounded-full cursor-pointer border-none"
      >
        0.5x
      </button>
    </div>
  );
}
