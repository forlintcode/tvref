import { useNavigate } from "react-router-dom";

function ShowCard({ name }: { name: string }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/graph/${name}`)}
      className="bg-gradient-to-br from-[#1e1e1e] to-[#2b2b2b] rounded-2xl border border-gray-700 
                 shadow-md hover:shadow-[0_0_30px_#00ffff55] hover:border-cyan-400
                 hover:scale-[1.03] transition-all duration-300 ease-in-out 
                 cursor-pointer flex items-center justify-center h-40 p-4"
    >
      <h2 className="text-xl font-bold text-cyan-200 capitalize tracking-wide">
        {name}
      </h2>
    </div>
  );
}

export default ShowCard;
