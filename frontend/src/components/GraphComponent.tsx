import React, { useRef, useEffect, useMemo, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// ...imports remain the same

const GraphComponent = ({ data, showName }) => {
    const fgRef = useRef();
    const navigate = useNavigate();
    const [selectedNode, setSelectedNode] = useState(null);
    const [references, setReferences] = useState([]);
  
    const maxCount = useMemo(() => {
      return Math.max(
        0,
        ...data.nodes
          .filter((node) => !node.is_source && typeof node.count === "number")
          .map((node) => node.count)
      );
    }, [data]);
  
    const nodeCount = data.nodes.length;
    const dynamicSize = useMemo(() => {
      const base = 12; // reduced base
      const min = 4; // smaller min size
      const shrinkRate = 0.3; // faster shrink
      return Math.max(min, base - nodeCount * shrinkRate);
    }, [nodeCount]);
  
    useEffect(() => {
      if (fgRef.current) {
        setTimeout(() => {
          fgRef.current.zoomToFit(400, 100);
        }, 500);
      }
    }, [data]);
  
    useEffect(() => {
      const interval = setInterval(() => {
        if (fgRef.current && fgRef.current.canvas()) {
          const canvas = fgRef.current.canvas();
          canvas.style.cursor = "grab";
  
          const handleMouseDown = () => (canvas.style.cursor = "grabbing");
          const handleMouseUp = () => (canvas.style.cursor = "grab");
          const handleMouseLeave = () => (canvas.style.cursor = "default");
  
          canvas.addEventListener("mousedown", handleMouseDown);
          canvas.addEventListener("mouseup", handleMouseUp);
          canvas.addEventListener("mouseleave", handleMouseLeave);
  
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }, []);
  
    // 💥 Update collision and repulsion forces
    useEffect(() => {
      if (fgRef.current) {
        fgRef.current.d3Force("charge")?.strength(-120); // more spacing
  
        const collide = fgRef.current.d3Force("collide");
        if (collide) {
          collide.radius(dynamicSize + 10); // larger radius to prevent overlap
          fgRef.current.d3ReheatSimulation();
        }
      }
    }, [dynamicSize]);
  
    const handleNodeClick = async (node) => {
      if (node.is_source) return;
      setSelectedNode(node);
      try {
        const response = await axios.get(
          `https://tvref-backend.onrender.com/references/${showName}`
        );
        const allRefs = response.data;
        const nodeRefs = allRefs[node.id] || [];
        setReferences(nodeRefs);
      } catch (error) {
        console.error("Failed to fetch references:", error);
      }
    };
  
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[#1A1A1A] relative">
        <div className="w-[90vw] h-[90vh] rounded-2xl overflow-hidden shadow-lg border border-gray-700 relative z-0">
          <ForceGraph2D
            ref={fgRef}
            linkDirectionalParticles={2}
            linkDirectionalParticleSpeed={0.005}
            cooldownTicks={100}
            onEngineStop={() => fgRef.current.zoomToFit(400)}
            nodeAutoColorBy="group"
            d3VelocityDecay={0.2}
            d3AlphaDecay={0.02}
            d3Force="collide"
            width={window.innerWidth * 0.9}
            height={window.innerHeight * 0.9}
            graphData={data}
            nodePointerAreaPaint={(node, color, ctx) => {
              ctx.fillStyle = color;
              ctx.beginPath();
              ctx.arc(node.x, node.y, dynamicSize, 0, 2 * Math.PI, false);
              ctx.fill();
            }}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const fontSize = 10 / globalScale;
  
              ctx.save();
              const isMax = node.count === maxCount;
              ctx.shadowColor = node.is_source
                ? "#FFD700"
                : isMax
                ? "#00ffff"
                : "#00bfff";
              ctx.shadowBlur = node.is_source ? 20 : isMax ? 25 : 10;
  
              ctx.beginPath();
              ctx.arc(node.x, node.y, dynamicSize, 0, 2 * Math.PI, false);
              ctx.fillStyle = node.is_source
                ? "#FFD700"
                : isMax
                ? "#00ffff"
                : node.color || "#69b3a2";
              ctx.fill();
              ctx.restore();
  
              ctx.font = `${fontSize}px Sans-Serif`;
              ctx.fillStyle = "white";
              ctx.textAlign = "center";
              ctx.textBaseline = "top";
              ctx.fillText(node.id, node.x, node.y + dynamicSize + 1);
            }}
            onNodeClick={handleNodeClick}
            linkColor={() => "#999"}
            linkWidth={1}
            backgroundColor="#1A1A1A"
          />
        </div>
  
        {/* Reference popup */}
        {selectedNode && (
          <div className="absolute top-10 right-10 bg-white text-black rounded-xl shadow-2xl w-[360px] max-h-[80vh] overflow-y-auto border border-gray-200 z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="text-md font-semibold">
                📺 References to <span className="text-blue-700">{selectedNode.id}</span>
              </h2>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-500 hover:text-red-600 font-bold text-lg"
              >
                ×
              </button>
            </div>
            <div className="p-4 space-y-3">
              {references.length > 0 ? (
                references.map((ref, idx) => (
                  <div key={idx} className="bg-gray-100 rounded-md p-3 text-sm shadow-sm">
                    <div className="text-gray-700 font-medium mb-1">🗓 {ref.episode}</div>
                    <div className="text-gray-900 italic">“{ref.line}”</div>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-gray-600">No references found.</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  export default GraphComponent;
  