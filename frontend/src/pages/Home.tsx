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
      <div className="relative z-10 p-6 sm:p-8">
      <h3 className="animate-tubeFlicker font-retro text-4xl md:text-5xl font-semibold text-[#BBBBBB] tracking-widest text-center mb-6">
  TV Reference Explorer
</h3>


{/* ✨ Funny Quote */}
<blockquote className="italic text-center text-[#999] mb-8">
  "I'm the king of the world!" –{" "}
  <span className="text-[#ccc] italic">Titanic</span>
  <br />
  <span className="text-sm not-italic text-[#aaa]">
    (Referenced in <span className="italic">Family Guy</span>, Season 10 Episode 11 – "The Blind Side")
  </span>
  <br />
  <span className="not-italic text-[#aaa]">
    Wanna explore more pop-culture/meta moments in TV shows, movies? You're in the right place.
  </span>
</blockquote>

{/* New: What is this */}
<div className="text-center text-[#aaa] mb-8 max-w-3xl mx-auto">
  <h4 className="text-lg font-semibold text-[#BBBBBB] mb-2">What is this?</h4>
  <p className="text-sm">
    TV Reference Explorer analyzes shows like <em>Friends</em>, <em>The Office</em>, and more to detect when they
    mention, quote, or reference other media/TV shows/Movies. It uses a mix of NLP, semantic similarity, and a curated knowledge base to build a
    visual graph of how shows and movies connect. There can  be some false positives :)
  </p>
  <p className="text-sm mt-2">
    Click on a show below to explore its reference map and see what it’s paying homage to.
  </p>
</div>


        {/* ✅ Compact Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 px-1 py-3 max-h-[60vh] overflow-y-auto">
          {shows.map((show) => (
            <div key={show}>
              <ShowCard name={show} />
            </div>
          ))}
        </div>

        {/* 🔜 More coming */}
        <p className="text-center text-sm text-[#777] mt-6 italic">
          More shows coming soon... - Currently in Beta
        </p>
        <div className="mt-8 text-center text-[#888] text-sm">
  <p className="mb-2 italic">
    Made with obsessive love for shows and an unhealthy amount of quoting them 🎬💭
  </p>
  <div className="flex justify-center gap-4 text-[#aaa]">
    <a
      href="https://github.com/kvshravan"
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-white transition"
    >
      GitHub
    </a>
    <a
      href="https://in.linkedin.com/in/kandadishravan"
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-white transition"
    >
      LinkedIn
    </a>
    <a
      href="https://x.com/shravuuuuuuu"
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-white transition"
    >
      Twitter
    </a>
  </div>
</div>

        
      </div>
    </div>
  );
};

export default Home;
