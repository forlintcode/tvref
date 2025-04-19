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

  // Reset scroll position when the component is mounted
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  useEffect(() => {
    if (graph) {
      // Optional delay before showing the info modal
      const timer = setTimeout(() => {
        const seenInfo = localStorage.getItem('hasSeenInfo');
        if (!seenInfo) {
          setIsModalOpen(true);
          fetchTvShowReferences();
          localStorage.setItem('hasSeenInfo', 'true');
        }
      }, 2000); // Adjust delay (in ms) as needed

      return () => clearTimeout(timer);
    }
  }, [graph]);

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

        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
          📺 {showName}
        </h1>

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
          <h2 className="text-xl text-cyan-400 font-bold">How This Works</h2>
<ul className="mt-4 text-gray-300 text-sm space-y-3">
  <li>✨ <span className="text-cyan-300 font-semibold">Brighter circles</span> = more mentions.</li>
  <li>🎯 <span className="text-yellow-300 font-semibold">Yellow</span> = the main show you're exploring.</li>
  <li>🖱️ Click any circle to see the references made to that specific show.</li>
  <li>📺 Use this to discover fun TV references across shows!</li>
</ul>

<div className="mt-6 flex justify-end">
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
