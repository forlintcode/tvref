import { useEffect, useState } from "react";
import ShowCard from "../components/ShowCard";

const Home = () => {
  const [shows, setShows] = useState<string[]>([]);

  useEffect(() => {
    fetch("https://tvref-backend.onrender.com/shows")
      .then((res) => res.json())
      .then((data) => {
        console.log("Shows fetched from backend:", data);
        setShows(data);
      })
      .catch((err) => {
        console.error("Failed to fetch shows:", err);
      });
  }, []);

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <h1 className="text-4xl font-extrabold mb-8 text-cyan-400 tracking-wide">
        🎬 TV Reference Explorer
      </h1>

      <h2 className="text-2xl font-semibold mb-3 text-white">All Shows</h2>

      <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide">
        {shows.map((show) => (
          <div key={show} className="flex-shrink-0 w-[200px]">
            <ShowCard name={show} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
