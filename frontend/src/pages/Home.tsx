import { useEffect, useState } from "react";
import ShowCard from "../components/ShowCard";
import bgImg from "../assets/image.png"; // Ensure this is in your assets folder
import BASE_URL from "../config"; // 👈 import domain here

const Home = () => {
  const [shows, setShows] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${BASE_URL}/shows`) // 👈 use global domain
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
    <div
      className="relative min-h-screen bg-black text-white overflow-hidden"
      style={{ backgroundImage: `url(${bgImg})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-md"></div>

      <div className="relative z-10 p-8">
      <h1 className="animate-tubeFlicker font-retro text-5xl md:text-6xl font-bold text-cyan-300 tracking-widest text-center mb-6">
  🎬 TV Reference Explorer
</h1>


        <p className="text-lg text-center text-gray-300 mb-10 max-w-2xl mx-auto">
          Dive into the cinematic universe of your favorite shows. Explore how they reference each other and build your watchlist like a pro!
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-cyan-200 border-b border-cyan-400 w-fit mx-auto pb-1">
          Browse Shows
        </h2>

        <div className="flex overflow-x-auto gap-4 px-2 py-4 scrollbar-hide">
          {shows.map((show) => (
            <div key={show} className="flex-shrink-0 w-[200px]">
              <ShowCard name={show} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
