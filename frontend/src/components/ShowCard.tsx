import { useNavigate } from "react-router-dom";

function ShowCard({ name }: { name: string }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/graph/${name}`)}
      className="bg-gradient-to-br from-[#2b2b2b]/60 to-[#1a1a1a]/60 
                 border border-white/14 backdrop-blur-md 
                 rounded-2xl p-3 flex items-center justify-center 
                 h-28 w-36 cursor-pointer shadow-sm 
                 transition-all duration-300 ease-in-out transform 
                 hover:scale-105 hover:border-cyan-500"
    >
      <h2 className="text-sm font-semibold text-[#e5e5e5] text-center capitalize tracking-wide 
                    transition-colors duration-300 ease-in-out hover:text-cyan-400 break-words">
        {name}
      </h2>
    </div>
  );
}

export default ShowCard;
