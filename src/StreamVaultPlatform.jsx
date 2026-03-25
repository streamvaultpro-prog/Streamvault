import { useState, useEffect, useRef } from "react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// ─── GLOBAL STYLES ────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  :root{
    --gold:#F5A623;--gold2:#E8920F;--dark:#06080F;--dark2:#0B0F1C;--dark3:#111827;
    --card:#0F1420;--border:rgba(255,255,255,0.07);--text:#E2E8F0;--muted:#64748B;
    --green:#22C55E;--red:#EF4444;--blue:#3B82F6;--purple:#A855F7;
  }
  body{background:var(--dark);color:var(--text);font-family:'Outfit',sans-serif;}
  ::-webkit-scrollbar{width:4px;height:4px}
  ::-webkit-scrollbar-track{background:var(--dark2)}
  ::-webkit-scrollbar-thumb{background:var(--gold);border-radius:2px}
  .syne{font-family:'Syne',sans-serif;}
  .outfit{font-family:'Outfit',sans-serif;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
  @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
  @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(245,166,35,.2)}50%{box-shadow:0 0 40px rgba(245,166,35,.4)}}
  .fade-up{animation:fadeUp .6s ease forwards;}
  .fade-in{animation:fadeIn .4s ease forwards;}
  .gold-glow{animation:glow 3s ease-in-out infinite;}
  .live-pulse{animation:pulse 1.4s ease-in-out infinite;}
  .spin{animation:spin 1s linear infinite;}
  .hover-lift{transition:transform .2s,box-shadow .2s;}
  .hover-lift:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(0,0,0,.5);}
  .hover-gold:hover{border-color:var(--gold)!important;color:var(--gold)!important;}
  .btn{cursor:pointer;border:none;font-family:'Outfit',sans-serif;font-weight:600;transition:all .2s;}
  .btn-gold{background:linear-gradient(135deg,var(--gold),var(--gold2));color:#000;border-radius:8px;}
  .btn-gold:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(245,166,35,.35);}
  .btn-outline{background:transparent;color:var(--text);border:1px solid var(--border);border-radius:8px;}
  .btn-outline:hover{border-color:var(--gold);color:var(--gold);}
  .card{background:var(--card);border:1px solid var(--border);border-radius:14px;}
  .badge{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:600;}
  .badge-green{background:rgba(34,197,94,.12);color:var(--green);border:1px solid rgba(34,197,94,.25);}
  .badge-gold{background:rgba(245,166,35,.12);color:var(--gold);border:1px solid rgba(245,166,35,.25);}
  .badge-red{background:rgba(239,68,68,.12);color:var(--red);border:1px solid rgba(239,68,68,.25);}
  .badge-blue{background:rgba(59,130,246,.12);color:var(--blue);border:1px solid rgba(59,130,246,.25);}
  .table-row:hover{background:rgba(255,255,255,.025)!important;}
  input,select{background:var(--dark3);border:1px solid var(--border);color:var(--text);border-radius:8px;padding:10px 14px;font-family:'Outfit',sans-serif;font-size:14px;width:100%;outline:none;transition:border .2s;}
  input:focus,select:focus{border-color:var(--gold);}
  .grid-bg{background-image:linear-gradient(rgba(245,166,35,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(245,166,35,.04) 1px,transparent 1px);background-size:50px 50px;}
  .ticker-wrap{overflow:hidden;white-space:nowrap;}
  .ticker-inner{display:inline-flex;gap:60px;animation:ticker 25s linear infinite;}
  .tooltip-custom{background:#0B0F1C!important;border:1px solid rgba(245,166,35,.2)!important;border-radius:8px!important;color:#E2E8F0!important;font-family:'Outfit',sans-serif!important;}
`;

// ─── DATA ─────────────────────────────────────────────────────────
const PLANS = [
  { id:"starter", name:"Starter", mo:5.99, yr:49.99, devices:1, channels:"12,000+", vod:"25,000+", quality:"HD 1080p", color:"#3B82F6", features:["HD Streaming","1 Screen","25K VOD","7-Day Catchup","Email Support","All US Channels"] },
  { id:"pro", name:"Pro", mo:9.99, yr:79.99, devices:3, channels:"35,000+", vod:"80,000+", quality:"4K Ultra HD", color:"#F5A623", popular:true, features:["4K Ultra HD","3 Screens","80K VOD","30-Day Catchup","Anti-Buffer Pro","Live Chat 24/7","Sports PPV","International Packs"] },
  { id:"elite", name:"Elite", mo:14.99, yr:119.99, devices:6, channels:"55,000+", vod:"140,000+", quality:"4K HDR / 8K", color:"#22C55E", features:["4K HDR + 8K","6 Screens","140K VOD","60-Day Catchup","Dedicated Server","Built-in VPN","Priority Queue","Multi-Sub Manager","Reseller Tools"] },
  { id:"reseller", name:"Reseller", mo:39.99, yr:349.99, devices:100, channels:"55,000+", vod:"140,000+", quality:"All Formats", color:"#A855F7", features:["100 Connections","White-Label Ready","Full Panel Access","Auto-Provisioning","Bulk Pricing","API Access","24/7 Dedicated Line","Monthly Reports"] },
];
const STEPS = [
  { n:"01", icon:"💳", title:"Choose Your Plan", desc:"Pick Starter, Pro, Elite, or Reseller. Pay securely via card, PayPal, or crypto. Instant confirmation email." },
  { n:"02", icon:"📧", title:"Receive Credentials", desc:"Within 60 seconds, you receive your M3U playlist URL, username, and password to your email inbox." },
  { n:"03", icon:"📲", title:"Download Your App", desc:"Install TiviMate (Android/TV), Smarters Pro (iOS/Android), or GSE Smart IPTV — all free on app stores." },
  { n:"04", icon:"🔐", title:"Enter Your Details", desc:"Open your app → Add Playlist → Paste your M3U URL or enter your Xtream Codes credentials." },
  { n:"05", icon:"⚙️", title:"Auto-Setup Channels", desc:"The app auto-loads all 55,000+ channels, EPG guide, and VOD library. Takes under 2 minutes." },
  { n:"06", icon:"📺", title:"Start Watching", desc:"Browse channels, set favorites, schedule recordings, and enjoy buffer-free 4K streaming instantly." },
];
const REVENUE_DATA = [
  {m:"Jan",rev:4200,subs:180},{m:"Feb",rev:5100,subs:212},{m:"Mar",rev:6800,subs:271},
  {m:"Apr",rev:7200,subs:298},{m:"May",rev:9100,subs:367},{m:"Jun",rev:11400,subs:441},
  {m:"Jul",rev:13200,subs:510},{m:"Aug",rev:15800,subs:604},{m:"Sep",rev:17100,subs:658},
  {m:"Oct",rev:19600,subs:744},{m:"Nov",rev:22300,subs:851},{m:"Dec",rev:26100,subs:987},
];
const CHURN_DATA = [
  {m:"Q1",kept:92,churned:8},{m:"Q2",kept:94,churned:6},{m:"Q3",kept:95,churned:5},{m:"Q4",kept:96,churned:4},
];
const PLAN_SPLIT = [
  {name:"Pro",value:44,color:"#F5A623"},{name:"Elite",value:27,color:"#22C55E"},
  {name:"Starter",value:20,color:"#3B82F6"},{name:"Reseller",value:9,color:"#A855F7"},
];
const CUSTOMERS = [
  {id:"SV-1001",name:"Marcus Johnson",email:"m.johnson@gmail.com",plan:"Pro",status:"Active",devices:3,joined:"Dec 12, 2024",revenue:"$9.99",expires:"Jan 12, 2026",usage:"94%"},
  {id:"SV-1002",name:"Tanya Williams",email:"t.williams@icloud.com",plan:"Elite",status:"Active",devices:5,joined:"Nov 3, 2024",revenue:"$14.99",expires:"Nov 3, 2025",usage:"87%"},
  {id:"SV-1003",name:"Ray Chen",email:"raychen@outlook.com",plan:"Starter",status:"Active",devices:1,joined:"Jan 5, 2025",revenue:"$5.99",expires:"Feb 5, 2026",usage:"62%"},
  {id:"SV-1004",name:"Sandra Okafor",email:"s.okafor@gmail.com",plan:"Reseller",status:"Active",devices:85,joined:"Oct 20, 2024",revenue:"$39.99",expires:"Oct 20, 2025",usage:"85%"},
  {id:"SV-1005",name:"Derek Mills",email:"dmills@yahoo.com",plan:"Pro",status:"Expired",devices:0,joined:"Aug 14, 2024",revenue:"$9.99",expires:"Aug 14, 2025",usage:"0%"},
  {id:"SV-1006",name:"Priya Patel",email:"priya.p@gmail.com",plan:"Elite",status:"Active",devices:4,joined:"Mar 2, 2025",revenue:"$14.99",expires:"Mar 2, 2026",usage:"91%"},
  {id:"SV-1007",name:"James Torres",email:"jtorres@hotmail.com",plan:"Pro",status:"Trial",devices:2,joined:"Mar 20, 2025",revenue:"$0",expires:"Mar 27, 2025",usage:"78%"},
  {id:"SV-1008",name:"Kim Anderson",email:"kim.a@gmail.com",plan:"Starter",status:"Active",devices:1,joined:"Feb 10, 2025",revenue:"$5.99",expires:"Mar 10, 2026",usage:"45%"},
];
const SERVERS = [
  {name:"US-East-01",loc:"New York",load:34,status:"Optimal",uptime:"99.98%",users:1240},
  {name:"US-West-02",loc:"Los Angeles",load:51,status:"Optimal",uptime:"99.95%",users:980},
  {name:"EU-UK-01",loc:"London",load:28,status:"Optimal",uptime:"100%",users:760},
  {name:"EU-DE-02",loc:"Frankfurt",load:19,status:"Optimal",uptime:"99.99%",users:440},
  {name:"AS-SG-01",loc:"Singapore",load:67,status:"Normal",uptime:"99.91%",users:390},
  {name:"CA-ON-01",loc:"Toronto",load:22,status:"Optimal",uptime:"99.97%",users:310},
];
const ALERTS = [
  {type:"success",msg:"Backup CDN activated — US-West load balanced",time:"2m ago"},
  {type:"info",msg:"87 new subscriptions in the last 24 hours",time:"1h ago"},
  {type:"warning",msg:"SV-1005 subscription expired — renewal email sent",time:"3h ago"},
  {type:"success",msg:"All 247 servers reporting healthy status",time:"5h ago"},
  {type:"info",msg:"Monthly revenue report generated: $26,100",time:"1d ago"},
];
const TICKETS = [
  {id:"TK-001",user:"Ray Chen",issue:"App not loading channels",priority:"High",status:"Open",time:"1h ago"},
  {id:"TK-002",user:"James Torres",issue:"Setup help needed - TiviMate",priority:"Normal",status:"In Progress",time:"3h ago"},
  {id:"TK-003",user:"Kim Anderson",issue:"Billing question",priority:"Low",status:"Resolved",time:"6h ago"},
];

// ─── APP ──────────────────────────────────────────────────────────
export default function StreamVaultPlatform() {
  const [view, setView] = useState("landing"); // landing | admin | customer | pricing | howto
  const [adminTab, setAdminTab] = useState("overview");
  const [custTab, setCustTab] = useState("dashboard");
  const [billing, setBilling] = useState("monthly");
  const [searchCust, setSearchCust] = useState("");
  const [toast, setToast] = useState(null);
  const [liveStats, setLiveStats] = useState({ viewers: 187432, servers: 247, uptime: 99.9 });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showOnboard, setShowOnboard] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setLiveStats(s => ({ ...s, viewers: s.viewers + Math.floor(Math.random() * 20 - 8) }));
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredCustomers = CUSTOMERS.filter(c =>
    c.name.toLowerCase().includes(searchCust.toLowerCase()) ||
    c.email.toLowerCase().includes(searchCust.toLowerCase()) ||
    c.plan.toLowerCase().includes(searchCust.toLowerCase())
  );

  return (
    <div style={{ fontFamily: "'Outfit',sans-serif", background: "#06080F", minHeight: "100vh", color: "#E2E8F0" }}>
      <style>{STYLES}</style>

      {/* TOAST */}
      {toast && (
        <div className="fade-in" style={{ position: "fixed", bottom: 24, right: 24, zIndex: 999, background: toast.type === "success" ? "#052e16" : "#1c0f0f", border: `1px solid ${toast.type === "success" ? "#22C55E" : "#EF4444"}`, borderRadius: 10, padding: "12px 20px", fontSize: 14, color: toast.type === "success" ? "#22C55E" : "#EF4444", display: "flex", alignItems: "center", gap: 8, maxWidth: 320 }}>
          {toast.type === "success" ? "✅" : "⚠️"} {toast.msg}
        </div>
      )}

      {/* ── NAVIGATION ── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(6,8,15,0.95)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div onClick={() => setView("landing")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <div style={{ width: 34, height: 34, background: "linear-gradient(135deg,#F5A623,#E8920F)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📡</div>
          <span className="syne" style={{ fontSize: 18, fontWeight: 800, letterSpacing: 2, color: "#F5A623" }}>STREAMVAULT</span>
        </div>
        <div className="outfit" style={{ display: "flex", gap: 6 }}>
          {[["🏠 Home","landing"],["💰 Pricing","pricing"],["📋 How It Works","howto"],["👤 My Account","customer"],["⚙️ Admin","admin"]].map(([label, v]) => (
            <button key={v} onClick={() => setView(v)} className="btn" style={{ padding: "7px 14px", borderRadius: 7, fontSize: 13, background: view === v ? "rgba(245,166,35,.12)" : "transparent", color: view === v ? "#F5A623" : "#64748B", border: `1px solid ${view === v ? "rgba(245,166,35,.3)" : "transparent"}`, transition: "all .2s" }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-outline" style={{ padding: "8px 18px", fontSize: 13 }} onClick={() => setView("customer")}>Sign In</button>
          <button className="btn btn-gold" style={{ padding: "8px 18px", fontSize: 13 }} onClick={() => { setView("pricing"); showToast("Free trial — no card needed!"); }}>Free Trial</button>
        </div>
      </nav>

      <div style={{ paddingTop: 65 }}>
        {view === "landing" && <LandingView setView={setView} liveStats={liveStats} showToast={showToast} />}
        {view === "pricing" && <PricingView billing={billing} setBilling={setBilling} showToast={showToast} setView={setView} />}
        {view === "howto" && <HowToView setView={setView} />}
        {view === "customer" && <CustomerPortal tab={custTab} setTab={setCustTab} showToast={showToast} showOnboard={showOnboard} setShowOnboard={setShowOnboard} />}
        {view === "admin" && <AdminDashboard tab={adminTab} setTab={setAdminTab} customers={filteredCustomers} allCustomers={CUSTOMERS} search={searchCust} setSearch={setSearchCust} showToast={showToast} selectedCustomer={selectedCustomer} setSelectedCustomer={setSelectedCustomer} liveStats={liveStats} />}
      </div>
    </div>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────
function LandingView({ setView, liveStats, showToast }) {
  const features = [
    { icon: "⚡", title: "Zero-Buffer Engine™", desc: "Adaptive bitrate tech adjusts in <2ms. Tested under 10,000 concurrent streams — not a single freeze." },
    { icon: "🌐", title: "55,000+ Live Channels", desc: "US, UK, CA, AU, and 60+ countries. Every sport, movie channel, news outlet, and PPV event." },
    { icon: "🛡️", title: "99.9% Uptime SLA", desc: "Triple-redundant CDN across 12 global regions. Contractual uptime guarantee — or your money back." },
    { icon: "📱", title: "Any Device", desc: "Smart TV, Firestick, Apple TV, iOS, Android, PC, MAG box — one account, unlimited screens (by plan)." },
    { icon: "⏮️", title: "60-Day Catchup TV", desc: "Miss a game? Rewind any channel up to 60 days. Full Electronic Program Guide included." },
    { icon: "🔒", title: "VPN + Privacy Shield", desc: "Elite plan includes full VPN. No ISP throttling, no tracking, complete streaming anonymity." },
  ];

  return (
    <div>
      {/* Ticker */}
      <div style={{ background: "#F5A623", padding: "5px 0", overflow: "hidden" }}>
        <div className="ticker-inner outfit" style={{ fontSize: 12, fontWeight: 700, color: "#000", gap: 80 }}>
          {[...Array(4)].map((_, i) => <span key={i}>🔴 LIVE: {liveStats.viewers.toLocaleString()} VIEWERS &nbsp;|&nbsp; ⚡ ZERO BUFFER &nbsp;|&nbsp; ✅ {liveStats.servers} ACTIVE SERVERS &nbsp;|&nbsp; 📺 55,000+ CHANNELS &nbsp;|&nbsp; 🌍 99.9% UPTIME &nbsp;|&nbsp;</span>)}
        </div>
      </div>

      {/* Hero */}
      <section className="grid-bg" style={{ minHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "80px 24px 60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 55% at 50% 40%, rgba(245,166,35,.07) 0%, transparent 70%)" }} />
        <div style={{ position: "relative", maxWidth: 860 }} className="fade-up">
          <div className="badge badge-green" style={{ marginBottom: 24, fontSize: 12 }}>
            <span className="live-pulse" style={{ width: 7, height: 7, background: "#22C55E", borderRadius: "50%", display: "inline-block" }} />
            {liveStats.viewers.toLocaleString()} viewers streaming right now
          </div>
          <h1 className="syne" style={{ fontSize: "clamp(44px,7vw,88px)", lineHeight: .92, fontWeight: 800, letterSpacing: -1, marginBottom: 24 }}>
            <span style={{ background: "linear-gradient(180deg,#fff 40%,#64748B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>THE LAST IPTV</span><br />
            <span style={{ color: "#F5A623" }}>YOU'LL EVER NEED.</span>
          </h1>
          <p className="outfit" style={{ fontSize: 18, color: "#64748B", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.75, fontWeight: 400 }}>
            55,000+ live channels. 140,000+ movies. Zero buffering, guaranteed. Starting at <strong style={{ color: "#F5A623" }}>$5.99/month</strong> with a free 7-day trial.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn btn-gold" style={{ padding: "14px 36px", fontSize: 15, borderRadius: 10 }} onClick={() => setView("pricing")}>Start Free Trial →</button>
            <button className="btn btn-outline" style={{ padding: "14px 36px", fontSize: 15, borderRadius: 10 }} onClick={() => setView("howto")}>How It Works</button>
          </div>
          {/* Stats */}
          <div style={{ display: "flex", gap: 40, justifyContent: "center", marginTop: 60, flexWrap: "wrap" }}>
            {[["55K+","Live Channels"],["140K+","VOD Titles"],["99.9%","Uptime SLA"],["<2ms","Buffer Time"],["247","Active Servers"]].map(([v, l]) => (
              <div key={l}>
                <div className="syne" style={{ fontSize: 34, fontWeight: 800, color: "#F5A623" }}>{v}</div>
                <div className="outfit" style={{ fontSize: 11, color: "#374151", letterSpacing: 1, textTransform: "uppercase" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "80px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 className="syne" style={{ fontSize: 42, fontWeight: 800, marginBottom: 10 }}>Why StreamVault Wins</h2>
          <p className="outfit" style={{ color: "#64748B", fontSize: 16, maxWidth: 480, margin: "0 auto" }}>We studied every weakness in competing IPTV services and engineered solutions.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 }}>
          {features.map(f => (
            <div key={f.title} className="card hover-lift" style={{ padding: "26px 24px", transition: "all .2s", cursor: "default" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(245,166,35,.3)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}>
              <div style={{ fontSize: 30, marginBottom: 14 }}>{f.icon}</div>
              <div className="syne" style={{ fontSize: 16, fontWeight: 700, color: "#F5A623", marginBottom: 8 }}>{f.title}</div>
              <div className="outfit" style={{ fontSize: 13, color: "#64748B", lineHeight: 1.75 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison table */}
      <section style={{ padding: "60px 32px", maxWidth: 900, margin: "0 auto" }}>
        <h2 className="syne" style={{ fontSize: 36, fontWeight: 800, textAlign: "center", marginBottom: 36 }}>StreamVault vs. The Competition</h2>
        <div className="card" style={{ overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }} className="outfit">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,.07)" }}>
                {["Feature","StreamVault","IPTV US","Kemo IPTV","LexonStream"].map((h, i) => (
                  <th key={h} style={{ padding: "14px 18px", textAlign: i === 0 ? "left" : "center", color: i === 1 ? "#F5A623" : "#64748B", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Buffer-Free Guarantee","✅ Engine™","⚠️ Claimed","⚠️ Claimed","⚠️ Claimed"],
                ["Uptime SLA","✅ 99.9%","✅ 99.9%","✅ 99.9%","✅ 99.9%"],
                ["Starting Price","✅ $5.99/mo","$7.40/mo","N/A","$5.75/mo"],
                ["Built-in VPN","✅ Elite Plan","❌ No","❌ No","❌ No"],
                ["60-Day Catchup","✅ Yes","❌ No","❌ No","❌ No"],
                ["Admin Dashboard","✅ Included","❌ No","❌ No","❌ No"],
                ["Auto-Provisioning","✅ <60 sec","Manual","Manual","Manual"],
                ["Reseller Tools","✅ Full Panel","Limited","❌ No","❌ No"],
              ].map(([feat, ...vals]) => (
                <tr key={feat} className="table-row" style={{ borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                  <td style={{ padding: "13px 18px", color: "#9CA3AF" }}>{feat}</td>
                  {vals.map((v, i) => (
                    <td key={i} style={{ padding: "13px 18px", textAlign: "center", color: i === 0 ? "#22C55E" : "#64748B", fontWeight: i === 0 ? 600 : 400 }}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 32px", textAlign: "center" }}>
        <div className="card gold-glow" style={{ maxWidth: 620, margin: "0 auto", padding: "56px 40px", background: "linear-gradient(135deg, #0B0F1C, #0F1420)" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📡</div>
          <h2 className="syne" style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>Ready to cut the cord?</h2>
          <p className="outfit" style={{ color: "#64748B", marginBottom: 28, fontSize: 15 }}>7-day free trial. No credit card. Cancel anytime. Setup in under 5 minutes.</p>
          <button className="btn btn-gold" style={{ padding: "15px 44px", fontSize: 16, borderRadius: 10 }} onClick={() => setView("pricing")}>Get Started Free →</button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,.05)", padding: "32px", textAlign: "center", color: "#374151", fontSize: 13 }} className="outfit">
        <div className="syne" style={{ color: "#F5A623", fontSize: 20, fontWeight: 800, letterSpacing: 2, marginBottom: 8 }}>STREAMVAULT</div>
        <p style={{ marginBottom: 12 }}>55,000+ channels · Zero buffering · Always on · Contact: streamvaultpro@gmail.com</p>
        <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>
          {["Privacy","Terms","Support","Resellers","API Docs"].map(item => (
            <span key={item} style={{ cursor: "pointer", transition: "color .2s" }} onMouseEnter={e => e.target.style.color="#F5A623"} onMouseLeave={e => e.target.style.color="#374151"}>{item}</span>
          ))}
        </div>
        <p style={{ marginTop: 16, color: "#1F2937", fontSize: 11 }}>© 2026 StreamVault Technologies LLC. For entertainment purposes only.</p>
      </footer>
    </div>
  );
}

// ─── PRICING PAGE ─────────────────────────────────────────────────
function PricingView({ billing, setBilling, showToast, setView }) {
  return (
    <div style={{ padding: "60px 32px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 className="syne" style={{ fontSize: 52, fontWeight: 800, marginBottom: 10 }}>Simple, Honest Pricing</h1>
        <p className="outfit" style={{ color: "#64748B", fontSize: 16, marginBottom: 28 }}>No hidden fees. No throttling. No contracts. Cancel anytime.</p>
        <div style={{ display: "inline-flex", background: "#0B0F1C", borderRadius: 100, padding: 4, border: "1px solid rgba(255,255,255,.07)" }}>
          {["monthly","yearly"].map(b => (
            <button key={b} onClick={() => setBilling(b)} className="btn outfit" style={{ padding: "8px 24px", borderRadius: 100, background: billing === b ? "#F5A623" : "transparent", color: billing === b ? "#000" : "#64748B", fontSize: 13, fontWeight: 600, textTransform: "capitalize" }}>
              {b} {b === "yearly" && <span style={{ fontSize: 11 }}>– Save 30%</span>}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(235px,1fr))", gap: 18, alignItems: "start" }}>
        {PLANS.map((p) => {
          const price = billing === "monthly" ? p.mo : (p.yr / 12).toFixed(2);
          return (
            <div key={p.id} className={`card hover-lift ${p.popular ? "gold-glow" : ""}`} style={{ padding: "30px 24px", position: "relative", background: p.popular ? "linear-gradient(160deg,#14100a,#0F1420)" : "#0F1420", border: p.popular ? "1px solid rgba(245,166,35,.35)" : "1px solid rgba(255,255,255,.07)", transition: "all .2s" }}>
              {p.popular && <div className="syne" style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: "#F5A623", color: "#000", fontSize: 11, fontWeight: 800, padding: "4px 16px", borderRadius: 100, letterSpacing: 1, whiteSpace: "nowrap" }}>⭐ MOST POPULAR</div>}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div className="syne" style={{ fontSize: 24, fontWeight: 800 }}>{p.name}</div>
                <span className="badge" style={{ background: `${p.color}18`, color: p.color, border: `1px solid ${p.color}35`, fontSize: 10 }}>{p.quality}</span>
              </div>
              <div style={{ marginBottom: 20 }}>
                <span className="syne" style={{ fontSize: 48, fontWeight: 800, color: p.color }}>${price}</span>
                <span className="outfit" style={{ color: "#64748B", fontSize: 13 }}>/mo</span>
                {billing === "yearly" && <div className="outfit" style={{ fontSize: 12, color: "#22C55E", marginTop: 2 }}>Billed ${p.yr}/yr · Save ${(p.mo * 12 - p.yr).toFixed(0)}</div>}
              </div>
              <div className="outfit" style={{ fontSize: 12, color: "#64748B", marginBottom: 18, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                📺 {p.channels} channels · 📱 {p.id === "reseller" ? "100 connections" : `${p.devices} screen${p.devices > 1 ? "s" : ""}`}
              </div>
              <ul style={{ listStyle: "none", marginBottom: 24 }}>
                {p.features.map(f => (
                  <li key={f} className="outfit" style={{ fontSize: 13, color: "#9CA3AF", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,.04)", display: "flex", gap: 8 }}>
                    <span style={{ color: "#22C55E", flexShrink: 0 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <button className="btn" style={{ width: "100%", padding: "12px", borderRadius: 9, fontSize: 14, fontFamily: "'Outfit',sans-serif", fontWeight: 600, background: p.popular ? `linear-gradient(135deg,#F5A623,#E8920F)` : `${p.color}22`, color: p.popular ? "#000" : p.color, border: `1px solid ${p.color}40`, cursor: "pointer", transition: "all .2s" }}
                onClick={() => { showToast(`${p.name} plan selected! Check your email for setup.`); }}>
                {p.id === "reseller" ? "Become a Reseller" : "Start Free Trial"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Money back */}
      <div className="card" style={{ maxWidth: 700, margin: "40px auto 0", padding: "24px 28px", display: "flex", gap: 20, alignItems: "center" }}>
        <div style={{ fontSize: 36, flexShrink: 0 }}>🛡️</div>
        <div>
          <div className="syne" style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>30-Day Money-Back Guarantee</div>
          <div className="outfit" style={{ fontSize: 13, color: "#64748B", lineHeight: 1.7 }}>Not happy? We'll refund every cent within 30 days — no questions asked. We're that confident in our service quality.</div>
        </div>
      </div>

      {/* Ideal pricing note */}
      <div className="card" style={{ maxWidth: 700, margin: "20px auto 0", padding: "24px 28px", background: "rgba(245,166,35,.05)", border: "1px solid rgba(245,166,35,.15)" }}>
        <div className="syne" style={{ fontSize: 15, fontWeight: 700, color: "#F5A623", marginBottom: 10 }}>💡 Ideal Pricing Strategy (Owner's Guide)</div>
        <div className="outfit" style={{ fontSize: 13, color: "#9CA3AF", lineHeight: 1.8 }}>
          <strong style={{ color: "#E2E8F0" }}>Best margin:</strong> Push Pro ($9.99/mo) — industry avg. cost is ~$2–3/user, giving you ~70% margin.<br />
          <strong style={{ color: "#E2E8F0" }}>Reseller channel:</strong> Sell Reseller plans at $39.99 and your resellers flip connections at $5–15 each — passive income multiplier.<br />
          <strong style={{ color: "#E2E8F0" }}>Annual billing:</strong> Offer 2 free months on yearly plans to boost LTV and reduce churn by ~40%.<br />
          <strong style={{ color: "#E2E8F0" }}>Upsell path:</strong> Onboard customers on Starter, then upgrade nudge at 30 days with feature comparison email.
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 36 }}>
        <button className="btn btn-outline" style={{ padding: "12px 28px", fontSize: 14 }} onClick={() => setView("howto")}>See How to Set Up → </button>
      </div>
    </div>
  );
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────
function HowToView({ setView }) {
  const apps = [
    { name: "TiviMate", platform: "Android TV / Firestick", rating: "⭐ 4.8", note: "Best for TV boxes" },
    { name: "Smarters Pro", platform: "iOS & Android", rating: "⭐ 4.6", note: "Best for phones" },
    { name: "GSE Smart IPTV", platform: "iOS, Android, Mac", rating: "⭐ 4.5", note: "Multi-platform" },
    { name: "Perfect Player", platform: "Android", rating: "⭐ 4.4", note: "Free option" },
    { name: "VLC Media Player", platform: "Windows/Mac/Linux", rating: "⭐ 4.7", note: "Desktop use" },
    { name: "Kodi + PVR", platform: "All Platforms", rating: "⭐ 4.3", note: "Advanced users" },
  ];

  const faqs = [
    { q: "How long until I receive my login?", a: "Credentials are emailed automatically within 60 seconds of payment confirmation — 24/7, including holidays." },
    { q: "What internet speed do I need?", a: "HD: 10 Mbps · 4K: 25 Mbps · 8K: 50 Mbps. We recommend wired connection for the best experience." },
    { q: "Can I use it on multiple TVs?", a: "Yes! Pro allows 3 simultaneous streams. Elite allows 6. Each stream can be on a different device, channel, or location." },
    { q: "What if channels don't load?", a: "Our 24/7 support team responds in under 5 minutes. We also have automatic failover — if one server drops, your stream switches instantly." },
    { q: "Is it legal?", a: "StreamVault provides access to licensed IPTV streams. Always verify content licensing in your jurisdiction. We recommend using our built-in VPN (Elite plan)." },
  ];

  return (
    <div style={{ padding: "60px 32px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <h1 className="syne" style={{ fontSize: 52, fontWeight: 800, marginBottom: 10 }}>How It Works</h1>
        <p className="outfit" style={{ color: "#64748B", fontSize: 16 }}>From sign-up to watching live TV — in under 5 minutes.</p>
      </div>

      {/* Steps */}
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: 28, top: 24, bottom: 24, width: 2, background: "linear-gradient(180deg,#F5A623,rgba(245,166,35,.1))", borderRadius: 2 }} />
        {STEPS.map((s, i) => (
          <div key={s.n} className="fade-up" style={{ display: "flex", gap: 24, marginBottom: 32, animationDelay: `${i * 0.1}s` }}>
            <div style={{ flexShrink: 0, width: 56, height: 56, background: "linear-gradient(135deg,#F5A623,#E8920F)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, zIndex: 1 }}>{s.icon}</div>
            <div className="card" style={{ flex: 1, padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span className="outfit" style={{ fontSize: 11, color: "#F5A623", fontWeight: 700, letterSpacing: 1 }}>STEP {s.n}</span>
              </div>
              <div className="syne" style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{s.title}</div>
              <div className="outfit" style={{ fontSize: 14, color: "#64748B", lineHeight: 1.75 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Compatible Apps */}
      <div style={{ marginTop: 64 }}>
        <h2 className="syne" style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Compatible Apps</h2>
        <p className="outfit" style={{ color: "#64748B", marginBottom: 24, fontSize: 14 }}>All free to download. Works with your existing devices.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12 }}>
          {apps.map(a => (
            <div key={a.name} className="card hover-lift" style={{ padding: "16px 18px", display: "flex", gap: 14, alignItems: "center", cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(245,166,35,.3)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,.07)"}>
              <div style={{ width: 42, height: 42, background: "rgba(245,166,35,.1)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>📺</div>
              <div>
                <div className="syne" style={{ fontSize: 14, fontWeight: 700 }}>{a.name}</div>
                <div className="outfit" style={{ fontSize: 11, color: "#64748B" }}>{a.platform}</div>
                <div className="outfit" style={{ fontSize: 11, color: "#F5A623" }}>{a.rating} · {a.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ marginTop: 64 }}>
        <h2 className="syne" style={{ fontSize: 32, fontWeight: 800, marginBottom: 24 }}>Common Questions</h2>
        {faqs.map((f, i) => (
          <FaqItem key={i} q={f.q} a={f.a} />
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 48 }}>
        <button className="btn btn-gold" style={{ padding: "14px 40px", fontSize: 15, borderRadius: 10 }} onClick={() => setView("pricing")}>Get Started Now →</button>
      </div>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card" style={{ marginBottom: 10, overflow: "hidden" }}>
      <div onClick={() => setOpen(!open)} style={{ padding: "16px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="outfit" style={{ fontSize: 14, fontWeight: 600 }}>{q}</span>
        <span style={{ color: "#F5A623", fontSize: 18, transition: "transform .2s", transform: open ? "rotate(45deg)" : "rotate(0)" }}>+</span>
      </div>
      {open && <div className="outfit" style={{ padding: "0 20px 16px", fontSize: 13, color: "#64748B", lineHeight: 1.75 }}>{a}</div>}
    </div>
  );
}

// ─── CUSTOMER PORTAL ──────────────────────────────────────────────
function CustomerPortal({ tab, setTab, showToast, showOnboard, setShowOnboard }) {
  const myPlan = PLANS[1]; // Pro plan
  const daysLeft = 23;

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 65px)" }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: "#0B0F1C", borderRight: "1px solid rgba(255,255,255,.06)", padding: "24px 16px", flexShrink: 0 }}>
        <div style={{ marginBottom: 28, padding: "0 8px" }}>
          <div className="outfit" style={{ fontSize: 11, color: "#374151", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Logged in as</div>
          <div className="syne" style={{ fontSize: 14, fontWeight: 700 }}>Marcus Johnson</div>
          <div className="outfit" style={{ fontSize: 12, color: "#64748B" }}>m.johnson@gmail.com</div>
          <div className="badge badge-gold" style={{ marginTop: 8 }}>⭐ Pro Plan</div>
        </div>
        {[["📊 Dashboard","dashboard"],["📺 My Channels","channels"],["📱 Devices","devices"],["🎬 VOD Library","vod"],["🔑 Credentials","creds"],["🎫 Support","support"],["⚙️ Settings","settings"]].map(([label, t]) => (
          <button key={t} onClick={() => setTab(t)} className="btn outfit" style={{ width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 8, marginBottom: 4, background: tab === t ? "rgba(245,166,35,.1)" : "transparent", color: tab === t ? "#F5A623" : "#64748B", fontSize: 13, border: tab === t ? "1px solid rgba(245,166,35,.2)" : "1px solid transparent" }}>
            {label}
          </button>
        ))}
        <div style={{ marginTop: "auto", paddingTop: 20, borderTop: "1px solid rgba(255,255,255,.06)", marginTop: 40 }}>
          <button className="btn btn-gold" style={{ width: "100%", padding: "10px", fontSize: 13, borderRadius: 8 }} onClick={() => showToast("Redirecting to upgrade page...")}>⬆ Upgrade to Elite</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "32px", overflow: "auto" }}>
        {tab === "dashboard" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
              <div>
                <h1 className="syne" style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Welcome back, Marcus 👋</h1>
                <p className="outfit" style={{ color: "#64748B", fontSize: 14 }}>Your Pro subscription is active · {daysLeft} days remaining</p>
              </div>
              <button className="btn btn-gold" style={{ padding: "10px 20px", fontSize: 13, borderRadius: 8 }} onClick={() => setShowOnboard(true)}>📋 Setup Guide</button>
            </div>

            {/* Status cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 28 }}>
              {[
                { label: "Subscription", value: "Pro Plan", sub: "Active", color: "#22C55E", icon: "✅" },
                { label: "Days Remaining", value: daysLeft, sub: "Renews Apr 15", color: "#F5A623", icon: "📅" },
                { label: "Screens Active", value: "2 / 3", sub: "1 available", color: "#3B82F6", icon: "📱" },
                { label: "Channels", value: "35,000+", sub: "All available", color: "#A855F7", icon: "📺" },
              ].map(c => (
                <div key={c.label} className="card" style={{ padding: "18px" }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{c.icon}</div>
                  <div className="syne" style={{ fontSize: 24, fontWeight: 800, color: c.color }}>{c.value}</div>
                  <div className="outfit" style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{c.label} · {c.sub}</div>
                </div>
              ))}
            </div>

            {/* Credentials box */}
            <div className="card" style={{ padding: "22px 24px", marginBottom: 20, background: "rgba(245,166,35,.04)", borderColor: "rgba(245,166,35,.15)" }}>
              <div className="syne" style={{ fontSize: 16, fontWeight: 700, color: "#F5A623", marginBottom: 14 }}>🔑 Your Stream Credentials</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }} className="outfit">
                {[["M3U URL","http://sv.streamvault.tv:8080/get.php?username=marcus99&password=sv8x2k&type=m3u_plus"],["Username","marcus99"],["Password","sv8x2k"],["Portal URL","http://sv.streamvault.tv:8080"]].map(([label, val]) => (
                  <div key={label}>
                    <div style={{ fontSize: 11, color: "#64748B", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
                    <div style={{ background: "#0B0F1C", border: "1px solid rgba(255,255,255,.07)", borderRadius: 7, padding: "8px 12px", fontSize: 12, color: "#9CA3AF", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{val}</span>
                      <span style={{ cursor: "pointer", color: "#F5A623", flexShrink: 0 }} onClick={() => showToast(`${label} copied!`)}>📋</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="card" style={{ padding: "20px 24px" }}>
              <div className="syne" style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Quick Actions</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[["📲 Download TiviMate",""],["📲 Download Smarters",""],["🔁 Renew Subscription",""],["📧 Email Credentials",""],["💬 Live Chat",""]].map(([a]) => (
                  <button key={a} className="btn btn-outline outfit" style={{ padding: "9px 16px", fontSize: 13, borderRadius: 8 }} onClick={() => showToast("Opening " + a.slice(3))}>{a}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "creds" && (
          <div>
            <h1 className="syne" style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>Your Credentials</h1>
            <div className="card" style={{ padding: "28px", maxWidth: 560 }}>
              {[["Portal URL","http://sv.streamvault.tv:8080"],["Username","marcus99"],["Password","sv8x2k"],["M3U Link","http://sv.streamvault.tv:8080/get.php?username=marcus99&password=sv8x2k&type=m3u_plus"],["EPG URL","http://sv.streamvault.tv:8080/xmltv.php?username=marcus99&password=sv8x2k"]].map(([l, v]) => (
                <div key={l} style={{ marginBottom: 18 }}>
                  <div className="outfit" style={{ fontSize: 11, color: "#64748B", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>{l}</div>
                  <div style={{ background: "#0B0F1C", border: "1px solid rgba(255,255,255,.07)", borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#9CA3AF", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, wordBreak: "break-all" }}>
                    <span>{v}</span>
                    <button className="btn btn-gold" style={{ padding: "5px 12px", fontSize: 11, borderRadius: 6, flexShrink: 0 }} onClick={() => showToast(`${l} copied!`)}>Copy</button>
                  </div>
                </div>
              ))}
              <button className="btn btn-outline outfit" style={{ width: "100%", padding: "12px", fontSize: 14, borderRadius: 8, marginTop: 8 }} onClick={() => showToast("Credentials emailed to m.johnson@gmail.com")}>📧 Email These to Me</button>
            </div>
          </div>
        )}

        {tab === "support" && (
          <div>
            <h1 className="syne" style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>Support Tickets</h1>
            {TICKETS.map(t => (
              <div key={t.id} className="card" style={{ padding: "16px 20px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div className="outfit" style={{ fontSize: 11, color: "#64748B", marginBottom: 3 }}>{t.id} · {t.time}</div>
                  <div className="syne" style={{ fontSize: 14, fontWeight: 700 }}>{t.issue}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className={`badge ${t.priority === "High" ? "badge-red" : t.priority === "Normal" ? "badge-gold" : "badge-blue"}`}>{t.priority}</span>
                  <span className={`badge ${t.status === "Resolved" ? "badge-green" : t.status === "In Progress" ? "badge-gold" : "badge-red"}`}>{t.status}</span>
                </div>
              </div>
            ))}
            <div className="card" style={{ padding: "24px", marginTop: 20 }}>
              <div className="syne" style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Open New Ticket</div>
              <input placeholder="Describe your issue..." style={{ marginBottom: 12 }} />
              <select style={{ marginBottom: 12 }}>
                <option>Select Priority</option>
                <option>High</option>
                <option>Normal</option>
                <option>Low</option>
              </select>
              <button className="btn btn-gold" style={{ padding: "11px 24px", fontSize: 14, borderRadius: 8, width: "100%" }} onClick={() => showToast("Ticket submitted! Response within 5 minutes.")}>Submit Ticket</button>
            </div>
          </div>
        )}

        {!["dashboard","creds","support"].includes(tab) && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, color: "#374151" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
            <div className="syne" style={{ fontSize: 20 }}>Coming Soon</div>
            <div className="outfit" style={{ fontSize: 14, color: "#374151", marginTop: 6 }}>This section is being built out.</div>
          </div>
        )}
      </div>

      {/* Onboard modal */}
      {showOnboard && (
        <div onClick={() => setShowOnboard(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={e => e.stopPropagation()} className="card fade-in" style={{ maxWidth: 540, width: "100%", maxHeight: "85vh", overflow: "auto", padding: "36px 32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 className="syne" style={{ fontSize: 24, fontWeight: 800 }}>📋 Quick Setup Guide</h2>
              <button onClick={() => setShowOnboard(false)} style={{ background: "none", border: "none", color: "#64748B", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
            {STEPS.map((s, i) => (
              <div key={s.n} style={{ display: "flex", gap: 14, marginBottom: 18 }}>
                <div style={{ width: 34, height: 34, background: "linear-gradient(135deg,#F5A623,#E8920F)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{s.icon}</div>
                <div>
                  <div className="syne" style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{s.title}</div>
                  <div className="outfit" style={{ fontSize: 12, color: "#64748B", lineHeight: 1.7 }}>{s.desc}</div>
                </div>
              </div>
            ))}
            <button className="btn btn-gold" style={{ width: "100%", padding: "13px", fontSize: 14, borderRadius: 9, marginTop: 8 }} onClick={() => { setShowOnboard(false); showToast("Guide emailed to you!"); }}>📧 Email Guide to Me</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────
function AdminDashboard({ tab, setTab, customers, allCustomers, search, setSearch, showToast, selectedCustomer, setSelectedCustomer, liveStats }) {
  const totalRevenue = 26100;
  const activeCustomers = allCustomers.filter(c => c.status === "Active").length;
  const expiredCustomers = allCustomers.filter(c => c.status === "Expired").length;
  const trialCustomers = allCustomers.filter(c => c.status === "Trial").length;

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 65px)" }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: "#0B0F1C", borderRight: "1px solid rgba(255,255,255,.06)", padding: "24px 16px", flexShrink: 0 }}>
        <div style={{ marginBottom: 24, padding: "0 8px" }}>
          <div className="badge badge-gold" style={{ marginBottom: 8 }}>⚙️ Admin Panel</div>
          <div className="outfit" style={{ fontSize: 12, color: "#64748B" }}>StreamVault v2.6</div>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 20, padding: "10px 12px", background: "rgba(34,197,94,.07)", border: "1px solid rgba(34,197,94,.15)", borderRadius: 8 }}>
          <div>
            <div className="outfit" style={{ fontSize: 11, color: "#22C55E", fontWeight: 600 }}>● ALL SYSTEMS GO</div>
            <div className="outfit" style={{ fontSize: 11, color: "#374151" }}>{liveStats.servers} servers · {liveStats.uptime}% up</div>
          </div>
        </div>
        {[["📊 Overview","overview"],["👥 Customers","customers"],["🖥️ Servers","servers"],["💰 Revenue","revenue"],["🎫 Tickets","tickets"],["📣 Alerts","alerts"],["📤 Send Emails","emails"]].map(([label, t]) => (
          <button key={t} onClick={() => setTab(t)} className="btn outfit" style={{ width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 8, marginBottom: 4, background: tab === t ? "rgba(245,166,35,.1)" : "transparent", color: tab === t ? "#F5A623" : "#64748B", fontSize: 13, border: tab === t ? "1px solid rgba(245,166,35,.2)" : "1px solid transparent" }}>
            {label}
          </button>
        ))}
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: "28px 32px", overflow: "auto" }}>

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h1 className="syne" style={{ fontSize: 26, fontWeight: 800 }}>Dashboard Overview</h1>
              <div className="outfit" style={{ fontSize: 13, color: "#64748B" }}>📅 March 24, 2026 · Auto-refreshing</div>
            </div>

            {/* KPI cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 28 }}>
              {[
                { label: "Monthly Revenue", value: `$${totalRevenue.toLocaleString()}`, delta: "+18%", color: "#22C55E", icon: "💰" },
                { label: "Active Subscribers", value: activeCustomers, delta: "+87 this mo.", color: "#F5A623", icon: "👥" },
                { label: "Free Trials", value: trialCustomers, delta: "Conv. rate 68%", color: "#3B82F6", icon: "🆓" },
                { label: "Expired", value: expiredCustomers, delta: "Renewal emails sent", color: "#EF4444", icon: "⚠️" },
                { label: "Server Uptime", value: "99.9%", delta: "SLA met", color: "#22C55E", icon: "🛡️" },
                { label: "Live Viewers", value: liveStats.viewers.toLocaleString(), delta: "Right now", color: "#A855F7", icon: "📺" },
              ].map(c => (
                <div key={c.label} className="card hover-lift" style={{ padding: "18px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontSize: 22 }}>{c.icon}</div>
                    <span className="outfit" style={{ fontSize: 11, color: "#22C55E", background: "rgba(34,197,94,.1)", padding: "2px 7px", borderRadius: 100 }}>{c.delta}</span>
                  </div>
                  <div className="syne" style={{ fontSize: 28, fontWeight: 800, color: c.color, marginTop: 8 }}>{c.value}</div>
                  <div className="outfit" style={{ fontSize: 11, color: "#64748B", marginTop: 2, textTransform: "uppercase", letterSpacing: .5 }}>{c.label}</div>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 20 }}>
              <div className="card" style={{ padding: "22px" }}>
                <div className="syne" style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Revenue & Subscribers (12mo)</div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={REVENUE_DATA}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F5A623" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#F5A623" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" />
                    <XAxis dataKey="m" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#0B0F1C", border: "1px solid rgba(245,166,35,.2)", borderRadius: 8, color: "#E2E8F0", fontFamily: "Outfit" }} />
                    <Area type="monotone" dataKey="rev" stroke="#F5A623" strokeWidth={2} fill="url(#revGrad)" name="Revenue $" />
                    <Line type="monotone" dataKey="subs" stroke="#22C55E" strokeWidth={2} dot={false} name="Subscribers" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="card" style={{ padding: "22px", display: "flex", flexDirection: "column" }}>
                <div className="syne" style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Plan Split</div>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={PLAN_SPLIT} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {PLAN_SPLIT.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#0B0F1C", border: "1px solid rgba(245,166,35,.2)", borderRadius: 8, color: "#E2E8F0", fontFamily: "Outfit" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                  {PLAN_SPLIT.map(p => (
                    <div key={p.name} className="outfit" style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, display: "inline-block" }} />{p.name}</span>
                      <span style={{ color: "#64748B" }}>{p.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent alerts */}
            <div className="card" style={{ padding: "20px 22px" }}>
              <div className="syne" style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>🔔 Recent Alerts</div>
              {ALERTS.map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.04)", alignItems: "center" }}>
                  <span style={{ fontSize: 16 }}>{a.type === "success" ? "✅" : a.type === "warning" ? "⚠️" : "ℹ️"}</span>
                  <span className="outfit" style={{ flex: 1, fontSize: 13, color: "#9CA3AF" }}>{a.msg}</span>
                  <span className="outfit" style={{ fontSize: 11, color: "#374151", flexShrink: 0 }}>{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CUSTOMERS */}
        {tab === "customers" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h1 className="syne" style={{ fontSize: 26, fontWeight: 800 }}>Customer Management</h1>
              <div style={{ display: "flex", gap: 10 }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search customers..." style={{ width: 220, padding: "9px 14px", fontSize: 13 }} />
                <button className="btn btn-gold" style={{ padding: "9px 18px", fontSize: 13, borderRadius: 8, whiteSpace: "nowrap" }} onClick={() => showToast("New customer form coming soon!")}>+ Add Customer</button>
              </div>
            </div>

            <div className="card" style={{ overflow: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }} className="outfit">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                    {["Customer","Plan","Status","Devices","Revenue","Joined","Usage","Actions"].map(h => (
                      <th key={h} style={{ padding: "13px 16px", textAlign: "left", color: "#64748B", fontWeight: 600, whiteSpace: "nowrap", fontSize: 11, textTransform: "uppercase", letterSpacing: .5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c.id} className="table-row" style={{ borderBottom: "1px solid rgba(255,255,255,.03)", cursor: "pointer" }} onClick={() => setSelectedCustomer(c)}>
                      <td style={{ padding: "13px 16px" }}>
                        <div style={{ fontWeight: 600, marginBottom: 2 }}>{c.name}</div>
                        <div style={{ color: "#64748B", fontSize: 11 }}>{c.email}</div>
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <span className={`badge ${c.plan === "Pro" ? "badge-gold" : c.plan === "Elite" ? "badge-green" : c.plan === "Reseller" ? "badge-blue" : ""}`}>{c.plan}</span>
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <span className={`badge ${c.status === "Active" ? "badge-green" : c.status === "Trial" ? "badge-gold" : "badge-red"}`}>{c.status}</span>
                      </td>
                      <td style={{ padding: "13px 16px", color: "#9CA3AF" }}>{c.devices}</td>
                      <td style={{ padding: "13px 16px", color: "#22C55E", fontWeight: 600 }}>{c.revenue}</td>
                      <td style={{ padding: "13px 16px", color: "#64748B", whiteSpace: "nowrap" }}>{c.joined}</td>
                      <td style={{ padding: "13px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 60, height: 4, background: "#1E293B", borderRadius: 2 }}>
                            <div style={{ width: c.usage, height: "100%", background: parseInt(c.usage) > 80 ? "#22C55E" : parseInt(c.usage) > 50 ? "#F5A623" : "#EF4444", borderRadius: 2 }} />
                          </div>
                          <span style={{ fontSize: 11, color: "#64748B" }}>{c.usage}</span>
                        </div>
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn" style={{ padding: "4px 10px", fontSize: 11, borderRadius: 5, background: "rgba(59,130,246,.1)", color: "#3B82F6", border: "1px solid rgba(59,130,246,.2)" }} onClick={e => { e.stopPropagation(); showToast(`Email sent to ${c.name}`); }}>Email</button>
                          <button className="btn" style={{ padding: "4px 10px", fontSize: 11, borderRadius: 5, background: "rgba(34,197,94,.1)", color: "#22C55E", border: "1px solid rgba(34,197,94,.2)" }} onClick={e => { e.stopPropagation(); showToast(`${c.name} renewed!`); }}>Renew</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="outfit" style={{ padding: "12px 16px", color: "#374151", fontSize: 12 }}>Showing {customers.length} of {allCustomers.length} customers</div>

            {/* Customer detail panel */}
            {selectedCustomer && (
              <div onClick={() => setSelectedCustomer(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
                <div onClick={e => e.stopPropagation()} className="card fade-in" style={{ maxWidth: 480, width: "100%", padding: "32px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                    <div>
                      <div className="syne" style={{ fontSize: 20, fontWeight: 800 }}>{selectedCustomer.name}</div>
                      <div className="outfit" style={{ fontSize: 13, color: "#64748B" }}>{selectedCustomer.email} · {selectedCustomer.id}</div>
                    </div>
                    <button onClick={() => setSelectedCustomer(null)} style={{ background: "none", border: "none", color: "#64748B", fontSize: 20, cursor: "pointer" }}>✕</button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                    {[["Plan", selectedCustomer.plan],["Status", selectedCustomer.status],["Monthly Rev", selectedCustomer.revenue],["Devices", selectedCustomer.devices],["Joined", selectedCustomer.joined],["Expires", selectedCustomer.expires]].map(([l,v]) => (
                      <div key={l} style={{ background: "#0B0F1C", borderRadius: 8, padding: "12px 14px" }}>
                        <div className="outfit" style={{ fontSize: 11, color: "#64748B", marginBottom: 4 }}>{l}</div>
                        <div className="syne" style={{ fontSize: 14, fontWeight: 700 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[["📧 Send Email",""],["🔁 Renew",""],["⬆ Upgrade Plan",""],["⛔ Suspend","red"],["📋 View Full Log",""]].map(([label, col]) => (
                      <button key={label} className="btn outfit" style={{ padding: "8px 14px", fontSize: 12, borderRadius: 7, background: col === "red" ? "rgba(239,68,68,.1)" : "rgba(245,166,35,.1)", color: col === "red" ? "#EF4444" : "#F5A623", border: `1px solid ${col === "red" ? "rgba(239,68,68,.2)" : "rgba(245,166,35,.2)"}` }} onClick={() => showToast(`${label.slice(3)} action for ${selectedCustomer.name}`)}>{label}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SERVERS */}
        {tab === "servers" && (
          <div>
            <h1 className="syne" style={{ fontSize: 26, fontWeight: 800, marginBottom: 20 }}>Server Status</h1>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14 }}>
              {SERVERS.map(s => (
                <div key={s.name} className="card" style={{ padding: "20px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <div className="syne" style={{ fontSize: 15, fontWeight: 700 }}>{s.name}</div>
                      <div className="outfit" style={{ fontSize: 12, color: "#64748B" }}>📍 {s.loc}</div>
                    </div>
                    <span className={`badge ${s.status === "Optimal" ? "badge-green" : "badge-gold"}`}>{s.status}</span>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span className="outfit" style={{ fontSize: 12, color: "#64748B" }}>Load</span>
                      <span className="outfit" style={{ fontSize: 12, color: s.load > 60 ? "#F5A623" : "#22C55E" }}>{s.load}%</span>
                    </div>
                    <div style={{ height: 5, background: "#1E293B", borderRadius: 3 }}>
                      <div style={{ width: `${s.load}%`, height: "100%", background: s.load > 60 ? "#F5A623" : "#22C55E", borderRadius: 3, transition: "width .5s" }} />
                    </div>
                  </div>
                  <div className="outfit" style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748B" }}>
                    <span>👤 {s.users.toLocaleString()} users</span>
                    <span>⬆ {s.uptime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REVENUE */}
        {tab === "revenue" && (
          <div>
            <h1 className="syne" style={{ fontSize: 26, fontWeight: 800, marginBottom: 20 }}>Revenue Analytics</h1>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
              {[["Monthly Revenue","$26,100","↑18% vs last mo","#22C55E"],["Annual Run-Rate","$313,200","Projected","#F5A623"],["Avg Revenue/User","$10.42","per subscriber","#3B82F6"]].map(([l,v,s,c]) => (
                <div key={l} className="card" style={{ padding: "20px" }}>
                  <div className="syne" style={{ fontSize: 30, fontWeight: 800, color: c }}>{v}</div>
                  <div className="outfit" style={{ fontSize: 12, color: "#22C55E" }}>{s}</div>
                  <div className="outfit" style={{ fontSize: 11, color: "#64748B", marginTop: 3 }}>{l}</div>
                </div>
              ))}
            </div>
            <div className="card" style={{ padding: "24px", marginBottom: 16 }}>
              <div className="syne" style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>12-Month Revenue Trend</div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={REVENUE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" />
                  <XAxis dataKey="m" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#0B0F1C", border: "1px solid rgba(245,166,35,.2)", borderRadius: 8, color: "#E2E8F0", fontFamily: "Outfit" }} />
                  <Bar dataKey="rev" fill="#F5A623" radius={[4,4,0,0]} name="Revenue $" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card" style={{ padding: "20px" }}>
              <div className="syne" style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Revenue by Plan</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[["Pro","$11,484","44%","#F5A623"],["Elite","$7,047","27%","#22C55E"],["Starter","$5,220","20%","#3B82F6"],["Reseller","$2,349","9%","#A855F7"]].map(([plan,rev,pct,color]) => (
                  <div key={plan} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span className="outfit" style={{ width: 70, fontSize: 13, color: "#9CA3AF" }}>{plan}</span>
                    <div style={{ flex: 1, height: 8, background: "#1E293B", borderRadius: 4 }}>
                      <div style={{ width: pct, height: "100%", background: color, borderRadius: 4 }} />
                    </div>
                    <span className="syne" style={{ width: 70, fontSize: 13, color, textAlign: "right" }}>{rev}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TICKETS */}
        {tab === "tickets" && (
          <div>
            <h1 className="syne" style={{ fontSize: 26, fontWeight: 800, marginBottom: 20 }}>Support Tickets</h1>
            {TICKETS.map(t => (
              <div key={t.id} className="card" style={{ padding: "18px 22px", marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div className="outfit" style={{ fontSize: 11, color: "#64748B", marginBottom: 4 }}>{t.id} · {t.user} · {t.time}</div>
                    <div className="syne" style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{t.issue}</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span className={`badge ${t.priority === "High" ? "badge-red" : t.priority === "Normal" ? "badge-gold" : "badge-blue"}`}>{t.priority}</span>
                      <span className={`badge ${t.status === "Resolved" ? "badge-green" : t.status === "In Progress" ? "badge-gold" : "badge-red"}`}>{t.status}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn outfit" style={{ padding: "7px 14px", fontSize: 12, borderRadius: 7, background: "rgba(59,130,246,.1)", color: "#3B82F6", border: "1px solid rgba(59,130,246,.2)" }} onClick={() => showToast("Opening ticket " + t.id)}>Reply</button>
                    <button className="btn outfit" style={{ padding: "7px 14px", fontSize: 12, borderRadius: 7, background: "rgba(34,197,94,.1)", color: "#22C55E", border: "1px solid rgba(34,197,94,.2)" }} onClick={() => showToast("Ticket resolved!")}>Resolve</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EMAIL SENDER */}
        {tab === "emails" && (
          <div>
            <h1 className="syne" style={{ fontSize: 26, fontWeight: 800, marginBottom: 20 }}>Send Customer Emails</h1>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="card" style={{ padding: "24px" }}>
                <div className="syne" style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Compose Email</div>
                <div style={{ marginBottom: 12 }}>
                  <label className="outfit" style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 6 }}>Recipients</label>
                  <select><option>All Active Customers (6)</option><option>Trial Users (1)</option><option>Expired Accounts (1)</option><option>Pro Plan Only</option><option>Elite Plan Only</option></select>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label className="outfit" style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 6 }}>Template</label>
                  <select><option>Custom Message</option><option>Welcome Email</option><option>Renewal Reminder</option><option>Upgrade Offer</option><option>Credentials Resend</option><option>Maintenance Notice</option></select>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label className="outfit" style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 6 }}>Subject</label>
                  <input placeholder="Email subject line..." />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="outfit" style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 6 }}>Message</label>
                  <textarea placeholder="Your message..." style={{ width: "100%", minHeight: 120, background: "#0B0F1C", border: "1px solid rgba(255,255,255,.07)", color: "#E2E8F0", borderRadius: 8, padding: "10px 14px", fontFamily: "'Outfit',sans-serif", fontSize: 13, resize: "vertical", outline: "none" }} />
                </div>
                <button className="btn btn-gold" style={{ width: "100%", padding: "12px", fontSize: 14, borderRadius: 8 }} onClick={() => showToast("📧 Emails sent to all selected recipients!")}>📤 Send Emails</button>
              </div>
              <div>
                <div className="card" style={{ padding: "22px", marginBottom: 14 }}>
                  <div className="syne" style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>⚡ Quick Actions</div>
                  {[["Send Renewal Reminders (1 expiring)","gold"],["Welcome New Trial Users (1)","blue"],["Blast Upgrade Offer to Starter (2)","purple"],["Resend All Credentials","green"],["Monthly Newsletter","gold"]].map(([a, c]) => (
                    <button key={a} className="btn outfit" style={{ width: "100%", textAlign: "left", padding: "11px 14px", borderRadius: 8, marginBottom: 8, fontSize: 13, background: `rgba(${c === "gold" ? "245,166,35" : c === "blue" ? "59,130,246" : c === "purple" ? "168,85,247" : "34,197,94"},.08)`, color: `${c === "gold" ? "#F5A623" : c === "blue" ? "#3B82F6" : c === "purple" ? "#A855F7" : "#22C55E"}`, border: `1px solid rgba(${c === "gold" ? "245,166,35" : c === "blue" ? "59,130,246" : c === "purple" ? "168,85,247" : "34,197,94"},.2)` }} onClick={() => showToast("Sending: " + a)}>📧 {a}</button>
                  ))}
                </div>
                <div className="card" style={{ padding: "22px" }}>
                  <div className="syne" style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>📊 Email Stats</div>
                  {[["Sent This Month","1,247","#22C55E"],["Open Rate","68.4%","#F5A623"],["Click Rate","24.1%","#3B82F6"],["Bounced","3","#EF4444"]].map(([l, v, c]) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                      <span className="outfit" style={{ fontSize: 13, color: "#64748B" }}>{l}</span>
                      <span className="syne" style={{ fontSize: 14, fontWeight: 700, color: c }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "alerts" && (
          <div>
            <h1 className="syne" style={{ fontSize: 26, fontWeight: 800, marginBottom: 20 }}>System Alerts</h1>
            {ALERTS.map((a, i) => (
              <div key={i} className="card" style={{ padding: "16px 20px", marginBottom: 10, display: "flex", gap: 14, alignItems: "center", borderLeft: `3px solid ${a.type === "success" ? "#22C55E" : a.type === "warning" ? "#F5A623" : "#3B82F6"}` }}>
                <span style={{ fontSize: 20 }}>{a.type === "success" ? "✅" : a.type === "warning" ? "⚠️" : "ℹ️"}</span>
                <span className="outfit" style={{ flex: 1, fontSize: 14 }}>{a.msg}</span>
                <span className="outfit" style={{ fontSize: 12, color: "#374151" }}>{a.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
