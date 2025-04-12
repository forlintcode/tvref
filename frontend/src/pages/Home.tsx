import { useEffect, useState } from "react";
import ShowCard from "../components/ShowCard";

const Home = () => {
  const [shows, setShows] = useState<string[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/shows")
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
      <h1 className="text-4xl font-extrabold mb-8">📺 TV Reference Explorer</h1>

      {/* Section Title */}
      <h2 className="text-2xl font-semibold mb-3">All Shows</h2>

      {/* Horizontal Scroll Row */}
      <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
        {shows.map((show) => (
          <div key={show} className="flex-shrink-0 w-[180px]">
            <ShowCard name={show} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
