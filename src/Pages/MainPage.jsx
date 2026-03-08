import { useState, useRef, useEffect } from "react";
import {
  Zap, Send, Upload, Plus, Trash2, ChevronRight,
  MessageSquare, Bot, User, Paperclip, RotateCcw,
  ZoomIn, ZoomOut, Maximize2, Download
} from "lucide-react";

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
    cursor: grab;
  }
  .tree-canvas:active { cursor: grabbing; }

  /* node styles */
  .tree-node {
    position: absolute;
    border: 3px solid #000;
    padding: 8px 14px;
    font-family: 'Bebas Neue', cursive;
    font-size: 14px;
    letter-spacing: .08em;
    white-space: nowrap;
    cursor: pointer;
    transition: transform .1s, box-shadow .1s;
    box-shadow: 4px 4px 0 0 #000;
    user-select: none;
  }
  .tree-node:hover { transform: translate(-2px,-2px); box-shadow: 6px 6px 0 0 #000; }
  .tree-node.root  { font-size: 17px; letter-spacing: .1em; }

  /* zoom controls */
  .zoom-controls {
    position: absolute;
    bottom: 16px;
    right: 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
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

  /* SVG connector lines */
  .connector-svg {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none;
    overflow: visible;
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

const INIT_MESSAGES = [
  { id:1, role:"ai",   text:"Hey! Upload your syllabus PDF and I'll extract a skill roadmap for you. Drop it below or paste the course outline directly." },
  { id:2, role:"user", text:"Here's my CS101 syllabus. Can you extract the key skills I need to learn?" },
  { id:3, role:"ai",   text:"Analysed your syllabus. Found 12 real-world skills across 4 domains: Programming Fundamentals, Data Structures, Algorithms, and System Design. Generating your skill tree now →" },
  { id:4, role:"user", text:"Which skill should I learn first if I want to get a job fast?" },
  { id:5, role:"ai",   text:"Start with Git + JavaScript fundamentals — they unlock the most adjacent skills and appear in 94% of entry-level job listings. From there: React → Node.js → REST APIs is your fastest path to hireable." },
];

/* ─── Tree layout ──────────────────────────────────────────────────────────── */
const TREE_NODES = [
  { id:"root",  label:"CS101 SYLLABUS", x:310, y:30,  color:"#FFAB00", type:"root" },
  // domain nodes
  { id:"d1", label:"PROGRAMMING",   x:80,  y:130, color:"#00E5FF",  type:"domain" },
  { id:"d2", label:"DATA STRUCTURES",x:270, y:130, color:"#FF6B9D",  type:"domain" },
  { id:"d3", label:"ALGORITHMS",    x:460, y:130, color:"#00E5FF",  type:"domain" },
  { id:"d4", label:"SYSTEM DESIGN", x:620, y:130, color:"#c8ff00",  type:"domain" },
  // skill nodes
  { id:"s1", label:"JAVASCRIPT",  x:20,  y:250, color:"#fff", type:"skill" },
  { id:"s2", label:"GIT",         x:140, y:250, color:"#fff", type:"skill" },
  { id:"s3", label:"ARRAYS",      x:230, y:250, color:"#fff", type:"skill" },
  { id:"s4", label:"LINKED LIST", x:320, y:250, color:"#fff", type:"skill" },
  { id:"s5", label:"SORTING",     x:410, y:250, color:"#fff", type:"skill" },
  { id:"s6", label:"BIG-O",       x:510, y:250, color:"#fff", type:"skill" },
  { id:"s7", label:"REST APIs",   x:590, y:250, color:"#fff", type:"skill" },
  { id:"s8", label:"DOCKER",      x:680, y:250, color:"#fff", type:"skill" },
  // leaf nodes
  { id:"l1", label:"REACT",    x:20,  y:360, color:"#FFAB00", type:"leaf" },
  { id:"l2", label:"NODE.JS",  x:110, y:360, color:"#FFAB00", type:"leaf" },
  { id:"l3", label:"SQL",      x:260, y:360, color:"#FF6B9D", type:"leaf" },
  { id:"l4", label:"GRAPHS",   x:360, y:360, color:"#00E5FF", type:"leaf" },
  { id:"l5", label:"AWS",      x:620, y:360, color:"#c8ff00", type:"leaf" },
];

const TREE_EDGES = [
  ["root","d1"],["root","d2"],["root","d3"],["root","d4"],
  ["d1","s1"],["d1","s2"],
  ["d2","s3"],["d2","s4"],
  ["d3","s5"],["d3","s6"],
  ["d4","s7"],["d4","s8"],
  ["s1","l1"],["s2","l2"],["s3","l3"],["s5","l4"],["s8","l5"],
];

const NODE_SIZES = { root:{w:200,h:38}, domain:{w:148,h:32}, skill:{w:120,h:28}, leaf:{w:90,h:28} };

/* ─── SVG edges ────────────────────────────────────────────────────────────── */
function TreeEdges({ nodes, edges, scale, pan }) {
  return (
    <svg className="connector-svg">
      <g transform={`translate(${pan.x},${pan.y}) scale(${scale})`}>
        {edges.map(([aId,bId],i)=>{
          const a = nodes.find(n=>n.id===aId);
          const b = nodes.find(n=>n.id===bId);
          const as = NODE_SIZES[a.type]; const bs = NODE_SIZES[b.type];
          const ax = a.x + as.w/2, ay = a.y + as.h;
          const bx = b.x + bs.w/2, by = b.y;
          const my = (ay+by)/2;
          return (
            <path
              key={i}
              d={`M${ax},${ay} C${ax},${my} ${bx},${my} ${bx},${by}`}
              fill="none"
              stroke="#000"
              strokeWidth="2"
              strokeDasharray="5,3"
            />
          );
        })}
      </g>
    </svg>
  );
}

/* ─── Main ─────────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const [messages, setMessages]       = useState(INIT_MESSAGES);
  const [input, setInput]             = useState("");
  const [isTyping, setIsTyping]       = useState(false);
  const [activeChat, setActiveChat]   = useState(1);
  const [scale, setScale]             = useState(0.82);
  const [pan, setPan]                 = useState({ x: 10, y: 20 });
  const [dragging, setDragging]       = useState(false);
  const [dragStart, setDragStart]     = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const messagesEndRef                = useRef(null);
  const textareaRef                   = useRef(null);
  const canvasRef                     = useRef(null);

  useEffect(()=>{
    messagesEndRef.current?.scrollIntoView({ behavior:"smooth" });
  },[messages, isTyping]);

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

  // canvas pan
  function onMouseDown(e) {
    if (e.target.closest(".tree-node")) return;
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }
  function onMouseMove(e) {
    if (!dragging || !dragStart) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }
  function onMouseUp() { setDragging(false); setDragStart(null); }

  function onWheel(e) {
    e.preventDefault();
    setScale(s => Math.min(2, Math.max(0.3, s - e.deltaY * 0.001)));
  }

  useEffect(()=>{
    const el = canvasRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive:false });
    return ()=>el.removeEventListener("wheel", onWheel);
  },[]);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: STYLES}}/>
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
              SESSION ACTIVE — CS101 SYLLABUS
            </span>
          </div>

          {/* Right actions */}
          <div style={{display:"flex", gap:10}}>
            <button className="btn" style={{fontSize:14, padding:"6px 14px", background:"#f4f4f0", boxShadow:"3px 3px 0 #000"}}>
              <Plus size={14} strokeWidth={3}/> NEW CHAT
            </button>
            <button className="btn" style={{fontSize:14, padding:"6px 14px", background:"#FFAB00", boxShadow:"3px 3px 0 #000"}}>
              <Upload size={14} strokeWidth={3}/> UPLOAD PDF
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
              {/* New chat CTA */}
              <div
                style={{borderBottom:"3px solid #1a1a1a", padding:"12px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:10, background:"#111"}}
                onMouseEnter={e=>e.currentTarget.style.background="#1a1a1a"}
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
                <div className="upload-prompt" style={{marginTop:16}}>
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
                <button className="btn" style={{padding:"3px 8px", fontSize:12, border:"2px solid #000", boxShadow:"2px 2px 0 #000"}}>
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
              <button className="btn" style={{padding:10, border:"3px solid #000", background:"#f4f4f0", boxShadow:"3px 3px 0 #000", flexShrink:0}}>
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
              COL 3 — TREE DIAGRAM
          ════════════════════════════════════════ */}
          <div className="panel panel-right" style={{display:"flex", flexDirection:"column"}}>
            {/* Tree toolbar */}
            <div className="tree-toolbar">
              <div style={{display:"flex", alignItems:"center", gap:8}}>
                <div style={{width:10, height:10, background:"#000", border:"2px solid #000"}}/>
                <span className="bb" style={{fontSize:18, letterSpacing:".08em"}}>SKILL TREE</span>
                <span className="tag-pill" style={{borderColor:"#000", background:"rgba(0,0,0,.1)", color:"#000"}}>
                  {TREE_NODES.length} NODES
                </span>
              </div>
              <div style={{display:"flex", gap:6}}>
                <button className="btn" style={{padding:"4px 10px", fontSize:12, border:"2px solid #000", boxShadow:"2px 2px 0 #000", background:"#fff"}}>
                  <Download size={13} strokeWidth={3}/> EXPORT
                </button>
                <button className="btn" style={{padding:"4px 10px", fontSize:12, border:"2px solid #000", boxShadow:"2px 2px 0 #000", background:"#fff"}}>
                  <Maximize2 size={13} strokeWidth={3}/>
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div
              className="tree-canvas"
              ref={canvasRef}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            >
              {/* SVG edges */}
              <TreeEdges nodes={TREE_NODES} edges={TREE_EDGES} scale={scale} pan={pan}/>

              {/* Nodes */}
              <div style={{
                position:"absolute", top:0, left:0,
                transform:`translate(${pan.x}px,${pan.y}px) scale(${scale})`,
                transformOrigin:"0 0",
              }}>
                {TREE_NODES.map(n=>{
                  const sz = NODE_SIZES[n.type];
                  const isSelected = selectedNode===n.id;
                  return (
                    <div
                      key={n.id}
                      className={`tree-node${n.type==="root"?" root":""}`}
                      style={{
                        left:n.x, top:n.y,
                        width:sz.w, height:sz.h,
                        background: n.color,
                        border: isSelected ? "3px solid #FF6B9D" : "3px solid #000",
                        boxShadow: isSelected ? "5px 5px 0 0 #FF6B9D" : "4px 4px 0 0 #000",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize: n.type==="root" ? 15 : n.type==="domain" ? 13 : 11,
                      }}
                      onClick={()=>setSelectedNode(id=>id===n.id?null:n.id)}
                    >
                      {n.label}
                    </div>
                  );
                })}
              </div>

              {/* Selected node tooltip */}
              {selectedNode && (()=>{
                const n = TREE_NODES.find(x=>x.id===selectedNode);
                return (
                  <div style={{
                    position:"absolute", bottom:60, left:16,
                    border:"3px solid #000", background:"#fff", padding:"10px 14px",
                    boxShadow:"5px 5px 0 0 #000", maxWidth:220, zIndex:10,
                  }}>
                    <div className="bb" style={{fontSize:18, marginBottom:4}}>{n.label}</div>
                    <p className="mno" style={{fontSize:11, fontWeight:600, color:"#555", lineHeight:1.5}}>
                      {n.type==="root" && "Your uploaded syllabus. All skills branch from here."}
                      {n.type==="domain" && "A major skill domain extracted from your syllabus."}
                      {n.type==="skill" && "A specific skill you need to learn in this domain."}
                      {n.type==="leaf" && "Advanced skill unlocked after mastering prerequisites."}
                    </p>
                    <div style={{marginTop:8, display:"flex", gap:6}}>
                      <span className="tag-pill" style={{borderColor:"#000", background: n.color, color:"#000", fontSize:10}}>
                        {n.type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Zoom controls */}
              <div className="zoom-controls">
                <button
                  className="btn"
                  style={{padding:8, background:"#fff", border:"3px solid #000", boxShadow:"3px 3px 0 #000"}}
                  onClick={()=>setScale(s=>Math.min(2,+(s+.15).toFixed(2)))}
                >
                  <ZoomIn size={15} strokeWidth={3}/>
                </button>
                <div style={{border:"3px solid #000", background:"#FFAB00", padding:"4px 8px", textAlign:"center"}}>
                  <span className="bb" style={{fontSize:14}}>{Math.round(scale*100)}%</span>
                </div>
                <button
                  className="btn"
                  style={{padding:8, background:"#fff", border:"3px solid #000", boxShadow:"3px 3px 0 #000"}}
                  onClick={()=>setScale(s=>Math.max(0.3,+(s-.15).toFixed(2)))}
                >
                  <ZoomOut size={15} strokeWidth={3}/>
                </button>
                <button
                  className="btn"
                  style={{padding:8, background:"#fff", border:"3px solid #000", boxShadow:"3px 3px 0 #000"}}
                  onClick={()=>{ setScale(0.82); setPan({x:10,y:20}); }}
                >
                  <RotateCcw size={13} strokeWidth={3}/>
                </button>
              </div>

              {/* Drag hint */}
              <div style={{position:"absolute", top:12, left:12}}>
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

        </div>
      </div>
    </>
  );
}