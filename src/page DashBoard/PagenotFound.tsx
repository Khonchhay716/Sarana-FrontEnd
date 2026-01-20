import { Link } from "react-router-dom";
import { useGlobleContextDarklight } from "../AllContext/context";

export default function NotFound() {
  const { darkLight } = useGlobleContextDarklight();
  return (
    <div className={`flex flex-col items-center justify-center px-4 py-15 ${!darkLight ? " text-gray-100" : " text-pink-900"}`}>
      <h1 className="text-[120px] font-extrabold leading-none mb-2 drop-shadow-lg">😿</h1>
      <h2 className="text-6xl font-bold mb-4 drop-shadow-md">Page not Found! 404</h2>
      <p className="text-lg mb-6 text-center max-w-md">{!darkLight ? "It’s a little dark in here... Are you lost in the code jungle?" : "Aww no! The page you’re looking for ran away with the catnip. Let’s take you back to safety!"}</p>
      <Link to="/" className={`px-6 py-3 text-white text-lg rounded-full shadow-md hover:shadow-lg transition duration-300 font-semibold ${!darkLight ? "bg-blue-700 hover:bg-blue-800" : "bg-pink-600 hover:bg-pink-700"}`}>Take Me Home 🏡</Link>
    </div>
  );
}
