import { useState, useRef, useEffect, useCallback } from "react";
import {
  Zap, Send, Upload, Plus, Trash2, ChevronRight,
  MessageSquare, Bot, User, Paperclip, RotateCcw,
  ZoomIn, ZoomOut, Maximize2, Download
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
    padding: 8px 14px;
    font-family: 'Bebas Neue', cursive;
    letter-spacing: .08em;
    white-space: nowrap;
    cursor: pointer;
    transition: transform .1s, box-shadow .1s;
    box-shadow: 4px 4px 0 0 #000;
    user-select: none;
    display: flex;
    align-items: center;
    justify-content: center;
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
const NODE_SIZES = { root:{w:200,h:38}, domain:{w:148,h:32}, skill:{w:120,h:28}, leaf:{w:90,h:28} };

const TREE_NODE_DATA = [
  { id:"root",  label:"CS101 SYLLABUS", x:310, y:30,  color:"#FFAB00", type:"root" },
  { id:"d1", label:"PROGRAMMING",    x:80,  y:130, color:"#00E5FF",  type:"domain" },
  { id:"d2", label:"DATA STRUCTURES",x:270, y:130, color:"#FF6B9D",  type:"domain" },
  { id:"d3", label:"ALGORITHMS",     x:460, y:130, color:"#00E5FF",  type:"domain" },
  { id:"d4", label:"SYSTEM DESIGN",  x:620, y:130, color:"#c8ff00",  type:"domain" },
  { id:"s1", label:"JAVASCRIPT",  x:20,  y:250, color:"#fff", type:"skill" },
  { id:"s2", label:"GIT",         x:140, y:250, color:"#fff", type:"skill" },
  { id:"s3", label:"ARRAYS",      x:230, y:250, color:"#fff", type:"skill" },
  { id:"s4", label:"LINKED LIST", x:320, y:250, color:"#fff", type:"skill" },
  { id:"s5", label:"SORTING",     x:410, y:250, color:"#fff", type:"skill" },
  { id:"s6", label:"BIG-O",       x:510, y:250, color:"#fff", type:"skill" },
  { id:"s7", label:"REST APIs",   x:590, y:250, color:"#fff", type:"skill" },
  { id:"s8", label:"DOCKER",      x:680, y:250, color:"#fff", type:"skill" },
  { id:"l1", label:"REACT",    x:20,  y:360, color:"#FFAB00", type:"leaf" },
  { id:"l2", label:"NODE.JS",  x:110, y:360, color:"#FFAB00", type:"leaf" },
  { id:"l3", label:"SQL",      x:260, y:360, color:"#FF6B9D", type:"leaf" },
  { id:"l4", label:"GRAPHS",   x:360, y:360, color:"#00E5FF", type:"leaf" },
  { id:"l5", label:"AWS",      x:620, y:360, color:"#c8ff00", type:"leaf" },
];

const TREE_EDGES_DATA = [
  ["root","d1"],["root","d2"],["root","d3"],["root","d4"],
  ["d1","s1"],["d1","s2"],
  ["d2","s3"],["d2","s4"],
  ["d3","s5"],["d3","s6"],
  ["d4","s7"],["d4","s8"],
  ["s1","l1"],["s2","l2"],["s3","l3"],["s5","l4"],["s8","l5"],
];

/* ─── Convert to React Flow format ─────────────────────────────────────────── */
const RF_NODES = TREE_NODE_DATA.map(n => {
  const sz = NODE_SIZES[n.type];
  return {
    id: n.id,
    type: "neobrutalist",
    position: { x: n.x, y: n.y },
    data: {
      label: n.label,
      color: n.color,
      nodeType: n.type,
      width: sz.w,
      height: sz.h,
    },
    style: { width: sz.w, height: sz.h },
  };
});

const RF_EDGES = TREE_EDGES_DATA.map(([source, target], i) => ({
  id: `e-${source}-${target}`,
  source,
  target,
  type: "smoothstep",
  style: { stroke: "#000", strokeWidth: 3 },
}));

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
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#c8c8c4" gap={40} size={1} />
          <Controls position="bottom-right" showInteractive={false} />
        </ReactFlow>

        {/* Selected node tooltip */}
        {selectedNodeData && (
          <div style={{
            position:"absolute", bottom:60, left:16,
            border:"3px solid #000", background:"#fff", padding:"10px 14px",
            boxShadow:"5px 5px 0 0 #000", maxWidth:220, zIndex:10,
            pointerEvents: "none",
          }}>
            <div className="bb" style={{fontSize:18, marginBottom:4}}>{selectedNodeData.label}</div>
            <p className="mno" style={{fontSize:11, fontWeight:600, color:"#555", lineHeight:1.5}}>
              {selectedNodeData.nodeType==="root"   && "Your uploaded syllabus. All skills branch from here."}
              {selectedNodeData.nodeType==="domain" && "A major skill domain extracted from your syllabus."}
              {selectedNodeData.nodeType==="skill"  && "A specific skill you need to learn in this domain."}
              {selectedNodeData.nodeType==="leaf"   && "Advanced skill unlocked after mastering prerequisites."}
            </p>
            <div style={{marginTop:8, display:"flex", gap:6}}>
              <span className="tag-pill" style={{borderColor:"#000", background: selectedNodeData.color, color:"#000", fontSize:10}}>
                {(selectedNodeData.nodeType ?? "node").toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* Hint */}
        <div style={{position:"absolute", top:12, left:12, zIndex:5, pointerEvents:"none"}}>
          <span className="mno" style={{fontSize:10, fontWeight:700, color:"#aaa", letterSpacing:".1em"}}>
            DRAG TO PAN · SCROLL TO ZOOM · CLICK NODE FOR INFO
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

        // Map API nodes → React Flow node objects preserving Neobrutalist data shape
        const rfNodes = (data.nodes ?? []).map(n => {
          const sz = NODE_SIZES[n.type] ?? NODE_SIZES.skill;
          return {
            id: String(n.id),
            type: "neobrutalist",
            position: { x: n.x ?? 0, y: n.y ?? 0 },
            data: {
              label:    n.label ?? n.id,
              color:    n.color ?? "#fff",
              nodeType: n.type  ?? "skill",
              width:    sz.w,
              height:   sz.h,
            },
            style: { width: sz.w, height: sz.h },
          };
        });

        // Map API edges → React Flow edge objects
        const rfEdges = (data.edges ?? []).map((edge, i) => ({
          id:     edge.id ?? `e-${edge.source}-${edge.target}-${i}`,
          source: String(edge.source),
          target: String(edge.target),
          type:   "smoothstep",
          style:  { stroke: "#000", strokeWidth: 3 },
        }));

        setNodes(rfNodes);
        setEdges(rfEdges);

        // Re-fit the viewport after a tick to let React Flow measure the new nodes
        setTimeout(() => fitView({ duration: 500, padding: 0.2 }), 50);
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