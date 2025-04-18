import React, { useRef, useEffect, useMemo, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../config";

type NodeData = {
  id: string;
  is_source?: boolean;
  count?: number;
  color?: string;
  x?: number;
  y?: number;
};

type LinkData = {
  source: string | NodeData;
  target: string | NodeData;
};

type GraphData = {
  nodes: NodeData[];
  links: LinkData[];
};

type Reference = {
  episode: string;
  line: string;
};

type Props = {
  data: GraphData;
  showName: string;
};

// Utility to interpolate between two hex colors
const getGradientColor = (startColor: string, endColor: string, percent: number) => {
  const hexToRgb = (hex: string) =>
    hex.replace(/^#/, "").match(/.{2}/g)!.map(x => parseInt(x, 16));

  const rgbToHex = (rgb: number[]) =>
    "#" +
    rgb
      .map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("");

  const startRGB = hexToRgb(startColor);
  const endRGB = hexToRgb(endColor);

  const resultRGB = startRGB.map((start, i) =>
    Math.round(start + (endRGB[i] - start) * percent)
  );

  return rgbToHex(resultRGB);
};

const IGNORE_NODES = ["the boys","stranger things"]; // Add lowercased node IDs to ignore

const GraphComponent: React.FC<Props> = ({ data, showName }) => {
  const fgRef = useRef<any>();
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [references, setReferences] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(false);

  const filteredData = useMemo<GraphData>(() => {
    const filteredNodes = data.nodes.filter(
      node => !IGNORE_NODES.includes(node.id.toLowerCase())
    );
    const filteredLinks = data.links.filter(link => {
      const sourceId = typeof link.source === "string" ? link.source : link.source.id;
      const targetId = typeof link.target === "string" ? link.target : link.target.id;
      return (
        !IGNORE_NODES.includes(sourceId.toLowerCase()) &&
        !IGNORE_NODES.includes(targetId.toLowerCase())
      );
    });
    return { nodes: filteredNodes, links: filteredLinks };
  }, [data]);

  const maxCount = useMemo(() => {
    return Math.max(
      0,
      ...filteredData.nodes
        .filter(node => !node.is_source && typeof node.count === "number")
        .map(node => node.count || 0)
    );
  }, [filteredData]);

  const nodeCount = filteredData.nodes.length;
  const dynamicSize = useMemo(() => {
    const base = 12;
    const min = 4;
    const shrinkRate = 0.3;
    return Math.max(min, base - nodeCount * shrinkRate);
  }, [nodeCount]);

  useEffect(() => {
    if (fgRef.current) {
      setTimeout(() => {
        fgRef.current.zoomToFit(400, 100);
      }, 500);
    }
  }, [filteredData]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (fgRef.current && fgRef.current.renderer) {
        const canvas = fgRef.current.renderer().domElement;
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

  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force("charge")?.strength(-120);
      const collide = fgRef.current.d3Force("collide");
      if (collide) {
        collide.radius(dynamicSize + 10);
        fgRef.current.d3ReheatSimulation();
      }
    }
  }, [dynamicSize]);

  const handleNodeClick = async (node: NodeData) => {
    if (node.is_source) return;
    setSelectedNode(node);
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/references/${showName}`);
      const allRefs = response.data;
      const nodeRefs = allRefs[node.id] || [];
      setReferences(nodeRefs);
    } catch (error) {
      console.error("Failed to fetch references:", error);
      setReferences([]);
    }
    setLoading(false);
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-[#1A1A1A] relative">
      <div className="w-[90vw] h-[90vh] rounded-2xl overflow-hidden shadow-lg border border-gray-700 relative z-0">
        <ForceGraph2D
          ref={fgRef}
          linkDirectionalParticles={0}
          enableNodeDrag={false}
          linkDirectionalParticleSpeed={0}
          cooldownTicks={100}
          onEngineStop={() => fgRef.current.zoomToFit(400)}
          nodeAutoColorBy="group"
          d3VelocityDecay={0.2}
          d3AlphaDecay={0.02}
          d3Force="collide"
          width={window.innerWidth * 0.9}
          height={window.innerHeight * 0.9}
          graphData={filteredData}
          nodePointerAreaPaint={(node, color, ctx) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x!, node.y!, dynamicSize, 0, 2 * Math.PI, false);
            ctx.fill();
          }}
          nodeCanvasObject={(node: NodeData, ctx, globalScale) => {
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
            ctx.arc(node.x!, node.y!, dynamicSize, 0, 2 * Math.PI, false);
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
            ctx.fillText(node.id, node.x!, node.y! + dynamicSize + 1);
          }}
          onNodeClick={handleNodeClick}
          linkColor={() => "#999"}
          linkWidth={1}
          backgroundColor="#1A1A1A"
        />
      </div>

      {selectedNode && (
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 sm:top-10 sm:left-auto sm:right-10 bg-white text-black rounded-xl shadow-2xl w-[90vw] sm:w-[360px] max-h-[80vh] overflow-y-auto border border-gray-200 z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-white z-10">
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
            {loading ? (
              <p className="text-center text-sm text-gray-600">🔄 Loading references...</p>
            ) : references.length > 0 ? (
              references.map((ref, idx) => (
                <div key={idx} className="bg-gray-100 rounded-md p-3 text-sm shadow-sm">
                  <div className="text-gray-700 font-medium mb-1">🗓 {ref.episode}</div>
                  <div className="text-gray-900 italic">“{ref.line}”</div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-gray-600">
                Unable to load references (probably transient error, try again later).
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphComponent;
