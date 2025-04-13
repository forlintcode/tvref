import { useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import GraphComponent from '../components/GraphComponent';
import BASE_URL from "../config";

function GraphView() {
  const { showName } = useParams();
  const [graph, setGraph] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [references, setReferences] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tvShowReferences, setTvShowReferences] = useState<any[]>([]);
  const hasFetchedGraph = useRef(false);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        console.log("Fetching graph for:", showName);
        const response = await fetch(`${BASE_URL}/graph/${showName}`);
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
      const res = await axios.get(`${BASE_URL}/references/${showName}`);
      const allRefs = res.data;
      const nodeRefs = allRefs[nodeId] || [];
      setSelectedNode(nodeId);
      setReferences(nodeRefs);
    } catch (err) {
      console.error("Failed to fetch references", err);
    }
  };

  const fetchTvShowReferences = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/references/tvshows`);
      setTvShowReferences(res.data);
    } catch (err) {
      console.error("Failed to fetch TV show references", err);
    }
  };

  return (
    <div className="h-screen w-screen bg-black text-white overflow-y-auto">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 flex justify-between items-center px-6 py-4 bg-[#111] border-b border-gray-700">
        <button
          onClick={() => window.location.href = '/'}
          className="bg-[#222] text-white px-4 py-1 rounded-full border border-gray-600 hover:border-cyan-400 hover:text-cyan-300 transition"
        >
          ← Home
        </button>

        <h1 className="text-2xl font-bold text-white">📺 {showName}</h1>

        {/* Matching Info Button (no icons used) */}
        <button
          onClick={() => {
            setIsModalOpen(true);
            fetchTvShowReferences();
          }}
          className="bg-[#222] text-white px-4 py-1 rounded-full border border-gray-600 hover:border-cyan-400 hover:text-cyan-300 transition"
        >
          Info
        </button>
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

      {/* Info Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-[#222] p-6 rounded-lg w-[90%] sm:w-[400px]">
            <h2 className="text-xl text-cyan-400 font-bold">Node Color Legend</h2>
            <ul className="mt-4 text-gray-400 text-sm space-y-2">
              <li>🔆 Brighter nodes have <span className="text-cyan-200">higher reference counts</span>.</li>
              <li>🎯 Source nodes are highlighted with <span className="text-yellow-400">yellow</span>.</li>
              <li>
  &#x1F448; Clicking on a node will expand and show the references.
</li>            </ul>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GraphView;
