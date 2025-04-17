import { useNavigate } from "react-router-dom";

function ShowCard({ name }: { name: string }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/graph/${name}`)}
      className="bg-[#1f1f1f] border-2 border-[#333] rounded-xl p-3 
                 flex items-center justify-center h-28 w-36 cursor-pointer 
                 shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 
                 hover:border-cyan-500 hover:bg-[#2a2a2a]"
    >
      <h2 className="text-base font-semibold text-[#ddd] text-center capitalize tracking-wide 
                    transition-all duration-300 ease-in-out transform hover:text-cyan-400 break-words">
        {name}
      </h2>
    </div>
  );
}

export default ShowCard;