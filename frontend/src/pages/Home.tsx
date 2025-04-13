import { useEffect, useState } from "react";
import ShowCard from "../components/ShowCard";
import BASE_URL from "../config";

const Home = () => {
  const [shows, setShows] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${BASE_URL}/shows`)
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
    <div className="relative min-h-screen bg-[#121212] text-white overflow-hidden">
      <div className="relative z-10 p-8">
        <h3 className="animate-tubeFlicker font-retro text-4xl md:text-5xl font-semibold text-[#BBBBBB] tracking-widest text-center mb-6">
          TV Reference Explorer
        </h3>

        <p className="text-lg text-center text-[#888] mb-10 max-w-2xl mx-auto">
          Explore the cinematic universe of your favorite shows.
        </p>

        <h4 className="text-xl font-semibold mb-4 text-[#AAAAAA] border-b border-[#333] w-fit mx-auto pb-1">
          Browse Shows
        </h4>

        <div className="flex overflow-x-auto gap-4 px-2 py-4 scrollbar-hide">
          {shows.map((show) => (
            <div key={show} className="flex-shrink-0 w-[180px]">
              <ShowCard name={show} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
