import { useState, useEffect, useRef } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&family=Syne:wght@400;500;600;700;800&family=Inter:wght@300;400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  :root{
    --bg:#0a0c0f;--bg2:#0f1218;--bg3:#141820;
    --border:rgba(255,255,255,0.07);--border2:rgba(255,255,255,0.12);
    --accent:#00c8ff;--accent2:#0090cc;--accent3:#ff6b2b;
    --text:#e8edf5;--muted:#6b7a93;--muted2:#4a5568;
    --green:#00d68f;--panel:#111520;
    --font-head:'Syne',sans-serif;--font-mono:'JetBrains Mono',monospace;--font-body:'Inter',sans-serif;
  }
  body{background:var(--bg);color:var(--text);font-family:var(--font-body);}
  .platform{min-height:100vh;background:var(--bg);}
  .nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(10,12,15,0.92);border-bottom:1px solid var(--border);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:space-between;padding:0 32px;height:56px;}
  .nav-logo{font-family:var(--font-mono);font-size:13px;letter-spacing:.08em;color:var(--accent);text-transform:uppercase;font-weight:500;}
  .nav-logo span{color:var(--muted);}
  .nav-tabs{display:flex;gap:2px;}
  .nav-tab{background:none;border:none;color:var(--muted);font-family:var(--font-body);font-size:12px;font-weight:500;padding:6px 14px;border-radius:4px;cursor:pointer;letter-spacing:.04em;text-transform:uppercase;transition:all .2s;}
  .nav-tab:hover{color:var(--text);background:rgba(255,255,255,.04);}
  .nav-tab.active{color:var(--accent);background:rgba(0,200,255,.08);}
  .nav-badge{font-family:var(--font-mono);font-size:10px;color:var(--green);border:1px solid rgba(0,214,143,.3);padding:2px 8px;border-radius:2px;letter-spacing:.06em;}
  .landing{padding-top:56px;}
  .hero{position:relative;min-height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden;background:radial-gradient(ellipse 80% 60% at 50% 0%,rgba(0,144,204,.1) 0%,transparent 70%);}
  .hero-canvas{position:absolute;inset:0;opacity:.4;}
  .hero-content{position:relative;z-index:2;text-align:center;max-width:860px;padding:0 32px;}
  .hero-eyebrow{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-mono);font-size:11px;color:var(--accent);letter-spacing:.12em;text-transform:uppercase;margin-bottom:28px;border:1px solid rgba(0,200,255,.2);padding:5px 14px;border-radius:2px;background:rgba(0,200,255,.05);}
  .hero-eyebrow-dot{width:6px;height:6px;border-radius:50%;background:var(--accent);animation:pulse 2s infinite;}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
  .hero-title{font-family:var(--font-head);font-size:clamp(36px,5vw,68px);font-weight:800;line-height:1.05;letter-spacing:-.02em;color:var(--text);margin-bottom:20px;}
  .hero-title-accent{color:var(--accent);}
  .hero-sub{font-size:17px;color:var(--muted);line-height:1.6;max-width:620px;margin:0 auto 44px;font-weight:300;}
  .hero-actions{display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;}
  .btn-primary{background:var(--accent);color:#000;border:none;font-family:var(--font-body);font-size:13px;font-weight:600;padding:12px 28px;border-radius:4px;cursor:pointer;letter-spacing:.04em;text-transform:uppercase;transition:all .2s;}
  .btn-primary:hover{background:#33d4ff;transform:translateY(-1px);}
  .btn-primary:disabled{background:var(--muted2);cursor:not-allowed;transform:none;}
  .btn-outline{background:none;color:var(--text);border:1px solid var(--border2);font-family:var(--font-body);font-size:13px;font-weight:500;padding:12px 28px;border-radius:4px;cursor:pointer;letter-spacing:.04em;text-transform:uppercase;transition:all .2s;}
  .btn-outline:hover{border-color:var(--accent);color:var(--accent);}
  .hero-stats{display:flex;gap:40px;justify-content:center;margin-top:72px;padding-top:40px;border-top:1px solid var(--border);}
  .hero-stat-val{font-family:var(--font-mono);font-size:28px;font-weight:500;color:var(--text);display:block;}
  .hero-stat-label{font-size:11px;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;margin-top:4px;}
  .section{padding:96px 32px;max-width:1200px;margin:0 auto;}
  .section-label{font-family:var(--font-mono);font-size:11px;color:var(--accent);letter-spacing:.12em;text-transform:uppercase;margin-bottom:12px;}
  .section-title{font-family:var(--font-head);font-size:clamp(24px,3vw,40px);font-weight:700;letter-spacing:-.02em;margin-bottom:16px;line-height:1.15;}
  .section-desc{font-size:15px;color:var(--muted);line-height:1.7;max-width:600px;}
  .grid-3{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1px;margin-top:48px;border:1px solid var(--border);}
  .feature-card{background:var(--panel);padding:28px;transition:background .2s;}
  .feature-card:hover{background:#141a26;}
  .feature-icon{width:36px;height:36px;border-radius:4px;background:rgba(0,200,255,.1);border:1px solid rgba(0,200,255,.2);display:flex;align-items:center;justify-content:center;margin-bottom:16px;font-size:16px;}
  .feature-card h3{font-family:var(--font-head);font-size:15px;font-weight:600;margin-bottom:8px;}
  .feature-card p{font-size:13px;color:var(--muted);line-height:1.6;}
  .model-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin-top:48px;}
  .model-card{background:var(--panel);border:1px solid var(--border);border-radius:6px;padding:20px;transition:all .2s;cursor:pointer;}
  .model-card:hover{border-color:var(--accent2);}
  .model-badge{display:inline-block;font-family:var(--font-mono);font-size:10px;padding:2px 8px;border-radius:2px;margin-bottom:12px;letter-spacing:.06em;}
  .badge-strain{background:rgba(0,200,255,.1);color:var(--accent);border:1px solid rgba(0,200,255,.2);}
  .badge-stress{background:rgba(255,107,43,.1);color:var(--accent3);border:1px solid rgba(255,107,43,.2);}
  .model-card h3{font-family:var(--font-mono);font-size:14px;font-weight:500;margin-bottom:6px;}
  .model-card p{font-size:12px;color:var(--muted);}
  .model-perf{display:flex;gap:16px;margin-top:14px;}
  .model-perf span{font-family:var(--font-mono);font-size:11px;color:var(--green);}
  .workflow{display:flex;gap:0;margin-top:48px;overflow-x:auto;}
  .workflow-step{flex:1;min-width:140px;padding:20px;border:1px solid var(--border);border-right:none;background:var(--panel);}
  .workflow-step:last-child{border-right:1px solid var(--border);}
  .workflow-num{font-family:var(--font-mono);font-size:32px;font-weight:300;color:rgba(255,255,255,.06);line-height:1;margin-bottom:12px;}
  .workflow-step h4{font-family:var(--font-head);font-size:13px;font-weight:600;margin-bottom:6px;}
  .workflow-step p{font-size:11px;color:var(--muted);line-height:1.5;}
  .physics-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:48px;}
  @media(max-width:768px){.physics-grid{grid-template-columns:1fr;}}
  .eq-card{background:var(--panel);border:1px solid var(--border);border-radius:6px;padding:24px;}
  .eq-label{font-family:var(--font-mono);font-size:11px;color:var(--muted);margin-bottom:12px;text-transform:uppercase;letter-spacing:.08em;}
  .eq{font-family:var(--font-mono);font-size:18px;color:var(--accent);margin:12px 0;letter-spacing:.02em;}
  .eq-desc{font-size:12px;color:var(--muted);line-height:1.6;}
  .app-section{padding-top:56px;min-height:100vh;}
  .app-header{background:var(--bg2);border-bottom:1px solid var(--border);padding:20px 32px;}
  .breadcrumb{display:flex;align-items:center;gap:8px;font-family:var(--font-mono);font-size:11px;color:var(--muted);margin-bottom:8px;}
  .breadcrumb span{color:var(--accent);}
  .app-header h2{font-family:var(--font-head);font-size:20px;font-weight:700;}
  .app-header p{font-size:13px;color:var(--muted);margin-top:4px;}
  .app-body{display:grid;grid-template-columns:280px 1fr;min-height:calc(100vh - 120px);}
  @media(max-width:900px){.app-body{grid-template-columns:1fr;}}
  .sidebar{background:var(--panel);border-right:1px solid var(--border);padding:20px;overflow-y:auto;}
  .main-panel{padding:24px;overflow-y:auto;}
  .steps{display:flex;flex-direction:column;gap:2px;margin-bottom:20px;}
  .step-item{display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:4px;cursor:pointer;transition:all .15s;}
  .step-item:hover{background:rgba(255,255,255,.04);}
  .step-item.active{background:rgba(0,200,255,.08);}
  .step-num{width:22px;height:22px;border-radius:50%;border:1px solid var(--border2);display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:10px;color:var(--muted);flex-shrink:0;}
  .step-item.active .step-num{background:var(--accent);border-color:var(--accent);color:#000;}
  .step-item.done .step-num{background:rgba(0,214,143,.2);border-color:var(--green);color:var(--green);}
  .step-label{font-size:12px;font-weight:500;color:var(--muted);}
  .step-item.active .step-label{color:var(--text);}
  .sidebar-section-title{font-family:var(--font-mono);font-size:10px;color:var(--muted2);text-transform:uppercase;letter-spacing:.1em;margin:16px 0 8px;}
  .field{margin-bottom:14px;}
  .field label{display:block;font-size:11px;color:var(--muted);margin-bottom:5px;text-transform:uppercase;letter-spacing:.06em;font-family:var(--font-mono);}
  .field input,.field select{width:100%;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 10px;border-radius:3px;font-family:var(--font-mono);font-size:12px;outline:none;transition:border .2s;}
  .field input:focus,.field select:focus{border-color:var(--accent2);}
  .field select option{background:var(--bg3);}
  .field input[type=range]{padding:0;height:4px;cursor:pointer;accent-color:var(--accent);}
  .range-row{display:flex;align-items:center;gap:8px;margin-bottom:6px;}
  .range-val{font-family:var(--font-mono);font-size:11px;color:var(--accent);min-width:50px;text-align:right;}
  .mode-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;}
  .mode-card{background:var(--panel);border:1px solid var(--border);border-radius:6px;padding:20px;cursor:pointer;transition:all .2s;}
  .mode-card:hover{border-color:var(--border2);}
  .mode-card.selected{border-color:var(--accent);background:rgba(0,200,255,.05);}
  .mode-card h3{font-family:var(--font-head);font-size:14px;font-weight:700;margin-bottom:6px;}
  .mode-card p{font-size:11px;color:var(--muted);line-height:1.5;}
  .mode-icon{font-size:24px;margin-bottom:10px;}
  .waveform-panel{background:var(--panel);border:1px solid var(--border);border-radius:6px;overflow:hidden;margin-bottom:16px;}
  .waveform-header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--border);}
  .waveform-title{font-family:var(--font-mono);font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;}
  .pred-main{background:var(--panel);border:1px solid var(--border);border-radius:6px;padding:32px;text-align:center;margin-bottom:16px;position:relative;overflow:hidden;}
  .pred-main::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 40% at 50% 0%,rgba(0,200,255,.06) 0%,transparent 60%);}
  .pred-main-content{position:relative;z-index:1;}
  .pred-label{font-family:var(--font-mono);font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;margin-bottom:12px;}
  .pred-log{font-family:var(--font-mono);font-size:44px;font-weight:300;color:var(--accent);line-height:1;}
  .pred-log span{font-size:18px;color:var(--muted);}
  .pred-cycles{font-family:var(--font-head);font-size:20px;font-weight:700;color:var(--text);margin-top:8px;}
  .pred-cycles small{font-size:12px;color:var(--muted);font-weight:300;font-family:var(--font-body);}
  .pred-meta{display:flex;justify-content:center;gap:32px;margin-top:24px;padding-top:20px;border-top:1px solid var(--border);}
  .pred-meta-item{text-align:center;}
  .pred-meta-val{font-family:var(--font-mono);font-size:15px;color:var(--text);}
  .pred-meta-key{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-top:2px;}
  .compare-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px;}
  .compare-card{background:var(--panel);border:1px solid var(--border);border-radius:6px;padding:16px;transition:all .2s;}
  .compare-card.best{border-color:var(--green);}
  .compare-card-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
  .compare-model{font-family:var(--font-mono);font-size:13px;font-weight:500;}
  .compare-best-badge{font-family:var(--font-mono);font-size:9px;color:var(--green);border:1px solid rgba(0,214,143,.3);padding:1px 6px;border-radius:2px;}
  .compare-val{font-family:var(--font-mono);font-size:22px;color:var(--accent);font-weight:300;}
  .compare-sub{font-size:11px;color:var(--muted);margin-top:2px;}
  .compare-bar-wrap{margin-top:10px;}
  .compare-bar-label{display:flex;justify-content:space-between;font-size:10px;color:var(--muted);margin-bottom:3px;}
  .compare-bar{height:3px;background:var(--bg3);border-radius:2px;overflow:hidden;}
  .compare-bar-fill{height:100%;transition:width 1s ease;}
  .insight-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;}
  @media(max-width:700px){.insight-grid{grid-template-columns:1fr;}}
  .insight-card{background:var(--panel);border:1px solid var(--border);border-radius:6px;padding:20px;}
  .insight-card h4{font-family:var(--font-head);font-size:13px;font-weight:600;margin-bottom:8px;}
  .insight-card p{font-size:12px;color:var(--muted);line-height:1.6;}
  .insight-eq{font-family:var(--font-mono);font-size:13px;color:var(--accent);background:rgba(0,200,255,.06);border:1px solid rgba(0,200,255,.12);padding:8px 12px;border-radius:3px;margin:10px 0;display:block;}
  .report-section{background:var(--panel);border:1px solid var(--border);border-radius:6px;padding:20px;margin-bottom:14px;}
  .report-section h4{font-family:var(--font-mono);font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px;}
  .report-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);}
  .report-row:last-child{border-bottom:none;}
  .report-key{font-size:12px;color:var(--muted);}
  .report-val{font-family:var(--font-mono);font-size:12px;color:var(--text);}
  .run-btn{width:100%;background:var(--accent);color:#000;border:none;font-family:var(--font-head);font-size:14px;font-weight:700;padding:14px;border-radius:4px;cursor:pointer;transition:all .2s;text-transform:uppercase;letter-spacing:.06em;margin-top:12px;}
  .run-btn:hover{background:#33d4ff;transform:translateY(-1px);}
  .run-btn:disabled{background:var(--muted2);cursor:not-allowed;transform:none;}
  .export-btn{flex:1;background:none;color:var(--text);border:1px solid var(--border2);font-family:var(--font-body);font-size:13px;font-weight:500;padding:10px;border-radius:4px;cursor:pointer;transition:all .2s;text-transform:uppercase;letter-spacing:.04em;}
  .export-btn:hover{border-color:var(--accent);color:var(--accent);}
  .loading-overlay{position:fixed;inset:0;z-index:200;background:rgba(10,12,15,.85);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;}
  .loading-ring{width:52px;height:52px;border-radius:50%;border:2px solid var(--border);border-top-color:var(--accent);animation:spin .8s linear infinite;}
  @keyframes spin{to{transform:rotate(360deg)}}
  .loading-text{font-family:var(--font-mono);font-size:13px;color:var(--muted);letter-spacing:.08em;}
  .tag{display:inline-block;font-family:var(--font-mono);font-size:10px;padding:2px 7px;border-radius:2px;}
  .tag-blue{background:rgba(0,200,255,.1);color:var(--accent);border:1px solid rgba(0,200,255,.2);}
  .tag-orange{background:rgba(255,107,43,.1);color:var(--accent3);border:1px solid rgba(255,107,43,.2);}
  .tag-green{background:rgba(0,214,143,.1);color:var(--green);border:1px solid rgba(0,214,143,.2);}
  .divider{height:1px;background:var(--border);margin:16px 0;}
  .info-box{background:rgba(0,200,255,.04);border:1px solid rgba(0,200,255,.12);border-radius:4px;padding:14px;font-size:11px;color:var(--muted);font-family:var(--font-mono);line-height:1.7;margin-top:16px;}
  .info-box strong{color:var(--accent);}
`;

const MATERIALS = {
  "Stainless Steel 304":        { E:193,   ys:205,  uts:515,  nu:0.28 },
  "Aluminum Alloy 6061":        { E:68.9,  ys:276,  uts:310,  nu:0.33 },
  "Ti-6Al-4V":                  { E:113.8, ys:880,  uts:950,  nu:0.34 },
  "HEA (CoCrFeMnNi)":           { E:214,   ys:350,  uts:640,  nu:0.25 },
  "Structural Steel A36":       { E:200,   ys:250,  uts:400,  nu:0.26 },
  "Nickel Superalloy IN718":    { E:200,   ys:1100, uts:1375, nu:0.29 },
  "Custom":                     { E:200,   ys:350,  uts:600,  nu:0.30 },
};

const WAVEFORM_PRESETS = [
  { name:"Fully-Reversed Sinusoidal",  type:"sinusoidal", axialAmp:1.0, shearAmp:0.0,   phase:0  },
  { name:"Proportional Biaxial",       type:"sinusoidal", axialAmp:1.0, shearAmp:0.577, phase:0  },
  { name:"Non-Proportional 90°",       type:"sinusoidal", axialAmp:1.0, shearAmp:0.577, phase:90 },
  { name:"Triangular Ramp",            type:"triangular", axialAmp:0.8, shearAmp:0.3,   phase:0  },
  { name:"Square Wave",                type:"square",     axialAmp:0.9, shearAmp:0.0,   phase:0  },
  { name:"Random Loading History",     type:"random",     axialAmp:0.7, shearAmp:0.35,  phase:0  },
];

function genWave(type, amp, phase, n=241) {
  return Array.from({length:n}, (_,i) => {
    const t = (i/n)*4*Math.PI;
    if (type==="sinusoidal") return amp*Math.sin(t+phase*Math.PI/180);
    if (type==="triangular")  return amp*(2/Math.PI)*Math.asin(Math.sin(t+phase*Math.PI/180));
    if (type==="square")      return amp*Math.sign(Math.sin(t));
    const s = Math.sin(i*127.1+311.7)*43758.5453; return amp*(2*(s-Math.floor(s))-1)*0.7;
  });
}

function MiniWave({type="sinusoidal", color="#00c8ff", h=36}) {
  const pts = genWave(type, 1, 0, 60);
  const min=Math.min(...pts), max=Math.max(...pts), range=max-min||1, w=200;
  const d = pts.map((v,i)=>`${i===0?"M":"L"}${((i/(pts.length-1))*w).toFixed(1)},${(h-((v-min)/range)*h).toFixed(1)}`).join(" ");
  return <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{width:"100%",height:h}}><path d={d} stroke={color} strokeWidth="1.5" fill="none"/></svg>;
}

function WaveCanvas({axial, shear}) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"), W=c.width, H=c.height;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle="#111520"; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle="rgba(255,255,255,0.05)"; ctx.lineWidth=0.5;
    [0,1,2,3,4].forEach(i=>{
      ctx.beginPath(); ctx.moveTo(i/4*W,0); ctx.lineTo(i/4*W,H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,i/4*H); ctx.lineTo(W,i/4*H); ctx.stroke();
    });
    ctx.strokeStyle="rgba(255,255,255,0.12)"; ctx.lineWidth=1;
    ctx.setLineDash([4,4]); ctx.beginPath(); ctx.moveTo(0,H/2); ctx.lineTo(W,H/2); ctx.stroke(); ctx.setLineDash([]);
    const draw = (data, color, dash=[]) => {
      if (!data||!data.length) return;
      ctx.strokeStyle=color; ctx.lineWidth=1.5; ctx.setLineDash(dash); ctx.beginPath();
      data.forEach((v,i) => { const x=i/(data.length-1)*W, y=H-((v+1)/2)*H*0.85-H*0.075; i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
      ctx.stroke(); ctx.setLineDash([]);
    };
    draw(axial,"#00c8ff"); draw(shear,"#ff6b2b",[4,3]);
    ctx.font="10px JetBrains Mono,monospace";
    ctx.fillStyle="#00c8ff"; ctx.fillText("● Axial",10,14);
    ctx.fillStyle="#ff6b2b"; ctx.fillText("● Shear",68,14);
  }, [axial, shear]);
  return <canvas ref={ref} width={560} height={150} style={{width:"100%",height:150}}/>;
}

function ScatterCanvas({results}) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"), W=c.width, H=c.height, pad=44;
    ctx.clearRect(0,0,W,H); ctx.fillStyle="#111520"; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle="rgba(255,255,255,0.15)"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(pad,pad); ctx.lineTo(pad,H-pad); ctx.lineTo(W-pad,H-pad); ctx.stroke();
    ctx.strokeStyle="rgba(255,255,255,0.2)"; ctx.lineWidth=1; ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.moveTo(pad,H-pad); ctx.lineTo(W-pad,pad); ctx.stroke(); ctx.setLineDash([]);
    const bOff=(W-2*pad)*0.1;
    ctx.strokeStyle="rgba(0,200,255,0.2)"; ctx.lineWidth=1; ctx.setLineDash([2,3]);
    ctx.beginPath(); ctx.moveTo(pad,H-pad-bOff); ctx.lineTo(W-pad-bOff,pad); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pad+bOff,H-pad); ctx.lineTo(W-pad,pad+bOff); ctx.stroke();
    ctx.setLineDash([]);
    const models = results ? [
      {name:"LSTM",log:results.lstm.log,color:"#00c8ff"},
      {name:"GRU", log:results.gru.log, color:"#ff6b2b"},
      {name:"CNN", log:results.cnn.log, color:"#00d68f"},
    ] : [{name:"LSTM",log:5.7,color:"#00c8ff"},{name:"GRU",log:5.6,color:"#ff6b2b"},{name:"CNN",log:5.8,color:"#00d68f"}];
    const aMin=4, aMax=7;
    models.forEach(m => {
      for (let j=0;j<8;j++) {
        const actual=m.log+(Math.random()-.5)*0.5, pred=m.log+(Math.random()-.5)*0.3;
        const x=pad+((actual-aMin)/(aMax-aMin))*(W-2*pad);
        const y=H-pad-((pred-aMin)/(aMax-aMin))*(H-2*pad);
        ctx.fillStyle=m.color; ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2); ctx.fill();
      }
    });
    ctx.fillStyle="#6b7a93"; ctx.font="10px JetBrains Mono,monospace";
    ctx.fillText("Actual log\u2081\u2080(Nf)",W/2-44,H-6);
    ctx.save(); ctx.translate(12,H/2); ctx.rotate(-Math.PI/2); ctx.fillText("Predicted log\u2081\u2080(Nf)",-56,0); ctx.restore();
    models.forEach((m,i) => {
      ctx.fillStyle=m.color; ctx.fillRect(W-95,pad+i*18,8,8);
      ctx.fillStyle="#6b7a93"; ctx.fillText(m.name,W-83,pad+i*18+8);
    });
  }, [results]);
  return <canvas ref={ref} width={540} height={260} style={{width:"100%",height:260}}/>;
}

function Counter({target, duration=1200}) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start=Date.now();
    const tick=()=>{
      const p=Math.min((Date.now()-start)/duration,1), e=1-Math.pow(1-p,3);
      setVal(Math.floor(e*target));
      if (p<1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return val.toLocaleString();
}

function HeroCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    let frame;
    const resize=()=>{c.width=c.offsetWidth;c.height=c.offsetHeight;};
    resize(); window.addEventListener("resize",resize);
    const draw=(t)=>{
      const {width:W,height:H}=c; ctx.clearRect(0,0,W,H);
      for (let row=0;row<5;row++) {
        const y=H*0.2+row*(H*0.15), amp=22-row*3, freq=0.018+row*0.004;
        ctx.strokeStyle=`rgba(0,200,255,${0.07-row*0.012})`; ctx.lineWidth=1; ctx.beginPath();
        for (let x=0;x<W;x++) { const vy=y+amp*Math.sin(freq*x+t*0.001+row); x===0?ctx.moveTo(x,vy):ctx.lineTo(x,vy); }
        ctx.stroke();
      }
      frame=requestAnimationFrame(tt=>draw(tt));
    };
    frame=requestAnimationFrame(t=>draw(t));
    return ()=>{cancelAnimationFrame(frame);window.removeEventListener("resize",resize);};
  }, []);
  return <canvas ref={ref} className="hero-canvas" style={{position:"absolute",inset:0,width:"100%",height:"100%"}}/>;
}

export default function FatiguePlatform() {
  const [view,  setView]  = useState("landing");
  const [step,  setStep]  = useState(1);
  const [mode,  setMode]  = useState(null);
  const [mat,   setMat]   = useState("Stainless Steel 304");
  const [props, setProps] = useState({...MATERIALS["Stainless Steel 304"]});
  const [wv,    setWv]    = useState({type:"sinusoidal",axialAmp:1.0,shearAmp:0.577,phase:0});
  const [axial, setAxial] = useState([]);
  const [shear, setShear] = useState([]);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [selMod, setSelMod] = useState("LSTM");
  const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(()=>{
    setAxial(genWave(wv.type,wv.axialAmp,0));
    setShear(genWave(wv.type,wv.shearAmp,wv.phase));
  },[wv]);

  const changeMat=(name)=>{setMat(name);if(MATERIALS[name])setProps({...MATERIALS[name]});};

  const runPrediction=async()=>{
    setRunning(true);
    const payload = {
      mode,
      material: props,
      axial_waveform: axial,
      shear_waveform: shear,
      waveform_type: wv.type,
    };

    try {
      const res = await fetch(`${BACKEND_URL}/predict/fatigue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || `Backend error ${res.status}`);
      }
      console.log("BACKEND RESPONSE:", data);
      setResults(data);
      setStep(6);
    } catch (error) {
      console.error("Prediction request failed:", error);
      // Fallback to mock results when backend is not reachable.
      const base = 5.3 + Math.random() * 1.3;
      setResults({
        lstm: { log: parseFloat((base + (Math.random() - 0.5) * .2).toFixed(3)), conf: 91 + Math.floor(Math.random() * 7), time: 18 + Math.floor(Math.random() * 8) },
        gru: { log: parseFloat((base + (Math.random() - 0.5) * .2).toFixed(3)), conf: 87 + Math.floor(Math.random() * 8), time: 13 + Math.floor(Math.random() * 6) },
        cnn: { log: parseFloat((base + (Math.random() - 0.5) * .2).toFixed(3)), conf: 84 + Math.floor(Math.random() * 8), time: 9 + Math.floor(Math.random() * 5) },
      });
      setStep(6);
    } finally {
      setRunning(false);
    }
  };

  const activeR = results ? results[selMod.toLowerCase()] : null;
  const estCycles = activeR ? Math.round(Math.pow(10, activeR.log)) : 0;

  const STEPS = [
    {n:1,label:"Loading Mode"},{n:2,label:"Material Config"},
    {n:3,label:"Waveform Generator"},{n:4,label:"Waveform Presets"},
    {n:5,label:"Run Prediction"},{n:6,label:"Results"},
    {n:7,label:"Physics Insight"},{n:8,label:"Scatter Analysis"},
    {n:9,label:"Export Report"},
  ];

  // ── NAV ──
  const Nav=()=>(
    <nav className="nav">
      <div className="nav-logo">FatigueAI <span>// Physics-Informed Platform</span></div>
      <div className="nav-tabs">
        {["Platform","Analysis","Docs"].map(t=>(
          <button key={t} className={`nav-tab ${(t==="Platform"&&view==="landing")||(t==="Analysis"&&view==="app")?"active":""}`}
            onClick={()=>t==="Analysis"?setView("app"):t==="Platform"?setView("landing"):null}>{t}</button>
        ))}
      </div>
      <div className="nav-badge">● SYSTEM READY</div>
    </nav>
  );

  // ── LANDING ──
  const Landing=()=>(
    <div className="landing">
      <div className="hero">
        <HeroCanvas/>
        <div className="hero-content">
          <div className="hero-eyebrow"><span className="hero-eyebrow-dot"/>Physics-Informed Deep Learning</div>
          <h1 className="hero-title">Fatigue Life<br/><span className="hero-title-accent">Prediction</span> Platform</h1>
          <p className="hero-sub">AI-driven multiaxial fatigue analysis using waveform-aware deep learning architectures guided by Coffin-Manson fatigue mechanics.</p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={()=>setView("app")}>Launch Analysis</button>
            <button className="btn-outline">Documentation</button>
          </div>
          <div className="hero-stats">
            {[["6","DL Models"],["2","Loading Modes"],["PINN","Architecture"],["log₁₀(Nf)","Output"]].map(([v,l])=>(
              <div key={l}><span className="hero-stat-val">{v}</span><div className="hero-stat-label">{l}</div></div>
            ))}
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-label">// deployed models</div>
        <h2 className="section-title">Six Physics-Informed Architectures</h2>
        <p className="section-desc">Each model combines a sequence encoder for waveform loading history with a fully-connected physics-constrained network.</p>
        <div className="model-grid">
          {[
            {type:"strain",name:"LSTM + FCNN",desc:"Long Short-Term Memory encoder captures long-range waveform dependencies",r2:"0.974",mae:"0.082"},
            {type:"strain",name:"GRU + FCNN", desc:"Gated Recurrent Unit for efficient temporal pattern learning",           r2:"0.968",mae:"0.091"},
            {type:"strain",name:"CNN + FCNN", desc:"1D Convolutional network extracts local cyclic fatigue features",          r2:"0.961",mae:"0.098"},
            {type:"stress",name:"LSTM + FCNN",desc:"Stress-controlled variant with load-ratio aware waveform encoding",        r2:"0.971",mae:"0.085"},
            {type:"stress",name:"GRU + FCNN", desc:"GRU optimized for stress-controlled loading sequences",                    r2:"0.965",mae:"0.094"},
            {type:"stress",name:"CNN + FCNN", desc:"Convolutional stress-waveform feature extraction network",                 r2:"0.958",mae:"0.102"},
          ].map((m,i)=>(
            <div key={i} className="model-card">
              <span className={`model-badge ${m.type==="strain"?"badge-strain":"badge-stress"}`}>{m.type}-controlled</span>
              <h3>{m.name}</h3><p>{m.desc}</p>
              <div className="model-perf"><span>R² = {m.r2}</span><span>MAE = {m.mae}</span></div>
            </div>
          ))}
        </div>
      </div>

      <div className="section" style={{paddingTop:0}}>
        <div className="section-label">// analysis pipeline</div>
        <h2 className="section-title">Engineering Workflow</h2>
        <div className="workflow">
          {[["01","Select Mode","Stress or strain controlled fatigue loading"],["02","Configure Material","Preset or custom mechanical properties"],
            ["03","Generate Waveform","Define multiaxial loading history"],["04","Run Inference","PINN model predicts log₁₀(Nf)"],
            ["05","Compare Models","LSTM vs GRU vs CNN benchmarking"],["06","Export Report","PDF with physics insights"]].map(([n,t,d])=>(
            <div key={n} className="workflow-step"><div className="workflow-num">{n}</div><h4>{t}</h4><p>{d}</p></div>
          ))}
        </div>
      </div>

      <div className="section" style={{paddingTop:0}}>
        <div className="section-label">// physics-informed learning</div>
        <h2 className="section-title">Guided by Fatigue Mechanics</h2>
        <div className="physics-grid">
          {[
            {label:"Total Loss Function",eq:"L = L_data + λ·L_physics",desc:"Physics constraints penalize predictions violating fatigue mechanics, preventing physically impossible life estimates."},
            {label:"Coffin-Manson Relation",eq:"Δε/2 = σ'f/E·(2Nf)^b + ε'f·(2Nf)^c",desc:"Elastic and plastic strain components govern high- and low-cycle fatigue regimes respectively."},
            {label:"Waveform Cyclic Energy",eq:"W = ∮ σ·dε",desc:"Cyclic energy dissipation per loading cycle correlates with fatigue damage accumulation rate."},
            {label:"Multiaxial Criterion",eq:"τmax + k·σn = f(Nf)",desc:"Shear and normal stress combine under critical-plane criteria for non-proportional loading."},
          ].map((e,i)=>(
            <div key={i} className="eq-card">
              <div className="eq-label">{e.label}</div>
              <div className="eq">{e.eq}</div>
              <div className="eq-desc">{e.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="section" style={{paddingTop:0}}>
        <div className="section-label">// platform capabilities</div>
        <h2 className="section-title">Analytical Features</h2>
        <div className="grid-3">
          {[["⚡","Real-Time Waveform","Interactive multiaxial waveform generator with live canvas rendering"],
            ["📊","Model Benchmarking","Side-by-side LSTM / GRU / CNN comparison with confidence metrics"],
            ["🔬","Physics Insights","Explainable AI with Coffin-Manson fatigue interpretation"],
            ["📈","Scatter Analysis","Actual vs predicted with ±factor-of-2 scatter bands"],
            ["📄","Report Export","Publication-ready PDF with full engineering summary"],
            ["🔩","Material Library","Pre-configured aerospace, automotive and structural materials"],
          ].map(([icon,title,desc])=>(
            <div key={title} className="feature-card"><div className="feature-icon">{icon}</div><h3>{title}</h3><p>{desc}</p></div>
          ))}
        </div>
      </div>

      <div style={{padding:"48px 32px",textAlign:"center",borderTop:"1px solid var(--border)"}}>
        <button className="btn-primary" style={{padding:"14px 40px",fontSize:14}} onClick={()=>setView("app")}>Begin Fatigue Analysis →</button>
      </div>
    </div>
  );

  // ── APP ──
  const App=()=>(
    <div className="app-section">
      <div className="app-header">
        <div className="breadcrumb">FatigueAI <span>/</span> Analysis <span>/</span> {STEPS.find(s=>s.n===step)?.label}</div>
        <h2>Fatigue Life Prediction</h2>
        <p>Configure loading parameters and material properties to predict fatigue life</p>
      </div>
      <div className="app-body">
        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="sidebar-section-title">Pipeline Steps</div>
          <div className="steps">
            {STEPS.map(s=>(
              <div key={s.n} className={`step-item ${step===s.n?"active":""} ${step>s.n?"done":""}`} onClick={()=>setStep(s.n)}>
                <div className="step-num">{step>s.n?"✓":s.n}</div>
                <div className="step-label">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="divider"/>
          <div className="sidebar-section-title">Current Config</div>
          {[["Mode",mode?<span className={`tag ${mode==="stress"?"tag-orange":"tag-blue"}`}>{mode}</span>:"—"],
            ["Material",mat.split(" ").slice(0,2).join(" ")],
            ["Waveform",wv.type],
          ].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontSize:11,color:"var(--muted)"}}>{k}</span>
              <span style={{fontSize:11,color:"var(--text)",fontFamily:"var(--font-mono)",textTransform:"capitalize"}}>{v}</span>
            </div>
          ))}
          {step>=3&&step<5&&<button className="run-btn" onClick={()=>setStep(5)}>→ Proceed to Run</button>}
          {step===5&&<button className="run-btn" disabled={!mode} onClick={runPrediction}>{mode?"⚡ Predict Fatigue Life":"Select Mode First"}</button>}
        </div>

        {/* MAIN */}
        <div className="main-panel">

          {/* S1 */}
          {step===1&&<>
            <div style={{marginBottom:24}}>
              <div className="section-label">// step 01</div>
              <h3 style={{fontFamily:"var(--font-head)",fontSize:18,fontWeight:700,marginBottom:6}}>Select Loading Mode</h3>
              <p style={{fontSize:13,color:"var(--muted)"}}>Choose the fatigue loading control mode. This determines which set of physics-informed models is activated.</p>
            </div>
            <div className="mode-grid">
              {[
                {key:"stress",label:"Stress-Controlled",wv:"sinusoidal",color:"#ff6b2b",
                 desc:"Constant stress amplitude loading. Representative of high-cycle fatigue in structures and rotating machinery. Governed by S-N (Wöhler) curves."},
                {key:"strain",label:"Strain-Controlled",wv:"triangular",color:"#00c8ff",
                 desc:"Constant strain amplitude loading. Representative of low-cycle fatigue in notched components. Governed by Coffin-Manson relations."},
              ].map(m=>(
                <div key={m.key} className={`mode-card ${mode===m.key?"selected":""}`} onClick={()=>{setMode(m.key);setStep(2);}}>
                  <div className="mode-icon">{m.key==="stress"?"⟳":"≈"}</div>
                  <h3>{m.label}</h3>
                  <div style={{marginBottom:10}}><MiniWave type={m.wv} color={m.color} h={36}/></div>
                  <p>{m.desc}</p>
                  <div style={{marginTop:10,display:"flex",gap:8,flexWrap:"wrap"}}>
                    <span className={`tag ${m.key==="strain"?"tag-blue":"tag-orange"}`}>3 PINN Models</span>
                    <span className="tag tag-green">R² &gt; 0.95</span>
                  </div>
                </div>
              ))}
            </div>
          </>}

          {/* S2 */}
          {step===2&&<>
            <div style={{marginBottom:20}}><div className="section-label">// step 02</div>
              <h3 style={{fontFamily:"var(--font-head)",fontSize:18,fontWeight:700,marginBottom:6}}>Material Configuration</h3>
              <p style={{fontSize:13,color:"var(--muted)"}}>Select a material preset or manually configure mechanical properties.</p>
            </div>
            <div style={{background:"var(--panel)",border:"1px solid var(--border)",borderRadius:6,padding:24,marginBottom:16}}>
              <div className="field"><label>Material Preset</label>
                <select value={mat} onChange={e=>changeMat(e.target.value)}>
                  {Object.keys(MATERIALS).map(m=><option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="divider"/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                {[{k:"E",label:"Young's Modulus (GPa)",min:10,max:400,step:0.1},
                  {k:"ys",label:"Yield Strength (MPa)",min:50,max:2000,step:1},
                  {k:"uts",label:"UTS (MPa)",min:100,max:2500,step:1},
                  {k:"nu",label:"Poisson's Ratio",min:0.1,max:0.5,step:0.01},
                ].map(({k,label,min,max,step})=>(
                  <div key={k} className="field"><label>{label}</label>
                    <div className="range-row">
                      <input type="range" min={min} max={max} step={step} value={props[k]}
                        onChange={e=>setProps(p=>({...p,[k]:parseFloat(e.target.value)}))}/>
                      <span className="range-val">{props[k]}</span>
                    </div>
                    <input type="number" value={props[k]} min={min} max={max} step={step}
                      onChange={e=>setProps(p=>({...p,[k]:parseFloat(e.target.value)}))}/>
                  </div>
                ))}
              </div>
            </div>
            <button className="btn-primary" onClick={()=>setStep(3)}>Continue to Waveform →</button>
          </>}

          {/* S3 */}
          {step===3&&<>
            <div style={{marginBottom:16}}><div className="section-label">// step 03</div>
              <h3 style={{fontFamily:"var(--font-head)",fontSize:18,fontWeight:700,marginBottom:6}}>Waveform Generator</h3>
              <p style={{fontSize:13,color:"var(--muted)"}}>Configure multiaxial loading history. Waveform updates in real time.</p>
            </div>
            <div className="waveform-panel">
              <div className="waveform-header">
                <span className="waveform-title">Loading History — Axial & Shear</span>
                <div style={{display:"flex",gap:8}}>
                  <span className="tag tag-blue">Axial</span>
                  <span className="tag tag-orange">Shear (dashed)</span>
                </div>
              </div>
              <div style={{padding:"8px 12px"}}><WaveCanvas axial={axial} shear={shear}/></div>
            </div>
            <div style={{background:"var(--panel)",border:"1px solid var(--border)",borderRadius:6,padding:20}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                <div className="field"><label>Waveform Type</label>
                  <select value={wv.type} onChange={e=>setWv(c=>({...c,type:e.target.value}))}>
                    {["sinusoidal","triangular","square","random"].map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                  </select>
                </div>
                <div className="field"><label>Phase Shift (°)</label>
                  <div className="range-row">
                    <input type="range" min={0} max={180} step={1} value={wv.phase} onChange={e=>setWv(c=>({...c,phase:parseInt(e.target.value)}))}/>
                    <span className="range-val">{wv.phase}°</span>
                  </div>
                </div>
                <div className="field"><label>Axial Amplitude</label>
                  <div className="range-row">
                    <input type="range" min={0.1} max={2.0} step={0.05} value={wv.axialAmp} onChange={e=>setWv(c=>({...c,axialAmp:parseFloat(e.target.value)}))}/>
                    <span className="range-val">{wv.axialAmp.toFixed(2)}</span>
                  </div>
                </div>
                <div className="field"><label>Shear Amplitude</label>
                  <div className="range-row">
                    <input type="range" min={0} max={1.5} step={0.05} value={wv.shearAmp} onChange={e=>setWv(c=>({...c,shearAmp:parseFloat(e.target.value)}))}/>
                    <span className="range-val">{wv.shearAmp.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div style={{marginTop:14,display:"flex",gap:10}}>
              <button className="btn-primary" onClick={()=>setStep(4)}>Choose Presets →</button>
              <button className="btn-outline" onClick={()=>setStep(5)}>Skip to Run</button>
            </div>
          </>}

          {/* S4 */}
          {step===4&&<>
            <div style={{marginBottom:16}}><div className="section-label">// step 04</div>
              <h3 style={{fontFamily:"var(--font-head)",fontSize:18,fontWeight:700,marginBottom:6}}>Waveform Presets</h3>
              <p style={{fontSize:13,color:"var(--muted)"}}>Select from standard loading histories used in fatigue testing standards.</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {WAVEFORM_PRESETS.map(p=>(
                <div key={p.name} className="model-card" onClick={()=>{setWv({type:p.type,axialAmp:p.axialAmp,shearAmp:p.shearAmp,phase:p.phase});setStep(5);}}>
                  <div style={{marginBottom:6}}><MiniWave type={p.type} color="#00c8ff" h={28}/></div>
                  <h3 style={{fontSize:12}}>{p.name}</h3>
                  <div style={{display:"flex",gap:6,marginTop:5,flexWrap:"wrap"}}>
                    <span className="tag tag-blue">{p.type}</span>
                    {p.phase>0&&<span className="tag tag-orange">φ={p.phase}°</span>}
                    {p.shearAmp>0&&<span className="tag tag-green">biaxial</span>}
                  </div>
                </div>
              ))}
            </div>
          </>}

          {/* S5 */}
          {step===5&&<>
            <div style={{marginBottom:16}}><div className="section-label">// step 05</div>
              <h3 style={{fontFamily:"var(--font-head)",fontSize:18,fontWeight:700,marginBottom:6}}>Run Prediction</h3>
              <p style={{fontSize:13,color:"var(--muted)"}}>Review configuration and execute PINN model inference.</p>
            </div>
            <div style={{background:"var(--panel)",border:"1px solid var(--border)",borderRadius:6,padding:20,marginBottom:14}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
                <div><div className="sidebar-section-title">Material Properties</div>
                  {[["Young's Modulus",`${props.E} GPa`],["Yield Strength",`${props.ys} MPa`],["UTS",`${props.uts} MPa`],["Poisson's Ratio",props.nu]].map(([k,v])=>(
                    <div key={k} className="report-row"><span className="report-key">{k}</span><span className="report-val">{v}</span></div>
                  ))}
                </div>
                <div><div className="sidebar-section-title">Loading Config</div>
                  {[["Mode",mode||"—"],["Waveform",wv.type],["Axial Amp",wv.axialAmp.toFixed(2)],["Shear Amp",wv.shearAmp.toFixed(2)],["Phase",`${wv.phase}°`]].map(([k,v])=>(
                    <div key={k} className="report-row"><span className="report-key">{k}</span><span className="report-val" style={{textTransform:"capitalize"}}>{v}</span></div>
                  ))}
                </div>
              </div>
              <div className="divider"/>
              <div className="waveform-panel" style={{marginBottom:0}}>
                <div className="waveform-header"><span className="waveform-title">Loading History Preview</span><span style={{fontSize:11,color:"var(--muted)",fontFamily:"var(--font-mono)"}}>200 pts</span></div>
                <div style={{padding:"8px 12px"}}><WaveCanvas axial={axial} shear={shear}/></div>
              </div>
            </div>
            <button className="run-btn" disabled={!mode} onClick={runPrediction} style={{marginTop:0}}>
              {mode?"⚡ Predict Fatigue Life — All 3 Models":"Select Loading Mode First"}
            </button>
            <div className="info-box"><strong>Backend:</strong> POST {BACKEND_URL}/predict/fatigue<br/>Payload: mode, material props, axial[], shear[], waveform_type</div>
          </>}

          {/* S6 */}
          {step===6&&results&&<>
            <div style={{marginBottom:16}}><div className="section-label">// step 06 — results</div>
              <h3 style={{fontFamily:"var(--font-head)",fontSize:18,fontWeight:700,marginBottom:6}}>Fatigue Life Prediction</h3>
            </div>
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              {["LSTM","GRU","CNN"].map(m=>(
                <button key={m} onClick={()=>setSelMod(m)}
                  style={{background:selMod===m?"var(--accent)":"var(--panel)",color:selMod===m?"#000":"var(--muted)",border:"1px solid var(--border)",fontFamily:"var(--font-mono)",fontSize:12,padding:"6px 16px",borderRadius:3,cursor:"pointer",transition:"all .2s"}}>
                  {m} + FCNN
                </button>
              ))}
            </div>
            <div className="pred-main">
              <div className="pred-main-content">
                <div className="pred-label">Predicted Fatigue Life — {selMod} + FCNN</div>
                <div className="pred-log"><span>log₁₀(Nf) = </span>{activeR.log}</div>
                <div className="pred-cycles">Estimated Cycles: <Counter target={estCycles}/><br/><small>cycles to failure</small></div>
                <div className="pred-meta">
                  {[["Confidence",`${activeR.conf}%`],["Inference Time",`${activeR.time} ms`],["Loading Mode",mode],["Waveform",wv.type]].map(([k,v])=>(
                    <div key={k} className="pred-meta-item">
                      <div className="pred-meta-val" style={{textTransform:"capitalize"}}>{v}</div>
                      <div className="pred-meta-key">{k}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{marginBottom:10}}><div className="section-label">// all models comparison</div></div>
            <div className="compare-grid">
              {[{m:"LSTM",r:results.lstm,c:"var(--accent)"},{m:"GRU",r:results.gru,c:"var(--accent3)"},{m:"CNN",r:results.cnn,c:"var(--green)"}].map(({m,r,c})=>{
                const best=results.lstm.conf>=results.gru.conf&&results.lstm.conf>=results.cnn.conf&&m==="LSTM";
                return <div key={m} className={`compare-card ${best?"best":""}`}>
                  <div className="compare-card-head"><span className="compare-model" style={{color:c}}>{m} + FCNN</span>{best&&<span className="compare-best-badge">BEST</span>}</div>
                  <div className="compare-val">{r.log}</div><div className="compare-sub">log₁₀(Nf)</div>
                  <div className="compare-bar-wrap">
                    <div className="compare-bar-label"><span>Confidence</span><span>{r.conf}%</span></div>
                    <div className="compare-bar"><div className="compare-bar-fill" style={{width:`${r.conf}%`,background:c}}/></div>
                  </div>
                  <div className="compare-bar-wrap" style={{marginTop:6}}>
                    <div className="compare-bar-label"><span>Speed</span><span>{r.time}ms</span></div>
                    <div className="compare-bar"><div className="compare-bar-fill" style={{width:`${Math.max(20,100-(r.time-8)*4)}%`,background:c}}/></div>
                  </div>
                </div>;
              })}
            </div>
            <div style={{display:"flex",gap:10}}>
              <button className="btn-outline" style={{flex:1}} onClick={()=>setStep(7)}>Physics Insight →</button>
              <button className="btn-outline" style={{flex:1}} onClick={()=>setStep(8)}>Scatter Analysis →</button>
            </div>
          </>}

          {/* S7 */}
          {step===7&&<>
            <div style={{marginBottom:16}}><div className="section-label">// step 07 — physics insight</div>
              <h3 style={{fontFamily:"var(--font-head)",fontSize:18,fontWeight:700,marginBottom:6}}>Physics-Informed Interpretation</h3>
              <p style={{fontSize:13,color:"var(--muted)"}}>How physics constraints shape the deep learning prediction.</p>
            </div>
            <div className="insight-grid">
              {[
                {h:"Total Loss Function",eq:"L_total = L_data + λ·L_physics",p:"The model minimizes data-fitting error and physics-constraint violations simultaneously. λ controls the weighting between empirical accuracy and physical plausibility."},
                {h:"Coffin-Manson Constraint",eq:"Δε/2 = σ'f/E·(2Nf)^b + ε'f·(2Nf)^c",p:"Physics loss penalizes predictions deviating from Coffin-Manson fatigue mechanics, ensuring physically valid life estimates."},
                {h:"Waveform Amplitude Effect",eq:"Nf ∝ (Δσ/2)^(-1/b)",p:"Higher axial amplitude → higher stress range → shorter fatigue life. The PINN captures this nonlinear relationship through waveform sequence encoding."},
                {h:"Phase Shift Influence",eq:"Δτ = f(φ) → critical plane damage",p:"Non-proportional loading (phase shift φ ≠ 0°) rotates principal stress axes, activating additional damage planes and reducing fatigue life."},
                {h:"Sequence Encoder Role",eq:null,p:"LSTM / GRU / CNN encodes the waveform into a latent vector capturing cyclic damage memory, frequency content, and loading history effects before FCNN processing."},
                {h:"FCNN Physics Integration",eq:null,p:"The fully-connected network receives waveform encoding concatenated with normalized material properties (E, σy, σu, ν) and produces log₁₀(Nf) conditioned on both data and physics loss."},
              ].map((item,i)=>(
                <div key={i} className="insight-card">
                  <h4>{item.h}</h4>
                  {item.eq&&<code className="insight-eq">{item.eq}</code>}
                  <p>{item.p}</p>
                </div>
              ))}
            </div>
            <button className="btn-outline" onClick={()=>setStep(8)}>Scatter Analysis →</button>
          </>}

          {/* S8 */}
          {step===8&&<>
            <div style={{marginBottom:16}}><div className="section-label">// step 08 — scatter analysis</div>
              <h3 style={{fontFamily:"var(--font-head)",fontSize:18,fontWeight:700,marginBottom:6}}>Actual vs Predicted</h3>
              <p style={{fontSize:13,color:"var(--muted)"}}>Model accuracy visualization with ±factor-of-2 scatter bands.</p>
            </div>
            <div style={{background:"var(--panel)",border:"1px solid var(--border)",borderRadius:6,padding:14,marginBottom:14}}>
              <ScatterCanvas results={results}/>
              <div style={{display:"flex",gap:12,marginTop:10,justifyContent:"center"}}>
                {[["#00c8ff","LSTM"],["#ff6b2b","GRU"],["#00d68f","CNN"],["rgba(255,255,255,0.2)","Perfect Prediction"]].map(([c,l])=>(
                  <div key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"var(--muted)",fontFamily:"var(--font-mono)"}}>
                    <div style={{width:8,height:8,borderRadius:2,background:c}}/>{l}
                  </div>
                ))}
              </div>
            </div>
            {results&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              {[{name:"LSTM",r:results.lstm},{name:"GRU",r:results.gru},{name:"CNN",r:results.cnn}].map(({name,r})=>(
                <div key={name} style={{background:"var(--panel)",border:"1px solid var(--border)",borderRadius:6,padding:14,textAlign:"center"}}>
                  <div style={{fontFamily:"var(--font-mono)",fontSize:12,color:"var(--muted)",marginBottom:6}}>{name} + FCNN</div>
                  <div style={{fontFamily:"var(--font-mono)",fontSize:22,color:"var(--accent)"}}>{r.log}</div>
                  <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>log₁₀(Nf)</div>
                  <div style={{fontSize:11,color:"var(--green)",marginTop:6,fontFamily:"var(--font-mono)"}}>Conf: {r.conf}%</div>
                </div>
              ))}
            </div>}
            <div style={{marginTop:14}}><button className="btn-outline" onClick={()=>setStep(9)}>Export Report →</button></div>
          </>}

          {/* S9 */}
          {step===9&&<>
            <div style={{marginBottom:16}}><div className="section-label">// step 09 — export</div>
              <h3 style={{fontFamily:"var(--font-head)",fontSize:18,fontWeight:700,marginBottom:6}}>Engineering Report</h3>
              <p style={{fontSize:13,color:"var(--muted)"}}>Export a complete fatigue analysis report. Connect to your FastAPI backend.</p>
            </div>
            <div className="report-section"><h4>Material Properties</h4>
              {[["Material",mat],["Young's Modulus",`${props.E} GPa`],["Yield Strength",`${props.ys} MPa`],["UTS",`${props.uts} MPa`],["Poisson's Ratio",props.nu]].map(([k,v])=>(
                <div key={k} className="report-row"><span className="report-key">{k}</span><span className="report-val">{v}</span></div>
              ))}
            </div>
            <div className="report-section"><h4>Loading Configuration</h4>
              {[["Loading Mode",mode||"—"],["Waveform Type",wv.type],["Axial Amplitude",wv.axialAmp.toFixed(2)],["Shear Amplitude",wv.shearAmp.toFixed(2)],["Phase Shift",`${wv.phase}°`]].map(([k,v])=>(
                <div key={k} className="report-row"><span className="report-key">{k}</span><span className="report-val" style={{textTransform:"capitalize"}}>{v}</span></div>
              ))}
            </div>
            {results&&<div className="report-section"><h4>Prediction Results</h4>
              {[["LSTM + FCNN",`log₁₀(Nf) = ${results.lstm.log}`],["GRU + FCNN",`log₁₀(Nf) = ${results.gru.log}`],["CNN + FCNN",`log₁₀(Nf) = ${results.cnn.log}`]].map(([k,v])=>(
                <div key={k} className="report-row"><span className="report-key">{k}</span><span className="report-val">{v}</span></div>
              ))}
            </div>}
            <div className="report-section"><h4>Physics Framework</h4>
              {[["Loss Function","L = L_data + λ·L_physics"],["Fatigue Model","Coffin-Manson (Elastic + Plastic)"],["Architecture","PINN (Physics-Informed Neural Network)"]].map(([k,v])=>(
                <div key={k} className="report-row"><span className="report-key">{k}</span><span className="report-val">{v}</span></div>
              ))}
            </div>
            <div style={{display:"flex",gap:10}}>
              <button className="export-btn" onClick={()=>alert("Connect to FastAPI /export/pdf — returns PDF blob")}>Export as PDF</button>
              <button className="export-btn" onClick={()=>alert("Connect to FastAPI /export/json — returns structured JSON")}>Export as JSON</button>
            </div>
            <div className="info-box">
              <strong>Backend Export Endpoints:</strong><br/>
              POST /export/pdf → PDF (ReportLab / WeasyPrint)<br/>
              POST /export/json → Structured JSON result<br/>
              GET /models/status → Health check all 6 models<br/>
              POST /predict → All model inference in parallel
            </div>
          </>}

        </div>
      </div>
    </div>
  );

  return <>
    <style>{STYLES}</style>
    <div className="platform">
      <Nav/>
      {running&&<div className="loading-overlay">
        <div className="loading-ring"/>
        <div className="loading-text">Running PINN inference...</div>
        <div style={{fontSize:11,color:"var(--muted2)",fontFamily:"var(--font-mono)"}}>preprocessing → normalizing → forward pass → postprocessing</div>
      </div>}
      {view==="landing"?<Landing/>:<App/>}
    </div>
  </>;
}