import { useState } from "react";
import { Zap, Eye, EyeOff, ArrowRight, Mail, Lock } from "lucide-react";

/* ─── Styles ───────────────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@400;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { overflow-x: hidden; }

  .lg-root {
    font-family: 'IBM Plex Mono', monospace;
    background-color: #f4f4f0;
    background-image:
      linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px);
    background-size: 40px 40px;
    min-height: 100vh;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
  }

  .bb  { font-family: 'Bebas Neue', cursive; }
  .mno { font-family: 'IBM Plex Mono', monospace; }

  /* ── Shared button press ── */
  .btn {
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    border: 4px solid #000;
    font-family: 'Bebas Neue', cursive;
    letter-spacing: .1em;
    transition: transform .08s ease, box-shadow .08s ease;
    white-space: nowrap;
    background: none;
  }
  .btn:hover  { transform: translate(4px,4px);  box-shadow: 0 0 0 0 #000 !important; }
  .btn:active { transform: translate(6px,6px);  box-shadow: 0 0 0 0 #000 !important; }

  /* ── Nav ── */
  .sb-nav {
    position: sticky; top: 0; z-index: 50;
    background: #f4f4f0;
    border-bottom: 4px solid #000;
    padding: 14px 24px;
    display: flex; align-items: center; justify-content: space-between;
  }

  /* ── Page body: two-col split ── */
  .lg-body {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr;
    min-height: calc(100vh - 64px);
  }
  @media(min-width: 1024px) {
    .lg-body { grid-template-columns: 1fr 1fr; }
  }

  /* ── Left decorative panel ── */
  .lg-left {
    background: #000;
    border-right: 4px solid #000;
    padding: 56px 48px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    display: none;
  }
  @media(min-width: 1024px) { .lg-left { display: flex; } }

  /* ── Right form panel ── */
  .lg-right {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
  }

  /* ── Login card ── */
  .lg-card {
    width: 100%;
    max-width: 480px;
    border: 4px solid #000;
    background: #fff;
    box-shadow: 10px 10px 0 0 #000;
  }

  .lg-card-header {
    background: #00E5FF;
    border-bottom: 4px solid #000;
    padding: 20px 28px;
  }

  .lg-card-body {
    padding: 32px 28px;
  }

  /* ── Input field ── */
  .field-wrap {
    position: relative;
    margin-bottom: 20px;
  }

  .field-label {
    display: block;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .14em;
    color: #000;
    margin-bottom: 6px;
    text-transform: uppercase;
  }

  .field-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
    border: 4px solid #000;
    background: #f4f4f0;
    transition: box-shadow .1s ease, background .1s ease;
  }
  .field-input-wrap:focus-within {
    background: #fff;
    box-shadow: 4px 4px 0 0 #000;
  }

  .field-icon {
    padding: 0 12px;
    display: flex;
    align-items: center;
    color: #000;
    border-right: 3px solid #000;
    height: 48px;
    flex-shrink: 0;
  }

  .field-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 14px;
    font-weight: 600;
    color: #000;
    padding: 0 14px;
    height: 48px;
  }
  .field-input::placeholder { color: #aaa; font-weight: 400; }

  .field-eye {
    padding: 0 12px;
    display: flex;
    align-items: center;
    cursor: pointer;
    color: #000;
    height: 48px;
    flex-shrink: 0;
    background: none;
    border: none;
  }

  /* ── Divider ── */
  .divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 24px 0;
  }
  .divider-line {
    flex: 1;
    height: 3px;
    background: #000;
  }
  .divider-text {
    font-family: 'Bebas Neue', cursive;
    font-size: 16px;
    letter-spacing: .12em;
    color: #000;
    flex-shrink: 0;
  }

  /* ── Google button ── */
  .google-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    border: 4px solid #000;
    background: #fff;
    padding: 13px 20px;
    cursor: pointer;
    box-shadow: 6px 6px 0 0 #000;
    transition: transform .08s ease, box-shadow .08s ease;
  }
  .google-btn:hover  { transform: translate(4px,4px); box-shadow: 0 0 0 0 #000; }
  .google-btn:active { transform: translate(6px,6px); box-shadow: 0 0 0 0 #000; }

  /* ── Submit btn full width ── */
  .submit-btn {
    width: 100%;
    padding: 15px 20px;
    font-size: 22px;
    box-shadow: 8px 8px 0 0 #000;
    background: #00E5FF;
    margin-top: 8px;
  }

  /* ── Tag badge ── */
  .tag {
    display: inline-flex;
    align-items: center;
    border: 2px solid #000;
    padding: 2px 10px;
  }

  /* ── Animated nodes on left panel ── */
  @keyframes npulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.2)} }
  .npulse { animation: npulse 2.2s ease-in-out infinite; }

  /* ── Blink ── */
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  .blink { animation: blink 1s step-end infinite; }

  /* ── Floating decorative cards on left ── */
  .deco-card {
    border: 4px solid #fff;
    padding: 14px 18px;
    margin-bottom: 16px;
  }

  /* ── Checkbox ── */
  .cb-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    margin-bottom: 24px;
  }
  .cb-box {
    width: 22px; height: 22px;
    border: 3px solid #000;
    background: #f4f4f0;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: background .1s;
  }
  .cb-box.checked { background: #FFAB00; }

  /* ── Footer strip ── */
  .lg-footer {
    border-top: 4px solid #000;
    background: #000;
    padding: 14px 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
    flex-wrap: wrap;
  }
`;

/* ─── Google G SVG ─────────────────────────────────────────────────────────── */
function GoogleG() {
  return (
    <svg width="22" height="22" viewBox="0 0 48 48" style={{flexShrink:0}}>
      <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.2 33.6 29.7 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 6 1.1 8.2 3l6-6C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.9 0 20-7.9 20-21 0-1.4-.1-2.7-.5-4z"/>
      <path fill="#34A853" d="M6.3 14.7l7 5.1C15 16.1 19.1 13 24 13c3.1 0 6 1.1 8.2 3l6-6C34.5 5.1 29.5 3 24 3 16.3 3 9.7 7.9 6.3 14.7z"/>
      <path fill="#FBBC05" d="M24 45c5.5 0 10.4-1.9 14.2-5l-6.6-5.4C29.5 36.2 26.9 37 24 37c-5.7 0-10.2-3.4-11.7-8.4l-7 5.4C8.7 40.9 15.8 45 24 45z"/>
      <path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-.8 2.3-2.3 4.2-4.3 5.5l6.6 5.4C41.8 36.2 45 30.6 45 24c0-1.4-.2-2.7-.5-4z"/>
    </svg>
  );
}

/* ─── Left panel mini SVG node graph ──────────────────────────────────────── */
const LG_NODES = [
  { label:"REACT",    x:30, y:25, color:"#00E5FF", delay:0 },
  { label:"NODE.JS",  x:70, y:20, color:"#FFAB00", delay:.3 },
  { label:"SQL",      x:15, y:55, color:"#FF6B9D", delay:.6 },
  { label:"DOCKER",   x:55, y:58, color:"#c8ff00", delay:.9 },
  { label:"AWS",      x:82, y:50, color:"#00E5FF", delay:1.2 },
  { label:"GIT",      x:38, y:80, color:"#FFAB00", delay:1.5 },
  { label:"REST API", x:72, y:78, color:"#FF6B9D", delay:1.8 },
];
const LG_EDGES = [[0,1],[0,2],[1,4],[2,3],[3,5],[4,6],[3,6]];

function DecoGraph() {
  return (
    <svg viewBox="0 0 100 100" style={{width:"100%", height:"100%", maxHeight:260}}>
      {LG_EDGES.map(([a,b],i)=>{
        const na=LG_NODES[a], nb=LG_NODES[b];
        return <line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke="#333" strokeWidth="0.8" strokeDasharray="2,1.5"/>;
      })}
      {LG_NODES.map((n,i)=>(
        <g key={i} className="npulse" style={{animationDelay:`${n.delay}s`}}>
          <rect x={n.x-8} y={n.y-4.5} width="16" height="9" fill={n.color} stroke="#fff" strokeWidth="0.8"/>
          <text x={n.x} y={n.y+1.6} textAnchor="middle" fontSize="2.5" fontFamily="IBM Plex Mono" fontWeight="700" fill="#000">
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ─── Main ─────────────────────────────────────────────────────────────────── */
export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [remember, setRemember] = useState(false);
  const [mode, setMode]         = useState("login"); // "login" | "signup"

  const isLogin = mode === "login";

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: STYLES}}/>
      <div className="lg-root">

        {/* ── NAV ── */}
        <nav className="sb-nav">
          <div style={{display:"flex", alignItems:"center", gap:12}}>
            <div className="btn" style={{padding:8, background:"#00E5FF", boxShadow:"4px 4px 0 #000"}}>
              <Zap size={18} strokeWidth={3}/>
            </div>
            <span className="bb" style={{fontSize:26, letterSpacing:".06em", lineHeight:1}}>
              SKILL<span style={{color:"#00E5FF", WebkitTextStroke:"1px #000"}}>BRIDGE</span>
              <span className="mno" style={{fontSize:12, fontWeight:700, background:"#000", color:"#fff", padding:"1px 5px", marginLeft:8}}>AI</span>
            </span>
          </div>

          <button
            className="btn"
            style={{fontSize:17, padding:"7px 18px", background:"#f4f4f0", boxShadow:"4px 4px 0 #000"}}
            onClick={()=>setMode(isLogin?"signup":"login")}
          >
            {isLogin ? "SIGN UP" : "LOGIN"} <ArrowRight size={15} strokeWidth={3}/>
          </button>
        </nav>

        {/* ── BODY ── */}
        <div className="lg-body">

          {/* ── LEFT PANEL ── */}
          <div className="lg-left">
            {/* Top tag */}
            <div>
              <div className="tag" style={{borderColor:"#333", marginBottom:36}}>
                <span className="mno" style={{fontSize:11, fontWeight:700, letterSpacing:".14em", color:"#888"}}>
                  🏆 HACKATHON 2025
                </span>
              </div>

              <h2 className="bb" style={{fontSize:72, lineHeight:.88, color:"#fff", marginBottom:24, letterSpacing:".02em"}}>
                YOUR SKILL<br/>
                <span style={{color:"#00E5FF"}}>TREE</span><br/>
                AWAITS<span className="blink" style={{color:"#FFAB00"}}>_</span>
              </h2>

              <p className="mno" style={{fontSize:14, fontWeight:600, lineHeight:1.7, color:"#888", maxWidth:360, borderLeft:"4px solid #333", paddingLeft:16}}>
                Upload any syllabus. Get an interactive, AI-generated skill roadmap in under 3 minutes. Built for builders, not memorisers.
              </p>
            </div>

            {/* Node graph */}
            <div style={{margin:"40px 0", border:"4px solid #222", padding:20, background:"#0a0a0a", boxShadow:"8px 8px 0 0 #00E5FF"}}>
              <div style={{borderBottom:"3px solid #222", marginBottom:14, paddingBottom:10, display:"flex", alignItems:"center", gap:8}}>
                {["#ff5f57","#ffbd2e","#28c840"].map(c=>(
                  <div key={c} style={{width:10, height:10, borderRadius:"50%", background:c, border:"1.5px solid #333"}}/>
                ))}
                <span className="mno" style={{fontSize:10, color:"#555", letterSpacing:".1em", marginLeft:6}}>ROADMAP_PREVIEW.app</span>
              </div>
              <DecoGraph/>
            </div>

            {/* Stats */}
            <div style={{display:"flex", gap:16}}>
              {[["2,400+","SYLLABI"],["98%","ACCURACY"],["3 MIN","TO ROADMAP"]].map(([v,l])=>(
                <div key={l} style={{border:"3px solid #222", padding:"8px 14px", flex:1}}>
                  <div className="bb" style={{fontSize:28, color:"#fff", lineHeight:1}}>{v}</div>
                  <div className="mno" style={{fontSize:10, color:"#555", letterSpacing:".1em", fontWeight:700}}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="lg-right">
            <div className="lg-card">

              {/* Card header */}
              <div className="lg-card-header">
                <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
                  <h1 className="bb" style={{fontSize:42, lineHeight:1, letterSpacing:".03em"}}>
                    {isLogin ? "WELCOME BACK." : "JOIN THE GRID."}
                  </h1>
                  <div style={{border:"3px solid #000", background:"#FFAB00", padding:"3px 10px"}}>
                    <span className="mno" style={{fontSize:11, fontWeight:700, letterSpacing:".1em"}}>
                      {isLogin ? "LOGIN" : "SIGN UP"}
                    </span>
                  </div>
                </div>
                <p className="mno" style={{fontSize:12, fontWeight:600, marginTop:8, color:"#000"}}>
                  {isLogin
                    ? "Your skill tree is waiting. Log in to continue."
                    : "Create your account. Start building your roadmap."}
                </p>
              </div>

              {/* Card body */}
              <div className="lg-card-body">

                {/* Google button */}
                <button className="google-btn">
                  <GoogleG/>
                  <span className="mno" style={{fontSize:14, fontWeight:700, letterSpacing:".08em"}}>
                    {isLogin ? "CONTINUE WITH GOOGLE" : "SIGN UP WITH GOOGLE"}
                  </span>
                </button>

                {/* Divider */}
                <div className="divider">
                  <div className="divider-line"/>
                  <span className="divider-text">OR</span>
                  <div className="divider-line"/>
                </div>

                {/* Name field (signup only) */}
                {!isLogin && (
                  <div className="field-wrap">
                    <label className="field-label">FULL NAME</label>
                    <div className="field-input-wrap">
                      <div className="field-icon">
                        <span className="mno" style={{fontSize:15, fontWeight:700}}>✦</span>
                      </div>
                      <input
                        className="field-input"
                        type="text"
                        placeholder="Your name here"
                      />
                    </div>
                  </div>
                )}

                {/* Email field */}
                <div className="field-wrap">
                  <label className="field-label">EMAIL ADDRESS</label>
                  <div className="field-input-wrap">
                    <div className="field-icon">
                      <Mail size={16} strokeWidth={3}/>
                    </div>
                    <input
                      className="field-input"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e=>setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="field-wrap">
                  <label className="field-label">PASSWORD</label>
                  <div className="field-input-wrap">
                    <div className="field-icon">
                      <Lock size={16} strokeWidth={3}/>
                    </div>
                    <input
                      className="field-input"
                      type={showPw ? "text" : "password"}
                      placeholder={isLogin ? "Your password" : "Min. 8 characters"}
                      value={password}
                      onChange={e=>setPassword(e.target.value)}
                    />
                    <button className="field-eye" onClick={()=>setShowPw(p=>!p)} type="button">
                      {showPw ? <EyeOff size={16} strokeWidth={3}/> : <Eye size={16} strokeWidth={3}/>}
                    </button>
                  </div>
                </div>

                {/* Remember / Forgot row */}
                <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24}}>
                  <div className="cb-wrap" onClick={()=>setRemember(p=>!p)} style={{marginBottom:0}}>
                    <div className={`cb-box${remember?" checked":""}`}>
                      {remember && <span style={{fontSize:13, fontWeight:900, lineHeight:1}}>✓</span>}
                    </div>
                    <span className="mno" style={{fontSize:12, fontWeight:700, letterSpacing:".06em"}}>
                      REMEMBER ME
                    </span>
                  </div>
                  {isLogin && (
                    <a href="#" className="mno" style={{fontSize:12, fontWeight:700, color:"#000", letterSpacing:".06em", textDecoration:"underline", textUnderlineOffset:3}}>
                      FORGOT PASSWORD?
                    </a>
                  )}
                </div>

                {/* Submit */}
                <button className="btn submit-btn" onClick={onLoginSuccess}>
                  <span style={{fontSize:22}}>
                    {isLogin ? "LOGIN TO SKILLBRIDGE" : "CREATE MY ACCOUNT"}
                  </span>
                  <ArrowRight size={20} strokeWidth={3}/>
                </button>

                {/* Switch mode */}
                <p className="mno" style={{fontSize:12, fontWeight:600, textAlign:"center", marginTop:24, color:"#555"}}>
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <span
                    style={{color:"#000", fontWeight:700, textDecoration:"underline", textUnderlineOffset:3, cursor:"pointer"}}
                    onClick={()=>setMode(isLogin?"signup":"login")}
                  >
                    {isLogin ? "SIGN UP FREE" : "LOG IN"}
                  </span>
                </p>

              </div>

              {/* Card footer strip */}
              <div style={{borderTop:"4px solid #000", background:"#f4f4f0", padding:"10px 28px", display:"flex", alignItems:"center", gap:8}}>
                <div style={{width:8, height:8, background:"#00E5FF", border:"2px solid #000", borderRadius:"50%"}}/>
                <span className="mno" style={{fontSize:11, fontWeight:700, letterSpacing:".1em", color:"#555"}}>
                  256-BIT ENCRYPTED · NO ADS · NO BS
                </span>
              </div>

            </div>

            {/* Below-card note */}
            <p className="mno" style={{fontSize:11, color:"#888", marginTop:20, textAlign:"center", maxWidth:380, lineHeight:1.6, fontWeight:600}}>
              By continuing, you agree to SkillBridge's{" "}
              <a href="#" style={{color:"#000", textDecoration:"underline", textUnderlineOffset:3}}>Terms of Service</a>{" "}
              and{" "}
              <a href="#" style={{color:"#000", textDecoration:"underline", textUnderlineOffset:3}}>Privacy Policy</a>.
            </p>
          </div>

        </div>

        {/* ── FOOTER ── */}
        <div className="lg-footer">
          {["PRIVACY","TERMS","DOCS","GITHUB"].map(l=>(
            <a key={l} href="#" className="mno" style={{fontSize:11, fontWeight:700, color:"#666", letterSpacing:".12em", textDecoration:"none"}}>
              {l}
            </a>
          ))}
          <span className="mno" style={{fontSize:11, color:"#444", letterSpacing:".1em", fontWeight:700}}>
            © 2025 SKILLBRIDGE AI — HACKATHON BUILD
          </span>
        </div>

      </div>
    </>
  );
}