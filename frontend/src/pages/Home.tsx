import { useEffect, useState } from "react";
import ShowCard from "../components/ShowCard";

const Home = () => {
  const [shows, setShows] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/shows")
      .then((res) => res.json())
      .then((data) => {
        setShows(data);
      })
      .catch((err) => {
        console.error("Failed to fetch shows:", err);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background text-heading font-sans px-6 py-10">
      <h1 className="text-5xl font-bold mb-10 text-accent tracking-wide">
        🎬 Explore the TV Multiverse
      </h1>

      <h2 className="text-2xl font-semibold mb-4 text-primary">All Shows</h2>

      <div className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide">
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
