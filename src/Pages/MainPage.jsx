import { useState, useRef, useEffect, useCallback } from "react";
import dagre from "dagre";
import {
  Zap, Send, Upload, Plus, Trash2, ChevronRight,
  MessageSquare, Bot, User, Paperclip, RotateCcw,
  ZoomIn, ZoomOut, Maximize2, Download, X, Lightbulb
} from "lucide-react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

/* ─── Styles ───────────────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@400;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { overflow: hidden; height: 100%; }

  .bb  { font-family: 'Bebas Neue', cursive; }
  .mno { font-family: 'IBM Plex Mono', monospace; }

  /* ── Root shell ── */
  .db-root {
    font-family: 'IBM Plex Mono', monospace;
    background-color: #f4f4f0;
    background-image:
      linear-gradient(rgba(0,0,0,0.055) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,0,0,0.055) 1px, transparent 1px);
    background-size: 40px 40px;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* ── Nav ── */
  .db-nav {
    flex-shrink: 0;
    background: #f4f4f0;
    border-bottom: 4px solid #000;
    padding: 10px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 50;
  }

  /* ── Button press ── */
  .btn {
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 3px solid #000;
    font-family: 'Bebas Neue', cursive;
    letter-spacing: .1em;
    transition: transform .08s ease, box-shadow .08s ease;
    white-space: nowrap;
    background: none;
  }
  .btn:hover  { transform: translate(3px,3px); box-shadow: 0 0 0 0 #000 !important; }
  .btn:active { transform: translate(5px,5px); box-shadow: 0 0 0 0 #000 !important; }

  /* ── 3-column workspace ── */
  .db-workspace {
    flex: 1;
    display: grid;
    grid-template-columns: 260px 1fr 1fr;
    grid-template-rows: 1fr;
    overflow: hidden;
    min-height: 0;
  }

  /* ── Panel base ── */
  .panel {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
  }

  .panel-header {
    flex-shrink: 0;
    border-bottom: 4px solid #000;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .panel-body {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    min-height: 0;
  }

  /* custom scrollbar */
  .panel-body::-webkit-scrollbar { width: 6px; }
  .panel-body::-webkit-scrollbar-track { background: #f4f4f0; }
  .panel-body::-webkit-scrollbar-thumb { background: #000; }

  /* ── Panel borders ── */
  .panel-left   { border-right: 4px solid #000; background: #0a0a0a; }
  .panel-mid    { border-right: 4px solid #000; background: #f4f4f0; }
  .panel-right  { background: #f4f4f0; }

  /* ── Chat history panel ── */
  .history-item {
    border-bottom: 3px solid #1a1a1a;
    padding: 14px 16px;
    cursor: pointer;
    transition: background .1s;
  }
  .history-item:hover   { background: #111; }
  .history-item.active  { background: #1a1a1a; border-left: 4px solid #00E5FF; }

  /* ── AI response panel ── */
  .msg-bubble {
    padding: 14px 16px;
    margin: 12px 14px;
    border: 3px solid #000;
  }
  .msg-user {
    background: #FFAB00;
    margin-left: 32px;
    box-shadow: 4px 4px 0 0 #000;
  }
  .msg-ai {
    background: #fff;
    margin-right: 32px;
    box-shadow: 4px 4px 0 0 #000;
  }
  .msg-avatar {
    width: 28px; height: 28px;
    border: 3px solid #000;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    font-size: 12px;
    font-weight: 700;
  }

  /* typing indicator */
  @keyframes tdot { 0%,80%,100%{transform:scale(0);opacity:.3} 40%{transform:scale(1);opacity:1} }
  .tdot { width:7px; height:7px; background:#000; border-radius:50%; display:inline-block; animation: tdot 1.2s ease-in-out infinite; }
  .tdot:nth-child(2){animation-delay:.2s}
  .tdot:nth-child(3){animation-delay:.4s}

  /* ── Prompt bar ── */
  .prompt-bar {
    flex-shrink: 0;
    border-top: 4px solid #000;
    background: #fff;
    padding: 12px 14px;
    display: flex;
    align-items: flex-end;
    gap: 10px;
  }

  .prompt-textarea {
    flex: 1;
    border: 3px solid #000;
    background: #f4f4f0;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    font-weight: 600;
    color: #000;
    padding: 10px 14px;
    resize: none;
    outline: none;
    min-height: 44px;
    max-height: 120px;
    line-height: 1.5;
    transition: box-shadow .1s;
  }
  .prompt-textarea:focus { box-shadow: 4px 4px 0 0 #000; background: #fff; }
  .prompt-textarea::placeholder { color: #aaa; font-weight: 400; }

  /* ── Tree diagram panel ── */
  .tree-canvas {
    flex: 1;
    position: relative;
    overflow: hidden;
    min-height: 0;
  }

  /* tree toolbar */
  .tree-toolbar {
    flex-shrink: 0;
    border-bottom: 4px solid #000;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #FFAB00;
  }

  /* tag pill */
  .tag-pill {
    border: 2px solid;
    padding: 2px 8px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .1em;
  }

  /* upload prompt */
  .upload-prompt {
    border: 3px dashed #000;
    padding: 32px 20px;
    margin: 20px 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    text-align: center;
    cursor: pointer;
    transition: background .15s;
    background: rgba(0,229,255,.06);
  }
  .upload-prompt:hover { background: rgba(0,229,255,.14); }

  /* blink */
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  .blink { animation: blink 1s step-end infinite; }

  /* node pulse */
  @keyframes npulse { 0%,100%{opacity:1} 50%{opacity:.6} }
  .npulse { animation: npulse 2.4s ease-in-out infinite; }

  /* status dot */
  .dot-live { width:8px; height:8px; border-radius:50%; background:#00E5FF; border:2px solid #000; animation:npulse 1.5s ease-in-out infinite; display:inline-block; }

  /* ── React Flow overrides ── */
  .react-flow__controls {
    border: 3px solid #000 !important;
    box-shadow: 4px 4px 0 0 #000 !important;
    border-radius: 0 !important;
    overflow: hidden;
  }
  .react-flow__controls-button {
    border: none !important;
    border-bottom: 2px solid #000 !important;
    background: #f4f4f0 !important;
    border-radius: 0 !important;
    width: 28px !important;
    height: 28px !important;
    transition: background .1s !important;
  }
  .react-flow__controls-button:hover {
    background: #FFAB00 !important;
  }
  .react-flow__controls-button:last-child {
    border-bottom: none !important;
  }
  .react-flow__controls-button svg {
    fill: #000 !important;
    max-width: 12px !important;
  }
  .react-flow__background {
    background-color: #f4f4f0 !important;
  }

  /* Neobrutalist node */
  .neo-node {
    border: 3px solid #000;
    padding: 12px 18px;
    font-family: 'Bebas Neue', cursive;
    letter-spacing: .08em;
    white-space: normal;
    word-break: break-word;
    text-align: center;
    cursor: pointer;
    transition: transform .1s, box-shadow .1s;
    box-shadow: 4px 4px 0 0 #000;
    user-select: none;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    line-height: 1.4;
    text-transform: uppercase;
  }
  .neo-node:hover {
    transform: translate(-2px,-2px);
    box-shadow: 6px 6px 0 0 #000;
  }
  .neo-node.selected {
    border: 3px solid #FF6B9D !important;
    box-shadow: 5px 5px 0 0 #FF6B9D !important;
  }
  .react-flow__node { padding: 0 !important; border: none !important; border-radius: 0 !important; background: none !important; box-shadow: none !important; }
  .react-flow__node.selected .neo-node { border-color: #FF6B9D !important; box-shadow: 5px 5px 0 0 #FF6B9D !important; }
  .react-flow__handle { opacity: 0 !important; }
  .react-flow__edge-path { stroke: #000 !important; stroke-width: 3 !important; }
  .react-flow__edge.selected .react-flow__edge-path { stroke: #FF6B9D !important; }

  /* ── Skill Detail Panel ── */
  .skill-detail-panel {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 320px;
    background: #fff;
    border-left: 4px solid #000;
    z-index: 20;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideIn .2s ease-out;
  }
  @keyframes slideIn {
    from { transform: translateX(100%); }
    to   { transform: translateX(0); }
  }
  .skill-detail-panel .detail-header {
    flex-shrink: 0;
    padding: 14px 16px;
    border-bottom: 4px solid #000;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }
  .skill-detail-panel .detail-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }
  .skill-detail-panel .detail-body::-webkit-scrollbar { width: 5px; }
  .skill-detail-panel .detail-body::-webkit-scrollbar-track { background: #f4f4f0; }
  .skill-detail-panel .detail-body::-webkit-scrollbar-thumb { background: #000; }
  .project-card {
    border: 2px solid #000;
    padding: 10px 12px;
    margin-bottom: 8px;
    background: #f4f4f0;
    box-shadow: 3px 3px 0 0 #000;
    transition: transform .08s, box-shadow .08s;
  }
  .project-card:hover {
    transform: translate(-2px,-2px);
    box-shadow: 5px 5px 0 0 #000;
  }

  /* ── Mobile responsiveness ── */
  @media (max-width: 1024px) {
    html, body { overflow: auto; height: auto; }
    .db-root { height: auto; overflow: auto; min-height: 100vh; }
    .db-workspace {
      display: flex;
      flex-direction: column;
      overflow-y: auto;
    }
    .panel-left {
      min-height: 600px;
      border-right: none;
      border-bottom: 4px solid #000;
    }
    .panel-mid {
      min-height: 600px;
      border-right: none;
      border-bottom: 4px solid #000;
    }
    .panel-right {
      min-height: 600px;
    }
    .db-nav {
      flex-wrap: wrap;
      gap: 10px;
    }
  }
`;

/* ─── Seed data ────────────────────────────────────────────────────────────── */
const CHAT_HISTORY = [
  { id:1, title:"CS101 Syllabus", subtitle:"12 skills extracted", time:"2h ago", active:true },
  { id:2, title:"Data Structures", subtitle:"8 skills extracted",  time:"Yesterday" },
  { id:3, title:"Web Dev Course",  subtitle:"21 skills extracted", time:"Mon" },
  { id:4, title:"ML Fundamentals", subtitle:"15 skills extracted", time:"Sun" },
  { id:5, title:"DevOps Basics",   subtitle:"9 skills extracted",  time:"Fri" },
];

const INTRO_MESSAGE = { id:1, role:"ai", text:"Hey! Upload your syllabus PDF and I'll extract a skill roadmap for you. Drop it below or paste the course outline directly." };

const INIT_MESSAGES = [
  INTRO_MESSAGE,
  { id:2, role:"user", text:"Here's my CS101 syllabus. Can you extract the key skills I need to learn?" },
  { id:3, role:"ai",   text:"Analysed your syllabus. Found 12 real-world skills across 4 domains: Programming Fundamentals, Data Structures, Algorithms, and System Design. Generating your skill tree now →" },
  { id:4, role:"user", text:"Which skill should I learn first if I want to get a job fast?" },
  { id:5, role:"ai",   text:"Start with Git + JavaScript fundamentals — they unlock the most adjacent skills and appear in 94% of entry-level job listings. From there: React → Node.js → REST APIs is your fastest path to hireable." },
];

/* ─── Tree layout ──────────────────────────────────────────────────────────── */
const NODE_SIZES = { root:{w:280,h:60}, domain:{w:220,h:50}, skill:{w:180,h:46}, leaf:{w:160,h:46} };

const TREE_NODE_DATA = [
  { id:"root",  label:"CS101 SYLLABUS", x:310, y:30,  color:"#FFAB00", type:"root",
    description: "Your uploaded syllabus. All skills branch from here.",
    projects: ["Complete the full roadmap to become job-ready"] },
  { id:"d1", label:"PROGRAMMING",    x:80,  y:130, color:"#00E5FF",  type:"domain",
    description: "Core programming concepts — the foundation of all software engineering.",
    projects: ["Build a personal portfolio CLI tool", "Create a calculator with tests"] },
  { id:"d2", label:"DATA STRUCTURES",x:270, y:130, color:"#FF6B9D",  type:"domain",
    description: "How data is organized in memory — critical for writing efficient code.",
    projects: ["Implement your own data structure library", "Visualize sorting algorithms"] },
  { id:"d3", label:"ALGORITHMS",     x:460, y:130, color:"#00E5FF",  type:"domain",
    description: "Problem-solving patterns used in every technical interview and production system.",
    projects: ["Solve 50 LeetCode problems", "Build a pathfinding visualizer"] },
  { id:"d4", label:"SYSTEM DESIGN",  x:620, y:130, color:"#c8ff00",  type:"domain",
    description: "Designing scalable, reliable software systems — what separates juniors from seniors.",
    projects: ["Design a URL shortener architecture", "Sketch a chat app system diagram"] },
  { id:"s1", label:"JAVASCRIPT",  x:20,  y:250, color:"#fff", type:"skill",
    description: "The language of the web. Used for frontend, backend, and everything in between.",
    projects: ["Build a Random Color Generator to master DOM manipulation", "Create a Stopwatch App to learn event handling", "Make a Quiz App with score tracking"] },
  { id:"s2", label:"GIT",         x:140, y:250, color:"#fff", type:"skill",
    description: "Version control system used by every development team worldwide.",
    projects: ["Contribute to an open source project", "Set up a branching strategy for a team project", "Create a git cheat sheet from practice"] },
  { id:"s3", label:"ARRAYS",      x:230, y:250, color:"#fff", type:"skill",
    description: "The most fundamental data structure — contiguous memory, O(1) access.",
    projects: ["Build a dynamic to-do list with add/remove/filter", "Implement array sorting visualizer", "Create a leaderboard with live sorting"] },
  { id:"s4", label:"LINKED LIST", x:320, y:250, color:"#fff", type:"skill",
    description: "Pointer-based data structure. Foundation for stacks, queues, and more.",
    projects: ["Build a music playlist (add, remove, next, prev)", "Implement an undo/redo system", "Create a browser history navigator"] },
  { id:"s5", label:"SORTING",     x:410, y:250, color:"#fff", type:"skill",
    description: "Organizing data efficiently. Bubble, merge, quick — each with trade-offs.",
    projects: ["Build a sorting algorithm visualizer", "Compare sort speeds with benchmarks", "Implement a ranked leaderboard system"] },
  { id:"s6", label:"BIG-O",       x:510, y:250, color:"#fff", type:"skill",
    description: "Measuring algorithm efficiency. Essential for writing performant code.",
    projects: ["Analyze your own code's time complexity", "Write a blog post comparing O(n) vs O(n²)", "Profile a slow function and optimize it"] },
  { id:"s7", label:"REST APIs",   x:590, y:250, color:"#fff", type:"skill",
    description: "The standard way frontend and backend communicate over HTTP.",
    projects: ["Build a weather dashboard using a public API", "Create a CRUD API with Express.js", "Make a movie search app with OMDB API"] },
  { id:"s8", label:"DOCKER",      x:680, y:250, color:"#fff", type:"skill",
    description: "Containerization tool that makes apps portable and deployable anywhere.",
    projects: ["Dockerize a Node.js app", "Set up a multi-container app with Docker Compose", "Deploy a container to a cloud service"] },
  { id:"l1", label:"REACT",    x:20,  y:360, color:"#FFAB00", type:"leaf",
    description: "Most popular UI library. Component-based, fast, and used by top companies.",
    projects: ["Build a Pomodoro Timer with state management", "Create a GitHub profile viewer", "Make a real-time chat UI"] },
  { id:"l2", label:"NODE.JS",  x:110, y:360, color:"#FFAB00", type:"leaf",
    description: "Run JavaScript on the server. Powers APIs, CLIs, and full-stack apps.",
    projects: ["Build a CLI note-taking app", "Create a REST API with authentication", "Make a real-time chat server with Socket.io"] },
  { id:"l3", label:"SQL",      x:260, y:360, color:"#FF6B9D", type:"leaf",
    description: "Query language for relational databases. Used everywhere from startups to banks.",
    projects: ["Build an inventory management system", "Create complex queries on a sample dataset", "Design a normalized database schema"] },
  { id:"l4", label:"GRAPHS",   x:360, y:360, color:"#00E5FF", type:"leaf",
    description: "Nodes + edges. Used in social networks, maps, and recommendation engines.",
    projects: ["Build a social network friend suggestion system", "Implement Dijkstra's shortest path", "Create a dependency resolver"] },
  { id:"l5", label:"AWS",      x:620, y:360, color:"#c8ff00", type:"leaf",
    description: "Leading cloud platform. Deploy, scale, and manage apps in production.",
    projects: ["Deploy a static site to S3 + CloudFront", "Set up a serverless function with Lambda", "Create a CI/CD pipeline with CodePipeline"] },
];

const TREE_EDGES_DATA = [
  ["root","d1"],["root","d2"],["root","d3"],["root","d4"],
  ["d1","s1"],["d1","s2"],
  ["d2","s3"],["d2","s4"],
  ["d3","s5"],["d3","s6"],
  ["d4","s7"],["d4","s8"],
  ["s1","l1"],["s2","l2"],["s3","l3"],["s5","l4"],["s8","l5"],
];

/* ─── Auto-Layout Engine (Dagre) ───────────────────────────────────────────── */
// Always create a FRESH graph per call — reusing a module-level instance causes
// stale node positions from previous layouts to bleed into the new one.
const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, ranksep: 180, nodesep: 100 });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: node.data.width || 120, height: node.data.height || 40 });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - (node.data.width || 120) / 2,
        y: pos.y - (node.data.height || 40) / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

/* ─── Convert to React Flow format + run Dagre layout on seed data ────────── */
// Build raw nodes first (position: {x:0,y:0} — Dagre will overwrite these)
const _RAW_RF_NODES = TREE_NODE_DATA.map(n => {
  const sz = NODE_SIZES[n.type];
  return {
    id: n.id,
    type: "neobrutalist",
    position: { x: 0, y: 0 },
    data: {
      label: n.label,
      color: n.color,
      nodeType: n.type,
      width: sz.w,
      height: sz.h,
      description: n.description || "",
      projects: n.projects || [],
    },
    style: { width: sz.w, height: sz.h },
  };
});

const _RAW_RF_EDGES = TREE_EDGES_DATA.map(([source, target]) => ({
  id: `e-${source}-${target}`,
  source,
  target,
  type: "step",
  style: { stroke: "#000", strokeWidth: 3 },
}));

// Run the seed data through Dagre so the initial render is already laid out
const { nodes: RF_NODES, edges: RF_EDGES } = getLayoutedElements(_RAW_RF_NODES, _RAW_RF_EDGES);

/* ─── Neobrutalist Node Component ───────────────────────────────────────────── */
function NeobrutalistNode({ data, selected }) {
  const fontSize = data.nodeType === "root" ? 15 : data.nodeType === "domain" ? 13 : 11;
  return (
    <div
      className={`neo-node${selected ? " selected" : ""}`}
      style={{
        background: data.color,
        width: data.width,
        height: data.height,
        fontSize,
        border: selected ? "3px solid #FF6B9D" : "3px solid #000",
        boxShadow: selected ? "5px 5px 0 0 #FF6B9D" : "4px 4px 0 0 #000",
      }}
    >
      <Handle type="target" position={Position.Top} />
      {data.label}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

const nodeTypes = { neobrutalist: NeobrutalistNode };

/* ─── Tree Panel Inner (needs ReactFlow context) ────────────────────────────── */
function SkillTreePanel({ selectedNode, setSelectedNode, onTreeUpdate }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(RF_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(RF_EDGES);
  const { fitView } = useReactFlow();

  // Expose setNodes / setEdges / fitView to parent via callback ref pattern
  useEffect(() => {
    if (onTreeUpdate) {
      onTreeUpdate({ setNodes, setEdges, fitView });
    }
  }, [onTreeUpdate, setNodes, setEdges, fitView]);

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(prev => prev === node.id ? null : node.id);
  }, [setSelectedNode]);

  // Tooltip resolves from live nodes so it reflects API-updated data
  const selectedNodeData = selectedNode
    ? nodes.find(n => n.id === selectedNode)?.data ?? null
    : null;

  return (
    <div className="panel panel-right" style={{display:"flex", flexDirection:"column"}}>
      {/* Tree toolbar */}
      <div className="tree-toolbar">
        <div style={{display:"flex", alignItems:"center", gap:8}}>
          <div style={{width:10, height:10, background:"#000", border:"2px solid #000"}}/>
          <span className="bb" style={{fontSize:18, letterSpacing:".08em"}}>SKILL TREE</span>
          <span className="tag-pill" style={{borderColor:"#000", background:"rgba(0,0,0,.1)", color:"#000"}}>
            {nodes.length} NODES
          </span>
        </div>
        <div style={{display:"flex", gap:6}}>
          <button
            className="btn"
            style={{padding:"4px 10px", fontSize:12, border:"2px solid #000", boxShadow:"2px 2px 0 #000", background:"#fff"}}
            onClick={() => alert("Downloading roadmap JSON...")}
          >
            <Download size={13} strokeWidth={3}/> EXPORT
          </button>
          <button
            className="btn"
            style={{padding:"4px 10px", fontSize:12, border:"2px solid #000", boxShadow:"2px 2px 0 #000", background:"#fff"}}
            onClick={() => fitView({ duration: 400 })}
          >
            <Maximize2 size={13} strokeWidth={3}/>
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="tree-canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.4 }}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#c8c8c4" gap={40} size={1} />
          <Controls position="bottom-right" showInteractive={false} />
        </ReactFlow>

        {/* Selected node detail panel */}
        {selectedNodeData && (
          <div className="skill-detail-panel">
            <div className="detail-header" style={{background: selectedNodeData.color}}>
              <div>
                <div className="bb" style={{fontSize:22, lineHeight:1.1, marginBottom:6}}>{selectedNodeData.label}</div>
                <span className="tag-pill" style={{borderColor:"#000", background:"rgba(0,0,0,.12)", color:"#000", fontSize:10}}>
                  {(selectedNodeData.nodeType ?? "node").toUpperCase()}
                </span>
              </div>
              <button
                className="btn"
                style={{padding:6, border:"2px solid #000", boxShadow:"2px 2px 0 #000", background:"#fff", flexShrink:0}}
                onClick={() => setSelectedNode(null)}
              >
                <X size={14} strokeWidth={3}/>
              </button>
            </div>
            <div className="detail-body">
              {/* Description */}
              <div style={{marginBottom:16}}>
                <span className="mno" style={{fontSize:10, fontWeight:700, color:"#888", letterSpacing:".12em", display:"block", marginBottom:6}}>ABOUT THIS SKILL</span>
                <p className="mno" style={{fontSize:12, fontWeight:600, color:"#333", lineHeight:1.7}}>
                  {selectedNodeData.description || (
                    selectedNodeData.nodeType === "root"   ? "Your uploaded syllabus. All skills branch from here." :
                    selectedNodeData.nodeType === "domain" ? "A major skill domain extracted from your syllabus." :
                    selectedNodeData.nodeType === "skill"  ? "A specific skill you need to learn in this domain." :
                    "Advanced skill unlocked after mastering prerequisites."
                  )}
                </p>
              </div>

              {/* Project Ideas */}
              {(selectedNodeData.projects?.length > 0) && (
                <div>
                  <div style={{display:"flex", alignItems:"center", gap:6, marginBottom:10}}>
                    <Lightbulb size={14} strokeWidth={3} color="#FFAB00"/>
                    <span className="mno" style={{fontSize:10, fontWeight:700, color:"#888", letterSpacing:".12em"}}>PRACTICE PROJECTS</span>
                  </div>
                  {selectedNodeData.projects.map((project, i) => (
                    <div key={i} className="project-card">
                      <div style={{display:"flex", alignItems:"flex-start", gap:8}}>
                        <span className="bb" style={{fontSize:16, color:"#FFAB00", lineHeight:1, flexShrink:0, marginTop:1}}>{i + 1}.</span>
                        <p className="mno" style={{fontSize:11, fontWeight:600, color:"#333", lineHeight:1.5, margin:0}}>
                          {project}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No projects fallback */}
              {(!selectedNodeData.projects || selectedNodeData.projects.length === 0) && (
                <div style={{border:"2px dashed #ccc", padding:"14px 12px", textAlign:"center"}}>
                  <p className="mno" style={{fontSize:11, fontWeight:600, color:"#aaa", lineHeight:1.5}}>
                    Upload a syllabus to get personalized project ideas for this skill.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hint */}
        <div style={{position:"absolute", top:12, left:12, zIndex:5, pointerEvents:"none"}}>
          <span className="mno" style={{fontSize:10, fontWeight:700, color:"#aaa", letterSpacing:".1em"}}>
            DRAG TO PAN · SCROLL TO ZOOM · CLICK NODE FOR DETAILS
          </span>
        </div>
      </div>

      {/* Tree legend */}
      <div style={{flexShrink:0, borderTop:"4px solid #000", background:"#fff", padding:"8px 16px", display:"flex", gap:16, flexWrap:"wrap", alignItems:"center"}}>
        <span className="mno" style={{fontSize:10, fontWeight:700, letterSpacing:".1em", color:"#888"}}>LEGEND:</span>
        {[
          {color:"#FFAB00",  label:"SYLLABUS ROOT"},
          {color:"#00E5FF",  label:"DOMAIN"},
          {color:"#fff",     label:"SKILL"},
          {color:"#FF6B9D",  label:"ADVANCED"},
        ].map(l=>(
          <div key={l.label} style={{display:"flex", alignItems:"center", gap:6}}>
            <div style={{width:14, height:14, background:l.color, border:"2px solid #000"}}/>
            <span className="mno" style={{fontSize:10, fontWeight:700, letterSpacing:".08em"}}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main ─────────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const [messages, setMessages]         = useState(INIT_MESSAGES);
  const [input, setInput]               = useState("");
  const [isTyping, setIsTyping]         = useState(false);
  const [activeChat, setActiveChat]     = useState(1);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isUploading, setIsUploading]   = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef    = useRef(null);
  const fileInputRef   = useRef(null);
  // Holds { setNodes, setEdges, fitView } once SkillTreePanel mounts
  const treeApiRef     = useRef(null);

  const handleTreeUpdate = useCallback((api) => {
    treeApiRef.current = api;
  }, []);

  useEffect(()=>{
    messagesEndRef.current?.scrollIntoView({ behavior:"smooth" });
  },[messages, isTyping]);

  /* ── Chat ── */
  function handleSend() {
    const txt = input.trim();
    if (!txt) return;
    setMessages(m=>[...m, { id:Date.now(), role:"user", text:txt }]);
    setInput("");
    setIsTyping(true);
    setTimeout(()=>{
      setIsTyping(false);
      setMessages(m=>[...m, {
        id: Date.now()+1,
        role: "ai",
        text: "Processing your query... I've updated the skill tree on the right with relevant nodes highlighted. Keep exploring or ask me about a specific skill path.",
      }]);
    }, 1800);
  }

  function handleKey(e) {
    if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  /* ── New Chat ── */
  function handleNewChat() {
    setMessages([INTRO_MESSAGE]);
    setSelectedNode(null);
  }

  /* ── File Upload → API ── */
  function triggerFileInput() {
    fileInputRef.current?.click();
  }

  async function onFileChange(e) {
    const file = e.target.files?.[0];
    // Reset input immediately so the same file can be re-selected later
    e.target.value = "";
    if (!file) return;

    // ── Step 2: build multipart payload ──
    const formData = new FormData();
    formData.append("syllabus", file);

    // ── Step 3: set loading state ──
    setIsGenerating(true);
    setIsUploading(true);

    // ── Step 4: optimistic chat message ──
    setMessages(m => [
      ...m,
      {
        id: Date.now(),
        role: "ai",
        text: "Uploading and analyzing your syllabus... This usually takes 10-15 seconds.",
      },
    ]);

    try {
      // ── Step 5: POST multipart/form-data ──
      const response = await fetch("http://localhost:5000/api/generate-tree", {
        method: "POST",
        body: formData,
        // Do NOT set Content-Type manually — the browser sets the boundary automatically
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Server error ${response.status}: ${errText}`);
      }

      // ── Step 6: parse JSON ──
      const data = await response.json();

      // ── Step 7: update React Flow canvas ──
      if (treeApiRef.current) {
        const { setNodes, setEdges, fitView } = treeApiRef.current;

        // Map API nodes → React Flow node objects
        const rawNodes = (data.nodes ?? []).map(n => {
          const typeStr = n.type || "skill";
          const sz = NODE_SIZES[typeStr] ?? NODE_SIZES.skill;

          // Assign colors based on node type to keep it pretty
          let bgColor = "#fff";
          if (typeStr === "root") bgColor = "#FFAB00";
          if (typeStr === "domain") bgColor = "#00E5FF";
          if (typeStr === "leaf") bgColor = "#c8ff00";

          // Safely extract the label, falling back appropriately
          const nodeLabel = n.data?.label || n.label || String(n.id);

          return {
            id: String(n.id),
            type: "neobrutalist",
            position: { x: 0, y: 0 }, // Dagre will overwrite this!
            data: {
              label:    nodeLabel,
              color:    bgColor,
              nodeType: typeStr,
              width:    sz.w,
              height:   sz.h,
              description: n.data?.description || "",
              projects:    n.data?.projects || [],
            },
            style: { width: sz.w, height: sz.h },
          };
        });

        // Map API edges → React Flow edge objects
        const rawEdges = (data.edges ?? []).map((edge, i) => ({
          id:     edge.id ?? `e-${edge.source}-${edge.target}-${i}`,
          source: String(edge.source),
          target: String(edge.target),
          type:   "step",
          style:  { stroke: "#000", strokeWidth: 3 },
        }));

        // APPLY DAGRE AUTO-LAYOUT
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(rawNodes, rawEdges);

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

        // Re-fit the viewport after a tick to let React Flow measure the new nodes
        setTimeout(() => fitView({ duration: 500, padding: 0.4 }), 50);
      }

      // ── Step 8: success message ──
      setMessages(m => [
        ...m,
        {
          id: Date.now() + 1,
          role: "ai",
          text: "Skill tree generated successfully! Explore the interactive roadmap on the right.",
        },
      ]);
    } catch (err) {
      console.error("Tree generation failed:", err);

      // ── Step 10 (catch): push error into chat ──
      setMessages(m => [
        ...m,
        {
          id: Date.now() + 2,
          role: "ai",
          text: `⚠ Failed to generate skill tree: ${err.message}. Please check your connection and try again.`,
        },
      ]);
    } finally {
      // ── Step 9 / Step 10: always clear loading ──
      setIsGenerating(false);
      setIsUploading(false);
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: STYLES}}/>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        style={{display:"none"}}
        onChange={onFileChange}
      />

      <div className="db-root">

        {/* ── NAV ── */}
        <nav className="db-nav">
          {/* Logo */}
          <div style={{display:"flex", alignItems:"center", gap:10}}>
            <div className="btn" style={{padding:6, background:"#00E5FF", boxShadow:"3px 3px 0 #000"}}>
              <Zap size={16} strokeWidth={3}/>
            </div>
            <span className="bb" style={{fontSize:24, letterSpacing:".06em", lineHeight:1}}>
              SKILL<span style={{color:"#00E5FF", WebkitTextStroke:"1px #000"}}>BRIDGE</span>
              <span className="mno" style={{fontSize:11, fontWeight:700, background:"#000", color:"#fff", padding:"1px 5px", marginLeft:7}}>AI</span>
            </span>
          </div>

          {/* Centre status */}
          <div style={{display:"flex", alignItems:"center", gap:10, background:"#fff", border:"3px solid #000", padding:"5px 14px", boxShadow:"3px 3px 0 #000"}}>
            <span className="dot-live"/>
            <span className="mno" style={{fontSize:11, fontWeight:700, letterSpacing:".1em"}}>
              {isGenerating
                ? "ANALYZING SYLLABUS…"
                : isUploading
                  ? "UPLOADING PDF…"
                  : "SESSION ACTIVE — CS101 SYLLABUS"}
            </span>
          </div>

          {/* Right actions */}
          <div style={{display:"flex", gap:10}}>
            <button
              className="btn"
              style={{fontSize:14, padding:"6px 14px", background:"#f4f4f0", boxShadow:"3px 3px 0 #000", opacity: isGenerating ? 0.45 : 1}}
              onClick={handleNewChat}
              disabled={isGenerating}
            >
              <Plus size={14} strokeWidth={3}/> NEW CHAT
            </button>
            <button
              className="btn"
              style={{fontSize:14, padding:"6px 14px", background: isGenerating ? "#f4f4f0" : "#FFAB00", boxShadow:"3px 3px 0 #000", opacity: isGenerating ? 0.45 : 1}}
              onClick={triggerFileInput}
              disabled={isGenerating}
            >
              <Upload size={14} strokeWidth={3}/> {isGenerating ? "PROCESSING…" : "UPLOAD PDF"}
            </button>
          </div>
        </nav>

        {/* ── 3-COLUMN WORKSPACE ── */}
        <div className="db-workspace">

          {/* ════════════════════════════════════════
              COL 1 — USER CHAT HISTORY (dark panel)
          ════════════════════════════════════════ */}
          <div className="panel panel-left">
            <div className="panel-header" style={{background:"#111", borderColor:"#222"}}>
              <div style={{display:"flex", alignItems:"center", gap:8}}>
                <MessageSquare size={15} strokeWidth={3} color="#00E5FF"/>
                <span className="bb" style={{fontSize:18, letterSpacing:".08em", color:"#fff"}}>CHAT HISTORY</span>
              </div>
              <span className="mno" style={{fontSize:10, color:"#555", fontWeight:700, letterSpacing:".1em"}}>
                {CHAT_HISTORY.length} SESSIONS
              </span>
            </div>

            <div className="panel-body" style={{background:"#0a0a0a"}}>
              {/* New session CTA */}
              <div
                style={{borderBottom:"3px solid #1a1a1a", padding:"12px 16px", cursor: isGenerating ? "not-allowed" : "pointer", display:"flex", alignItems:"center", gap:10, background:"#111", opacity: isGenerating ? 0.45 : 1}}
                onClick={isGenerating ? undefined : handleNewChat}
                onMouseEnter={e=>{ if (!isGenerating) e.currentTarget.style.background="#1a1a1a"; }}
                onMouseLeave={e=>e.currentTarget.style.background="#111"}
              >
                <div style={{width:28, height:28, border:"2px solid #00E5FF", display:"flex", alignItems:"center", justifyContent:"center", background:"transparent"}}>
                  <Plus size={14} color="#00E5FF" strokeWidth={3}/>
                </div>
                <span className="mno" style={{fontSize:12, fontWeight:700, color:"#00E5FF", letterSpacing:".08em"}}>
                  NEW SESSION
                </span>
              </div>

              {/* History items */}
              {CHAT_HISTORY.map(ch=>(
                <div
                  key={ch.id}
                  className={`history-item${ch.id===activeChat?" active":""}`}
                  onClick={()=>setActiveChat(ch.id)}
                >
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4}}>
                    <span className="bb" style={{fontSize:16, letterSpacing:".06em", color: ch.id===activeChat?"#00E5FF":"#fff", lineHeight:1}}>
                      {ch.title}
                    </span>
                    <span className="mno" style={{fontSize:10, color:"#444", fontWeight:700}}>{ch.time}</span>
                  </div>
                  <span className="mno" style={{fontSize:11, color:"#555", fontWeight:600}}>{ch.subtitle}</span>
                  {ch.id===activeChat && (
                    <div style={{marginTop:8, display:"flex", gap:6}}>
                      <span className="tag-pill" style={{borderColor:"#00E5FF", color:"#00E5FF"}}>ACTIVE</span>
                    </div>
                  )}
                </div>
              ))}

              {/* Upload CTA */}
              <div style={{padding:"0 12px 16px"}}>
                <div className="upload-prompt" style={{marginTop:16, opacity: isGenerating ? 0.45 : 1, cursor: isGenerating ? "not-allowed" : "pointer"}} onClick={isGenerating ? undefined : triggerFileInput}>
                  <Upload size={22} strokeWidth={2.5} color="#00E5FF"/>
                  <span className="mno" style={{fontSize:11, fontWeight:700, color:"#555", letterSpacing:".08em", lineHeight:1.5}}>
                    DROP A NEW SYLLABUS<br/>TO START A SESSION
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════
              COL 2 — AI RESPONSE / CHAT
          ════════════════════════════════════════ */}
          <div className="panel panel-mid" style={{display:"flex", flexDirection:"column"}}>
            {/* Header */}
            <div className="panel-header" style={{background:"#00E5FF"}}>
              <div style={{display:"flex", alignItems:"center", gap:8}}>
                <Bot size={16} strokeWidth={3}/>
                <span className="bb" style={{fontSize:18, letterSpacing:".08em"}}>AI RESPONSE</span>
              </div>
              <div style={{display:"flex", gap:6}}>
                <span className="tag-pill" style={{borderColor:"#000", color:"#000", background:"rgba(0,0,0,.08)"}}>
                  GPT-4o
                </span>
                <button
                  className="btn"
                  style={{padding:"3px 8px", fontSize:12, border:"2px solid #000", boxShadow:"2px 2px 0 #000"}}
                  onClick={handleNewChat}
                >
                  <RotateCcw size={12} strokeWidth={3}/>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="panel-body" style={{padding:"6px 0"}}>
              {messages.map(msg=>(
                <div key={msg.id} style={{display:"flex", flexDirection:"column", gap:6,
                  alignItems: msg.role==="user" ? "flex-end" : "flex-start",
                  padding:"4px 0"
                }}>
                  {/* Avatar row */}
                  <div style={{display:"flex", alignItems:"center", gap:8,
                    flexDirection: msg.role==="user" ? "row-reverse" : "row",
                    padding: msg.role==="user" ? "0 14px 0 32px" : "0 32px 0 14px"
                  }}>
                    <div className="msg-avatar" style={{
                      background: msg.role==="user" ? "#FFAB00" : "#000",
                      color:       msg.role==="user" ? "#000"    : "#00E5FF",
                    }}>
                      {msg.role==="user" ? <User size={13} strokeWidth={3}/> : <Bot size={13} strokeWidth={3}/>}
                    </div>
                    <span className="mno" style={{fontSize:10, fontWeight:700, color:"#888", letterSpacing:".1em"}}>
                      {msg.role==="user" ? "YOU" : "SKILLBRIDGE AI"}
                    </span>
                  </div>

                  {/* Bubble */}
                  <div
                    className={msg.role==="user" ? "msg-bubble msg-user" : "msg-bubble msg-ai"}
                    style={{margin: msg.role==="user" ? "0 14px 0 40px" : "0 40px 0 14px"}}
                  >
                    <p className="mno" style={{fontSize:13, fontWeight:600, lineHeight:1.7, color:"#000"}}>
                      {msg.text}
                    </p>
                    {msg.role==="ai" && (
                      <div style={{marginTop:10, display:"flex", gap:6, flexWrap:"wrap"}}>
                        {msg.id===3 && ["REACT","NODE.JS","GIT","REST API","DOCKER"].map(t=>(
                          <span key={t} className="tag-pill" style={{borderColor:"#00E5FF", color:"#000", background:"#00E5FF", fontSize:10}}>
                            {t}
                          </span>
                        ))}
                        {msg.id===5 && ["START HERE →","94% JOB MATCH"].map(t=>(
                          <span key={t} className="tag-pill" style={{borderColor:"#000", color:"#000", background:"#FFAB00", fontSize:10}}>
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div style={{padding:"4px 0", alignItems:"flex-start", display:"flex", flexDirection:"column"}}>
                  <div style={{display:"flex", alignItems:"center", gap:8, padding:"0 32px 0 14px"}}>
                    <div className="msg-avatar" style={{background:"#000", color:"#00E5FF"}}>
                      <Bot size={13} strokeWidth={3}/>
                    </div>
                    <span className="mno" style={{fontSize:10, fontWeight:700, color:"#888", letterSpacing:".1em"}}>SKILLBRIDGE AI</span>
                  </div>
                  <div className="msg-bubble msg-ai" style={{margin:"6px 40px 0 14px", display:"flex", gap:5, alignItems:"center", padding:"12px 16px"}}>
                    <span className="tdot"/>
                    <span className="tdot"/>
                    <span className="tdot"/>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef}/>
            </div>

            {/* Prompt bar */}
            <div className="prompt-bar">
              <button
                className="btn"
                style={{padding:10, border:"3px solid #000", background:"#f4f4f0", boxShadow:"3px 3px 0 #000", flexShrink:0}}
                onClick={triggerFileInput}
              >
                <Paperclip size={16} strokeWidth={3}/>
              </button>

              <textarea
                ref={textareaRef}
                className="prompt-textarea"
                placeholder="Ask about your skills, career paths, or upload a syllabus..."
                value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={handleKey}
                rows={1}
                style={{flexGrow:1}}
              />

              <button
                className="btn"
                style={{
                  padding:"10px 18px",
                  background: input.trim() ? "#00E5FF" : "#f4f4f0",
                  boxShadow:"4px 4px 0 #000",
                  fontSize:15,
                  flexShrink:0,
                  opacity: input.trim() ? 1 : 0.5,
                }}
                onClick={handleSend}
              >
                <Send size={16} strokeWidth={3}/>
                SEND
              </button>
            </div>
          </div>

          {/* ════════════════════════════════════════
              COL 3 — TREE DIAGRAM (React Flow)
          ════════════════════════════════════════ */}
          <ReactFlowProvider>
            <SkillTreePanel
              selectedNode={selectedNode}
              setSelectedNode={setSelectedNode}
              onTreeUpdate={handleTreeUpdate}
            />
          </ReactFlowProvider>

        </div>
      </div>
    </>
  );
}