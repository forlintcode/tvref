import { useNavigate } from "react-router-dom";

function ShowCard({ name }: { name: string }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/graph/${name}`)}
      className="bg-[#222] border border-[#444] rounded-xl p-4 flex items-center justify-center h-32 w-40 cursor-pointer 
                shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:border-[#999] 
                hover:bg-[#333] hover:text-white"
    >
      <h2 className="text-lg font-semibold text-[#DDD] text-center capitalize 
                    transition-all duration-300 ease-in-out transform hover:text-[#00FFFF]">
        {name}
      </h2>
    </div>
  );
}

export default ShowCard;
