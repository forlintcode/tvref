import { useNavigate } from "react-router-dom";

function ShowCard({ name }: { name: string }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/graph/${name}`)}
      className="bg-[#121212]/80 border border-cyan-400/40 rounded-2xl 
                 shadow-neon animate-neonPulse hover:animate-glitchFlicker
                 hover:shadow-[0_0_30px_#00ffffaa] hover:border-cyan-300
                 hover:animate-staticFlash transition-all duration-300 ease-in-out
                 transform hover:scale-105 cursor-pointer flex items-center justify-center h-48 p-4"
    >
      <h2 className="text-2xl font-retro font-bold text-cyan-100 tracking-wide text-center capitalize">
        {name}
      </h2>
    </div>
  );
}

export default ShowCard;
