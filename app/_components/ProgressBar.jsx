import { useAppContext } from "../store";

const ProgressBar = () => {
  const { state } = useAppContext();
  const { lessons, currentLessonIndex,status,points } = state;
  if (status != "active") return;
  // Number of lessons
  const numLessons = lessons?.length || 0;

  // Maximum possible points
  const maxPossiblePoints =
    lessons?.reduce((accumulator, lesson) => accumulator + lesson.points, 0) || 0;

  // Calculate progress percentage
  const progressPercentage =
    numLessons > 0 ? (currentLessonIndex / numLessons) * 100:0

  return (
    <div className="z-10 fixed top-0 left-4 right-4 flex items-center justify-between bg-gray-100 p-1 rounded-md shadow-md h-8 mx-4 my-2">
      {/* Profile Picture */}
      <div className="w-6 h-6 rounded-full bg-gray-300 mr-2">
        <img
          src="/path/to/profile-pic.jpg"
          alt="Profile"
          className="w-full h-full rounded-full object-cover"
        />
      </div>

      {/* Progress Bar and Info */}
      <div className="flex-grow mx-4">
        <div className="relative w-full h-2 bg-gray-300 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
            style={{
              width: `${progressPercentage}%`,
            }}
          />
        </div>
        <div className="text-xs text-gray-600 mt-1">{progressPercentage.toFixed(2)}% Completed</div>
      </div>

      {/* Points and Close Button */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          Points: {points}/{maxPossiblePoints}
        </span>
        <button
          className="text-gray-500 hover:text-gray-700 focus:outline-none p-1"
          aria-label="Close"
        >
          &#10005;
        </button>
      </div>
    </div>
  );
};
export default ProgressBar