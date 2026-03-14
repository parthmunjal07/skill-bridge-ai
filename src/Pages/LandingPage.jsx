import { useState, useEffect } from "react";
import {
  Upload, ArrowRight, Zap, Target, TrendingUp,
  MousePointer, FileText, Brain, Map, ChevronRight,
  Github, Twitter,
} from "lucide-react";

/* ─── Injected styles ──────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@400;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html, body { overflow-x: hidden; }

  .sb-root {
    font-family: 'IBM Plex Mono', monospace;
    background-color: #f4f4f0;
    background-image:
      linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px);
    background-size: 40px 40px;
    min-height: 100vh;
    overflow-x: hidden;
  }

  .bb  { font-family: 'Bebas Neue', cursive; }
  .mno { font-family: 'IBM Plex Mono', monospace; }

  /* Button press */
  .btn {
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    border: 4px solid #000;
    font-family: 'Bebas Neue', cursive;
    letter-spacing: .1em;
    transition: transform .08s ease, box-shadow .08s ease;
    white-space: nowrap;
  }
  .btn:hover  { transform: translate(4px,4px);  box-shadow: 0 0 0 0 #000 !important; }
  .btn:active { transform: translate(6px,6px);  box-shadow: 0 0 0 0 #000 !important; }

  /* Card hover */
  .card {
    border: 4px solid #000;
    transition: transform .1s ease, box-shadow .1s ease;
    box-shadow: 8px 8px 0 0 #000;
  }
  .card:hover { transform: translate(-4px,-4px); box-shadow: 12px 12px 0 0 #000; }

  /* Marquee */
  @keyframes marquee { from { transform:translateX(0) } to { transform:translateX(-50%) } }
  .mq-track { display:flex; width:max-content; animation:marquee 18s linear infinite; }
  .mq-wrap  { overflow:hidden; border-top:4px solid #000; border-bottom:4px solid #000; background:#FFAB00; padding:10px 0; }

  /* Node pulse */
  @keyframes npulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.55;transform:scale(1.14)} }
  .npulse { animation: npulse 2s ease-in-out infinite; }

  /* Blink */
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  .blink { animation: blink 1s step-end infinite; }

  /* Nav */
  .sb-nav {
    position: sticky; top:0; z-index:50;
    background:#f4f4f0;
    border-bottom: 4px solid #000;
    padding: 14px 24px;
    display:flex; align-items:center; justify-content:space-between;
  }

  /* Section constraint */
  .wrap { max-width:1280px; margin:0 auto; padding:0 24px; }

  /* Hero grid */
  .hero-grid {
    display:grid;
    grid-template-columns: 1fr;
    gap:40px;
    padding: 64px 24px 48px;
    max-width:1280px;
    margin:0 auto;
    align-items:center;
  }
  @media(min-width:1024px){ .hero-grid { grid-template-columns:1fr 1fr; } }

  /* Problem grid */
  .prob-grid {
    display:grid;
    grid-template-columns:1fr;
    gap:24px;
  }
  @media(min-width:768px){ .prob-grid { grid-template-columns:repeat(3,1fr); } }

  /* Steps row */
  .steps-row {
    display:flex;
    flex-direction:column;
  }
  @media(min-width:1024px){ .steps-row { flex-direction:row; align-items:stretch; } }

  .step-unit {
    display:flex;
    flex-direction:column;
    flex:1;
  }
  @media(min-width:1024px){ .step-unit { flex-direction:row; align-items:stretch; } }

  /* Stats row */
  .stats-row { display:flex; gap:20px; flex-wrap:wrap; margin-top:36px; }

  /* Pills */
  .tech-pills { display:flex; flex-wrap:wrap; gap:12px; margin-top:40px; }

  /* Footer flex */
  .foot-inner {
    display:flex; flex-direction:column; align-items:center;
    gap:16px; padding:28px 24px;
    max-width:1280px; margin:0 auto;
  }
  @media(min-width:768px){ .foot-inner { flex-direction:row; justify-content:space-between; } }

  /* Upload zone */
  .dz {
    border: 4px dashed #000;
    padding: 64px 32px;
    cursor:pointer;
    max-width:640px;
    margin:0 auto;
    box-shadow: 10px 10px 0 0 #000;
    display:flex; flex-direction:column; align-items:center; gap:16px;
    background: rgba(255,255,255,.6);
    transition: background .15s;
  }
  .dz.drag { background: rgba(0,229,255,.15); }

  /* Nav links */
  .nav-links { display:none; gap:32px; }
  @media(min-width:768px){ .nav-links { display:flex; align-items:center; } }
`;

/* ─── Node Graph ───────────────────────────────────────────────────────────── */
const NODES = [
  { id:"root", label:"SYLLABUS", x:50, y:42, color:"#FFAB00" },
  { id:"n1",   label:"REACT",   x:18, y:68, color:"#00E5FF" },
  { id:"n2",   label:"NODE.JS", x:50, y:72, color:"#FF6B9D" },
  { id:"n3",   label:"SQL",     x:82, y:68, color:"#00E5FF" },
  { id:"n4",   label:"GIT",     x:8,  y:50, color:"#c8ff00" },
  { id:"n5",   label:"REST API",x:90, y:50, color:"#c8ff00" },
  { id:"n6",   label:"DOCKER",  x:33, y:88, color:"#FFAB00" },
  { id:"n7",   label:"AWS",     x:67, y:88, color:"#FF6B9D" },
];
const EDGES = [
  ["root","n1"],["root","n2"],["root","n3"],
  ["n1","n4"],["n3","n5"],["n2","n6"],["n2","n7"],
];

function NodeGraph() {
  return (
    <div style={{ position:"relative", width:"100%", paddingBottom:"56%", background:"#0a0a0a" }}>
      <svg
        style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
      >
        {Array.from({length:11}).map((_,i)=>(
          <line key={`h${i}`} x1="0" y1={i*10} x2="100" y2={i*10} stroke="#1c1c1c" strokeWidth="0.4"/>
        ))}
        {Array.from({length:11}).map((_,i)=>(
          <line key={`v${i}`} x1={i*10} y1="0" x2={i*10} y2="100" stroke="#1c1c1c" strokeWidth="0.4"/>
        ))}
        {EDGES.map(([a,b],i)=>{
          const na=NODES.find(n=>n.id===a), nb=NODES.find(n=>n.id===b);
          return <line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke="#2e2e2e" strokeWidth="0.9" strokeDasharray="2,1.2"/>;
        })}
        {NODES.map((n,i)=>(
          <g key={n.id} className="npulse" style={{animationDelay:`${i*0.28}s`}}>
            <rect x={n.x-7.5} y={n.y-4.5} width="15" height="9" fill={n.color} stroke="#000" strokeWidth="0.9"/>
            <text x={n.x} y={n.y+1.8} textAnchor="middle" fontSize="2.7"
              fontFamily="IBM Plex Mono" fontWeight="700" fill="#000">{n.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ─── Marquee ──────────────────────────────────────────────────────────────── */
const MQ_ITEMS = ["UPLOAD PDF","GET ROADMAP","SKILL UP","GET HIRED","BUILD REAL STUFF","NO MORE THEORY","TECH TREE UNLOCKED"];
function Marquee() {
  const all = [...MQ_ITEMS, ...MQ_ITEMS];
  return (
    <div className="mq-wrap">
      <div className="mq-track">
        {all.map((t,i)=>(
          <span key={i} className="bb" style={{fontSize:22,color:"#000",padding:"0 28px",letterSpacing:".12em"}}>
            {t} <span style={{opacity:.35}}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Main ─────────────────────────────────────────────────────────────────── */
export default function LandingPage({ onLoginClick, onStartClick }) {
  const [dragging, setDragging] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(()=>{
    const t = setInterval(()=>setTick(p=>p+1), 1400);
    return ()=>clearInterval(t);
  },[]);

  const HEADLINES = [
    "COLLEGE SYLLABI ARE DEAD.",
    "STOP MEMORISING. START BUILDING.",
    "YOUR DEGREE IS USELESS.",
  ];
  const headline = HEADLINES[tick % HEADLINES.length];

  const PROBLEMS = [
    { bg:"#00E5FF", icon:<FileText size={34} strokeWidth={3}/>, title:"THEORY SUCKS.",     tag:"PROBLEM 01",
      body:"You spent 4 years learning abstract concepts that evaporate the second you close the textbook. Your CS degree taught you bubble sort. Not how to ship." },
    { bg:"#FFAB00", icon:<TrendingUp size={34} strokeWidth={3}/>, title:"STACKS > GRADES.", tag:"PROBLEM 02",
      body:"Recruiters don't care about your GPA. They want React or Vue, Docker or K8s, REST or GraphQL. Your transcript says absolutely nothing." },
    { bg:"#FF6B9D", icon:<Target size={34} strokeWidth={3}/>, title:"GET HIRED.",          tag:"PROBLEM 03",
      body:"The gap between academia and industry is a canyon. SkillBridge maps the exact skills hiding in your syllabus and builds your path to a job offer." },
  ];

  const STEPS = [
    { step:"01", icon:<Upload size={38} strokeWidth={2.5}/>,  title:"DUMP PDF.",     color:"#FFAB00",
      desc:"Drop your course syllabus, reading list, or curriculum doc. Any format, any subject. We handle the mess." },
    { step:"02", icon:<Brain size={38} strokeWidth={2.5}/>,   title:"AI PARSES.",    color:"#00E5FF",
      desc:"Our LLM pipeline rips through jargon, extracts real-world skills, clusters them into domains, and maps dependencies." },
    { step:"03", icon:<Map size={38} strokeWidth={2.5}/>,     title:"GET ROADMAP.",  color:"#FF6B9D",
      desc:"Your interactive skill tree — with resources, project ideas, and a hiring timeline. No fluff. Zero theory." },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: STYLES}}/>
      <div className="sb-root">

        {/* ── NAV ── */}
        <nav className="sb-nav">
          <div style={{display:"flex", alignItems:"center", gap:12}}>
            <div className="btn" style={{padding:8, background:"#00E5FF", boxShadow:"4px 4px 0 #000"}}>
              <Zap size={20} strokeWidth={3}/>
            </div>
            <span className="bb" style={{fontSize:28, letterSpacing:".06em", lineHeight:1}}>
              SKILL<span style={{color:"#00E5FF", WebkitTextStroke:"1px #000"}}>BRIDGE</span>
              <span className="mno" style={{fontSize:13, fontWeight:700, background:"#000", color:"#fff", padding:"1px 5px", marginLeft:8}}>AI</span>
            </span>
          </div>

          <div className="nav-links">
            {["HOW IT WORKS","FEATURES","DOCS"].map(l=>(
              <a key={l} href="#" className="mno" style={{fontWeight:700, fontSize:13, letterSpacing:".12em", textDecoration:"none", color:"#000"}}>
                {l}
              </a>
            ))}
          </div>

          <button className="btn" style={{fontSize:20, padding:"8px 22px", background:"#FFAB00", boxShadow:"6px 6px 0 #000"}} onClick={onLoginClick}>
            LOGIN
          </button>
        </nav>

        {/* ── HERO ── */}
        <div className="hero-grid">
          {/* Left col */}
          <div>

            <h1 className="bb" style={{fontSize:"clamp(48px,6.5vw,88px)", lineHeight:.95, letterSpacing:".02em", color:"#000", marginBottom:8}}>
              {headline}<span className="blink" style={{color:"#00E5FF"}}>_</span>
            </h1>

            <p className="mno" style={{fontSize:16, fontWeight:600, lineHeight:1.7, borderLeft:"4px solid #000", paddingLeft:16, marginTop:24, marginBottom:28, maxWidth:460}}>
              Turn your boring academic PDFs into{" "}
              <span style={{background:"#FFAB00", padding:"0 4px"}}>interactive, playable tech trees</span>{" "}
              for the real world. AI-powered. Zero fluff.
            </p>

            <div style={{display:"flex", gap:16, flexWrap:"wrap"}}>
              <button className="btn" style={{fontSize:22, padding:"14px 28px", background:"#00E5FF", boxShadow:"8px 8px 0 #000"}} onClick={onStartClick}>
                <MousePointer size={20} strokeWidth={3}/>
                UPLOAD SYLLABUS NOW
              </button>
              <button className="btn" style={{fontSize:22, padding:"14px 22px", background:"#f4f4f0", boxShadow:"8px 8px 0 #000"}} onClick={onStartClick}>
                SEE DEMO <ArrowRight size={18} strokeWidth={3}/>
              </button>
            </div>

            <div className="stats-row">
              {[["2,400+","SYLLABI PARSED"],["98%","SKILL ACCURACY"],["3 MIN","TO ROADMAP"]].map(([val,lbl])=>(
                <div key={lbl} style={{border:"4px solid #000", background:"#fff", padding:"8px 16px"}}>
                  <div className="bb" style={{fontSize:32, lineHeight:1}}>{val}</div>
                  <div className="mno" style={{fontSize:11, fontWeight:700, letterSpacing:".12em", color:"#555"}}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right col — mock window */}
          <div style={{border:"4px solid #000", boxShadow:"12px 12px 0 #000"}}>
            <div style={{borderBottom:"4px solid #000", background:"#FFAB00", padding:"8px 14px", display:"flex", alignItems:"center", gap:8}}>
              {["#ff5f57","#ffbd2e","#28c840"].map(c=>(
                <div key={c} style={{width:12, height:12, borderRadius:"50%", border:"2px solid #000", background:c}}/>
              ))}
              <span className="mno" style={{fontSize:11, fontWeight:700, letterSpacing:".1em", marginLeft:8}}>
                SKILLBRIDGE — ROADMAP_VIEWER.app
              </span>
            </div>
            <NodeGraph/>
            <div style={{borderTop:"4px solid #000", background:"#0a0a0a", padding:"6px 14px", display:"flex", alignItems:"center", gap:8}}>
              <span className="mno" style={{color:"#00E5FF", fontSize:11, fontWeight:700}}>▶</span>
              <span className="mno" style={{color:"#555", fontSize:11}}>
                8 skills extracted · 3 career paths detected · <span style={{color:"#00E5FF"}}>READY</span>
              </span>
            </div>
          </div>
        </div>

        {/* ── MARQUEE ── */}
        <Marquee/>

        {/* ── PROBLEM ── */}
        <section style={{padding:"80px 0"}}>
          <div className="wrap">
            <div style={{marginBottom:48}}>
              <h2 className="bb" style={{fontSize:"clamp(38px,5vw,64px)", lineHeight:.95, letterSpacing:".02em"}}>
                THE <span style={{background:"#000", color:"#00E5FF", padding:"0 8px"}}>PROBLEM</span> IS OBVIOUS.
              </h2>
              <p className="mno" style={{fontWeight:600, fontSize:15, marginTop:12, color:"#555"}}>
                Everyone knows it. Nobody fixes it. Until now.
              </p>
            </div>

            <div className="prob-grid">
              {PROBLEMS.map(card=>(
                <div key={card.title} className="card" style={{background:card.bg, padding:32}}>
                  <div style={{border:"2px solid #000", background:"#fff", display:"inline-block", padding:"3px 10px", marginBottom:16}}>
                    <span className="mno" style={{fontSize:11, fontWeight:700, letterSpacing:".14em"}}>{card.tag}</span>
                  </div>
                  <div style={{marginBottom:14}}>{card.icon}</div>
                  <h3 className="bb" style={{fontSize:46, lineHeight:.95, marginBottom:14}}>{card.title}</h3>
                  <p className="mno" style={{fontSize:13, fontWeight:600, lineHeight:1.7}}>{card.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section style={{borderTop:"4px solid #000", borderBottom:"4px solid #000", background:"#000", padding:"80px 0"}}>
          <div className="wrap">
            <h2 className="bb" style={{fontSize:"clamp(38px,5vw,64px)", color:"#fff", letterSpacing:".02em", marginBottom:52}}>
              HOW IT <span style={{color:"#00E5FF"}}>WORKS.</span>
            </h2>

            <div className="steps-row">
              {STEPS.map((s,i)=>(
                <div key={s.step} className="step-unit">
                  <div style={{flex:1, border:"4px solid #000", background:s.color, padding:32}}>
                    <div className="bb" style={{fontSize:80, lineHeight:.85, color:"#000", opacity:.18, marginBottom:4}}>{s.step}</div>
                    <div style={{marginBottom:14, color:"#000"}}>{s.icon}</div>
                    <h3 className="bb" style={{fontSize:44, color:"#000", lineHeight:.95, marginBottom:12}}>{s.title}</h3>
                    <p className="mno" style={{fontSize:13, fontWeight:600, lineHeight:1.7, color:"#000"}}>{s.desc}</p>
                  </div>
                  {i < STEPS.length-1 && (
                    <div style={{display:"flex", alignItems:"center", justifyContent:"center", padding:"12px 4px", flexShrink:0}}>
                      <div style={{border:"4px solid #00E5FF", background:"#000", padding:10}}>
                        <ChevronRight size={26} strokeWidth={3} color="#00E5FF"/>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="tech-pills">
              {["GPT-4o","PDF.js","D3 FORCE GRAPH","NEXT.JS 14","POSTGRES","VECTOR DB"].map(t=>(
                <div key={t} className="mno" style={{border:"2px solid #2a2a2a", color:"#888", fontSize:11, fontWeight:700, padding:"4px 12px", letterSpacing:".12em"}}>
                  {t}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOTER CTA ── */}
        <div style={{background:"#00E5FF", borderBottom:"4px solid #000", padding:"80px 24px", textAlign:"center"}}>
          <h2 className="bb" style={{fontSize:"clamp(52px,9vw,112px)", lineHeight:.9, color:"#000", marginBottom:16}}>
            READY TO BUILD?
          </h2>
          <p className="mno" style={{fontWeight:700, fontSize:16, maxWidth:500, margin:"0 auto 48px", lineHeight:1.6}}>
            Drop your syllabus below. Get your roadmap in under 3 minutes.{" "}
            <span style={{textDecoration:"underline", textUnderlineOffset:4}}>Free. No sign-up required.</span>
          </p>

          <div
            className={dragging ? "dz drag" : "dz"}
            onClick={onStartClick}
            onDragOver={e=>{e.preventDefault();setDragging(true)}}
            onDragLeave={()=>setDragging(false)}
            onDrop={e=>{e.preventDefault();setDragging(false)}}
          >
            <div className="btn" style={{padding:18, background:"#FFAB00", boxShadow:"6px 6px 0 #000", pointerEvents:"none"}}>
              <Upload size={44} strokeWidth={2.5}/>
            </div>
            <p className="bb" style={{fontSize:34, letterSpacing:".1em"}}>
              {dragging ? "DROP IT. DO IT." : "DRAG & DROP YOUR PDF"}
            </p>
            <p className="mno" style={{fontSize:13, fontWeight:600, color:"#333"}}>
              or <span style={{textDecoration:"underline", cursor:"pointer"}}>click to browse files</span>
            </p>
            <p className="mno" style={{fontSize:11, color:"#666", letterSpacing:".12em"}}>
              SUPPORTS PDF · DOCX · TXT · MAX 20MB
            </p>
          </div>

          <button className="btn" style={{marginTop:40, fontSize:26, padding:"18px 48px", background:"#000", color:"#00E5FF", boxShadow:"10px 10px 0 #FFAB00"}} onClick={onStartClick}>
            GENERATE MY SKILL TREE →
          </button>
        </div>

        {/* ── FOOTER ── */}
        <footer style={{background:"#000", color:"#fff"}}>
          <div className="foot-inner">
            <span className="bb" style={{fontSize:24, letterSpacing:".08em"}}>
              SKILLBRIDGE <span style={{color:"#00E5FF"}}>AI</span>
            </span>
            <div style={{display:"flex", gap:24, alignItems:"center"}}>
              {["PRIVACY","TERMS"].map(l=>(
                <a key={l} href="#" className="mno" style={{fontSize:11, fontWeight:700, color:"#666", letterSpacing:".12em", textDecoration:"none"}}>{l}</a>
              ))}
              {[Github, Twitter].map((Icon,i)=>(
                <a key={i} href="#" className="btn" style={{padding:8, border:"2px solid #333", background:"transparent", color:"#fff", boxShadow:"3px 3px 0 #444"}}>
                  <Icon size={16}/>
                </a>
              ))}
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}