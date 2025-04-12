import { useParams } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import GraphComponent from '../components/GraphComponent'

function GraphView() {
  const { showName } = useParams()
  const [graph, setGraph] = useState<any>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [references, setReferences] = useState<any[]>([]);
  const hasFetchedGraph = useRef(false); // Prevent double fetch

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        console.log("Fetching graph for:", showName);
        const response = await fetch(`https://tvref-backend.onrender.com/graph/${showName}`);
        const data = await response.json();
        console.log("Graph data received:", data);
        setGraph(data);
      } catch (error) {
        console.error("Error fetching graph:", error);
      }
    };

    if (!hasFetchedGraph.current) {
      hasFetchedGraph.current = true;
      fetchGraph();
    }
  }, [showName]);

  const handleNodeClick = async (nodeId: string) => {
    try {
      const res = await axios.get(`https://tvref-backend.onrender.com/references/${showName}`);
      const allRefs = res.data;
      const nodeRefs = allRefs[nodeId] || [];
      setSelectedNode(nodeId);
      setReferences(nodeRefs);
    } catch (err) {
      console.error("Failed to fetch references", err);
    }
  };

  return (
    <div className="h-screen w-screen bg-black text-white overflow-y-auto">
      <div className="flex justify-between items-center px-6 py-4 bg-[#111] border-b border-gray-700">
        <button
          onClick={() => window.location.href = '/'}
          className="bg-[#222] text-white px-4 py-1 rounded-full border border-gray-600 hover:border-cyan-400 hover:text-cyan-300 transition"
        >
          ← Home
        </button>
        <h1 className="text-2xl font-bold text-white">📺 {showName}</h1>
        <div className="w-[84px]" /> {/* Spacer to balance the layout */}
      </div>

      <div className="h-[70%]">
        {graph ? (
          <GraphComponent data={graph} showName={showName} onNodeClick={handleNodeClick} />
        ) : (
          <p className="text-center mt-10">Loading...</p>
        )}
      </div>

      {selectedNode && (
        <div className="bg-[#111] p-4 border-t border-gray-700">
          <h2 className="text-xl font-bold text-cyan-400">
            📺 References to <span className="text-yellow-400">{selectedNode}</span>
          </h2>
          {references.length === 0 ? (
            <p className="text-gray-400 mt-2">No references found.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {references.map((ref, idx) => (
                <li key={idx} className="bg-[#222] p-2 rounded shadow">
                  <div className="text-sm text-gray-400">Episode: {ref.episode}</div>
                  <div className="text-white italic">"{ref.line}"</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default GraphView
