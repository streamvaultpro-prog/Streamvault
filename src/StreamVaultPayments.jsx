import { useState, useEffect } from "react";

// ─── OWNER CONFIG — EDIT THESE WITH YOUR REAL INFO ────────────────
const OWNER = {
  venmo:    "@stream_vaultpro",
  cashapp:  "$streamvaultpro",
  zelle:    "streamvaultpro@gmail.com",
  zellePhone: "(555) 012-3456",
  stripe:   "https://buy.stripe.com/your-link-here", // replace with real Stripe link
  businessName: "StreamVault TV",
  supportEmail: "streamvaultpro@gmail.com",
  logo: "📡",
};

// ─── PLANS ────────────────────────────────────────────────────────
const PLANS = [
  { id:"starter", name:"Starter", mo:5.99,  yr:49.99,  devices:1, channels:"12,000+", quality:"HD",    color:"#3B82F6",  emoji:"📺" },
  { id:"pro",     name:"Pro",     mo:9.99,  yr:79.99,  devices:3, channels:"35,000+", quality:"4K",    color:"#F5A623",  emoji:"⚡", popular:true },
  { id:"elite",   name:"Elite",   mo:14.99, yr:119.99, devices:6, channels:"55,000+", quality:"4K+8K", color:"#22C55E",  emoji:"👑" },
  { id:"reseller",name:"Reseller",mo:39.99, yr:349.99, devices:100,channels:"55,000+",quality:"All",   color:"#A855F7",  emoji:"🏪" },
];

const PAYMENT_METHODS = [
  { id:"venmo",   name:"Venmo",    color:"#3D95CE", bg:"#EFF6FF", textDark:"#1e40af", emoji:"💙", desc:"Instant · No fees" },
  { id:"cashapp", name:"Cash App", color:"#00D64F", bg:"#F0FDF4", textDark:"#166534", emoji:"💚", desc:"Instant · No fees" },
  { id:"zelle",   name:"Zelle",    color:"#6D1ED4", bg:"#FAF5FF", textDark:"#581c87", emoji:"💜", desc:"Bank transfer · Free" },
  
];

// ─── MOCK QR CODE (SVG pattern — replace with real QR in production) ──
function QRCode({ value, size = 160, color = "#000" }) {
  // Deterministic visual pattern based on value string
  const cells = 21;
  const cell = size / cells;
  const hash = value.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const grid = Array.from({ length: cells }, (_, r) =>
    Array.from({ length: cells }, (_, c) => {
      if (r < 7 && c < 7) return (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4));
      if (r < 7 && c > cells - 8) return (r === 0 || r === 6 || c === cells - 1 || c === cells - 7 || (r >= 2 && r <= 4 && c >= cells - 5 && c <= cells - 3));
      if (r > cells - 8 && c < 7) return (r === cells - 1 || r === cells - 7 || c === 0 || c === 6 || (r >= cells - 5 && r <= cells - 3 && c >= 2 && c <= 4));
      return ((hash * (r + 1) * (c + 1) + r * 7 + c * 13) % 3 === 0);
    })
  );
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ borderRadius: 8 }}>
      <rect width={size} height={size} fill="white" rx="8" />
      {grid.map((row, r) => row.map((on, c) => on ? (
        <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill={color} />
      ) : null))}
    </svg>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────
export default function PaymentSystem() {
  const [screen, setScreen] = useState("checkout"); // checkout | confirm | success | admin
  const [selectedPlan, setSelectedPlan] = useState(PLANS[1]);
  const [billing, setBilling] = useState("monthly");
  const [method, setMethod] = useState(null);
  const [step, setStep] = useState(1); // 1=plan, 2=method, 3=pay, 4=confirm
  const [form, setForm] = useState({ name:"", email:"", phone:"", note:"" });
  const [cardForm, setCardForm] = useState({ number:"", expiry:"", cvv:"", name:"", zip:"" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [adminTab, setAdminTab] = useState("pending");

  const price = billing === "monthly" ? selectedPlan.mo : (selectedPlan.yr / 12).toFixed(2);
  const yearlyTotal = billing === "yearly" ? selectedPlan.yr : null;

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = () => {
    if (!form.name || !form.email) { showToast("Please fill in your name and email", "error"); return; }
    // Stripe removed
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(4); }, 1500);
  };

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); setScreen("success"); }, 2000);
  };

  const mockOrders = [
    { id:"SV-2041", name:"Marcus Johnson", email:"m.johnson@gmail.com", plan:"Pro", amount:"$9.99", method:"CashApp", status:"Pending", time:"5 min ago", note:"$streamvaultpro — sent!" },
    { id:"SV-2040", name:"Tanya Williams", email:"t.williams@icloud.com", plan:"Elite", amount:"$14.99", method:"Venmo", status:"Confirmed", time:"1h ago", note:"payment sent" },
    { id:"SV-2039", name:"Ray Chen", email:"raychen@gmail.com", plan:"Starter", amount:"$5.99", method:"Zelle", status:"Pending", time:"2h ago", note:"sent from chase" },
    { id:"SV-2038", name:"Sandra Okafor", email:"s.okafor@gmail.com", plan:"Reseller", amount:"$39.99", method:"Stripe", status:"Confirmed", time:"3h ago", note:"card approved" },
    { id:"SV-2037", name:"Derek Mills", email:"dmills@yahoo.com", plan:"Pro", amount:"$9.99", method:"CashApp", status:"Expired", time:"1d ago", note:"no payment received" },
  ];

  const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{background:#06080F;font-family:'Outfit',sans-serif;color:#E2E8F0;}
    ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:#F5A623;border-radius:2px}
    .syne{font-family:'Syne',sans-serif;} .outfit{font-family:'Outfit',sans-serif;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
    @keyframes checkPop{0%{transform:scale(0)}70%{transform:scale(1.2)}100%{transform:scale(1)}}
    @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(245,166,35,.15)}50%{box-shadow:0 0 40px rgba(245,166,35,.35)}}
    .fade-up{animation:fadeUp .5s ease forwards;}
    .fade-in{animation:fadeIn .3s ease forwards;}
    .check-pop{animation:checkPop .5s cubic-bezier(.34,1.56,.64,1) forwards;}
    .spin{animation:spin 1s linear infinite;}
    .glow-gold{animation:glow 3s ease-in-out infinite;}
    .btn{cursor:pointer;border:none;font-family:'Outfit',sans-serif;font-weight:600;transition:all .2s;}
    .btn-gold{background:linear-gradient(135deg,#F5A623,#D97706);color:#000;border-radius:9px;}
    .btn-gold:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(245,166,35,.4);}
    .btn-ghost{background:transparent;color:#E2E8F0;border:1px solid rgba(255,255,255,.1);border-radius:9px;}
    .btn-ghost:hover{border-color:#F5A623;color:#F5A623;}
    .card{background:#0F1420;border:1px solid rgba(255,255,255,.07);border-radius:14px;}
    .plan-card{cursor:pointer;transition:all .2s;}
    .plan-card:hover{transform:translateY(-3px);}
    .method-card{cursor:pointer;transition:all .2s;border-radius:12px;border:2px solid transparent;}
    .method-card:hover{transform:translateY(-2px);}
    input{background:#0B0F1C;border:1px solid rgba(255,255,255,.1);color:#E2E8F0;border-radius:9px;padding:12px 16px;font-family:'Outfit',sans-serif;font-size:14px;width:100%;outline:none;transition:border .2s;}
    input:focus{border-color:#F5A623;}
    .table-row:hover{background:rgba(255,255,255,.02);}
    .badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:600;}
    .step-dot{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0;transition:all .3s;}
  `;

  return (
    <div style={{ minHeight: "100vh", background: "#06080F", fontFamily: "'Outfit',sans-serif" }}>
      <style>{STYLES}</style>

      {/* TOAST */}
      {toast && (
        <div className="fade-in" style={{ position:"fixed", bottom:20, right:20, zIndex:999, padding:"12px 20px", borderRadius:10, background: toast.type==="error" ? "#1c0505" : "#05160a", border:`1px solid ${toast.type==="error" ? "#EF4444" : "#22C55E"}`, color: toast.type==="error" ? "#EF4444" : "#22C55E", fontSize:14, display:"flex", gap:8, alignItems:"center", maxWidth:320 }}>
          {toast.type==="error" ? "⚠️" : "✅"} {toast.msg}
        </div>
      )}

      {/* NAV */}
      <nav style={{ background:"rgba(6,8,15,.95)", backdropFilter:"blur(16px)", borderBottom:"1px solid rgba(255,255,255,.06)", padding:"14px 28px", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, background:"linear-gradient(135deg,#F5A623,#D97706)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>📡</div>
          <span className="syne" style={{ fontSize:18, fontWeight:800, letterSpacing:2, color:"#F5A623" }}>STREAMVAULT</span>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button className="btn btn-ghost outfit" style={{ padding:"7px 16px", fontSize:13 }} onClick={() => { setScreen("checkout"); setStep(1); }}>🛒 Checkout</button>
          <button className="btn outfit" style={{ padding:"7px 16px", fontSize:13, background:"rgba(168,85,247,.1)", color:"#A855F7", border:"1px solid rgba(168,85,247,.2)", borderRadius:9 }} onClick={() => setScreen("admin")}>⚙️ Admin Payments</button>
        </div>
      </nav>

      {/* ── SUCCESS SCREEN ── */}
      {screen === "success" && (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"calc(100vh - 65px)", padding:24 }}>
          <div className="card fade-up" style={{ maxWidth:480, width:"100%", padding:"48px 36px", textAlign:"center", background:"linear-gradient(160deg,#0a1408,#0F1420)" }}>
            <div className="check-pop" style={{ width:72, height:72, background:"linear-gradient(135deg,#22C55E,#16A34A)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, margin:"0 auto 24px" }}>✓</div>
            <h1 className="syne" style={{ fontSize:28, fontWeight:800, marginBottom:10, color:"#22C55E" }}>Payment Submitted!</h1>
            <p className="outfit" style={{ color:"#64748B", fontSize:15, marginBottom:28, lineHeight:1.75 }}>
              Thank you, <strong style={{ color:"#E2E8F0" }}>{form.name}</strong>! Your <strong style={{ color:"#F5A623" }}>{selectedPlan.name} Plan</strong> order is pending confirmation. You'll receive your login credentials at <strong style={{ color:"#E2E8F0" }}>{form.email}</strong> within <strong style={{ color:"#F5A623" }}>10–30 minutes</strong> after we verify your payment.
            </p>
            <div className="card" style={{ padding:"18px", marginBottom:24, textAlign:"left" }}>
              <div className="outfit" style={{ fontSize:12, color:"#64748B", letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>Order Summary</div>
              {[["Order ID","SV-"+Math.floor(Math.random()*9000+1000)],["Plan",selectedPlan.name + " — " + selectedPlan.quality],["Amount","$"+price+"/mo" + (billing==="yearly" ? ` (billed $${selectedPlan.yr}/yr)` : "")],["Payment","via " + (method ? PAYMENT_METHODS.find(m=>m.id===method)?.name : "")],["Status","⏳ Awaiting Admin Confirmation"]].map(([l,v]) => (
                <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid rgba(255,255,255,.05)", fontSize:13 }}>
                  <span style={{ color:"#64748B" }}>{l}</span>
                  <span style={{ color:"#E2E8F0", fontWeight:500 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ background:"rgba(245,166,35,.05)", border:"1px solid rgba(245,166,35,.15)", borderRadius:10, padding:"14px 18px", marginBottom:24, fontSize:13, color:"#9CA3AF", textAlign:"left", lineHeight:1.75 }}>
              💡 <strong style={{ color:"#F5A623" }}>Next steps:</strong> The owner will verify your payment and activate your account. Check your email for login credentials. If you don't hear back within 1 hour, email <span style={{ color:"#3B82F6" }}>{OWNER.supportEmail}</span>
            </div>
            <button className="btn btn-gold" style={{ width:"100%", padding:"13px", fontSize:15 }} onClick={() => { setScreen("checkout"); setStep(1); setForm({name:"",email:"",phone:"",note:""}); setMethod(null); }}>
              ← Back to Home
            </button>
          </div>
        </div>
      )}

      {/* ── CHECKOUT FLOW ── */}
      {screen === "checkout" && (
        <div style={{ maxWidth:900, margin:"0 auto", padding:"40px 20px" }}>

          {/* Progress Steps */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", marginBottom:44, gap:0 }}>
            {[["1","Choose Plan"],["2","Your Info"],["3","Pay"],["4","Confirm"]].map(([n, label], i) => (
              <div key={n} style={{ display:"flex", alignItems:"center" }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                  <div className="step-dot" style={{ background: step > i+1 ? "#22C55E" : step === i+1 ? "#F5A623" : "rgba(255,255,255,.07)", color: step >= i+1 ? "#000" : "#4B5563" }}>
                    {step > i+1 ? "✓" : n}
                  </div>
                  <span className="outfit" style={{ fontSize:11, color: step===i+1 ? "#F5A623" : "#374151", whiteSpace:"nowrap" }}>{label}</span>
                </div>
                {i < 3 && <div style={{ width:60, height:2, background: step > i+1 ? "#22C55E" : "rgba(255,255,255,.07)", margin:"0 6px", marginBottom:20, transition:"background .3s" }} />}
              </div>
            ))}
          </div>

          {/* STEP 1 — Choose Plan */}
          {step === 1 && (
            <div className="fade-up">
              <h2 className="syne" style={{ fontSize:32, fontWeight:800, textAlign:"center", marginBottom:8 }}>Choose Your Plan</h2>
              <p className="outfit" style={{ color:"#64748B", textAlign:"center", marginBottom:28 }}>7-day free trial. No credit card required to start.</p>

              <div style={{ display:"flex", justifyContent:"center", marginBottom:24 }}>
                <div style={{ display:"inline-flex", background:"#0B0F1C", borderRadius:100, padding:4, border:"1px solid rgba(255,255,255,.07)" }}>
                  {["monthly","yearly"].map(b => (
                    <button key={b} onClick={() => setBilling(b)} className="btn outfit" style={{ padding:"8px 22px", borderRadius:100, background: billing===b ? "#F5A623" : "transparent", color: billing===b ? "#000" : "#64748B", fontSize:13, fontWeight:600, textTransform:"capitalize" }}>
                      {b} {b==="yearly" && <span style={{ fontSize:11 }}>— Save 30%</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(195px,1fr))", gap:14, marginBottom:28 }}>
                {PLANS.map(p => {
                  const pr = billing==="monthly" ? p.mo : (p.yr/12).toFixed(2);
                  const sel = selectedPlan.id === p.id;
                  return (
                    <div key={p.id} className="plan-card" onClick={() => setSelectedPlan(p)} style={{ padding:"22px 18px", borderRadius:14, border:`2px solid ${sel ? p.color : "rgba(255,255,255,.07)"}`, background: sel ? `${p.color}0d` : "#0F1420", position:"relative", transition:"all .2s" }}>
                      {p.popular && <div className="syne" style={{ position:"absolute", top:-11, left:"50%", transform:"translateX(-50%)", background:"#F5A623", color:"#000", fontSize:10, fontWeight:800, padding:"3px 12px", borderRadius:100, whiteSpace:"nowrap" }}>⭐ POPULAR</div>}
                      {sel && <div style={{ position:"absolute", top:10, right:10, width:18, height:18, background:"#22C55E", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"#000", fontWeight:800 }}>✓</div>}
                      <div style={{ fontSize:24, marginBottom:8 }}>{p.emoji}</div>
                      <div className="syne" style={{ fontSize:18, fontWeight:800, marginBottom:4 }}>{p.name}</div>
                      <div className="syne" style={{ fontSize:30, fontWeight:800, color:p.color }}>${pr}<span className="outfit" style={{ fontSize:13, color:"#64748B", fontWeight:400 }}>/mo</span></div>
                      {billing==="yearly" && <div className="outfit" style={{ fontSize:11, color:"#22C55E" }}>Billed ${p.yr}/yr</div>}
                      <div className="outfit" style={{ fontSize:12, color:"#64748B", marginTop:10 }}>{p.channels} channels · {p.quality}</div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display:"flex", justifyContent:"center" }}>
                <button className="btn btn-gold" style={{ padding:"14px 48px", fontSize:16 }} onClick={() => setStep(2)}>
                  Continue with {selectedPlan.name} → 
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 — Customer Info */}
          {step === 2 && (
            <div className="fade-up">
              <h2 className="syne" style={{ fontSize:32, fontWeight:800, textAlign:"center", marginBottom:8 }}>Your Info</h2>
              <p className="outfit" style={{ color:"#64748B", textAlign:"center", marginBottom:32 }}>We'll send your login credentials to your email after payment is confirmed.</p>

              <div style={{ maxWidth:480, margin:"0 auto" }}>
                <div className="card" style={{ padding:"28px 26px", marginBottom:16 }}>
                  {[["Full Name","name","text","John Smith"],["Email Address","email","email","you@email.com"],["Phone (optional)","phone","tel","(555) 000-0000"]].map(([label, key, type, ph]) => (
                    <div key={key} style={{ marginBottom:18 }}>
                      <label className="outfit" style={{ fontSize:13, color:"#9CA3AF", display:"block", marginBottom:7 }}>{label}</label>
                      <input type={type} placeholder={ph} value={form[key]} onChange={e => setForm(f => ({...f, [key]:e.target.value}))} />
                    </div>
                  ))}
                </div>

                {/* Order summary */}
                <div className="card" style={{ padding:"18px 20px", marginBottom:24, background:"rgba(245,166,35,.04)", border:"1px solid rgba(245,166,35,.15)" }}>
                  <div className="outfit" style={{ fontSize:12, color:"#64748B", letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>Order Summary</div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div className="syne" style={{ fontSize:15, fontWeight:700 }}>{selectedPlan.name} Plan · {selectedPlan.quality}</div>
                      <div className="outfit" style={{ fontSize:12, color:"#64748B" }}>{selectedPlan.channels} channels · {selectedPlan.devices === 100 ? "100 connections" : `${selectedPlan.devices} screen${selectedPlan.devices>1?"s":""}`}</div>
                    </div>
                    <div className="syne" style={{ fontSize:22, fontWeight:800, color:"#F5A623" }}>${price}<span className="outfit" style={{ fontSize:12, color:"#64748B" }}>/mo</span></div>
                  </div>
                  {billing==="yearly" && <div className="outfit" style={{ fontSize:12, color:"#22C55E", marginTop:6 }}>💰 Saving ${(selectedPlan.mo*12 - selectedPlan.yr).toFixed(0)}/year with annual billing</div>}
                </div>

                <div style={{ display:"flex", gap:10 }}>
                  <button className="btn btn-ghost" style={{ padding:"13px 24px", fontSize:14, flex:1 }} onClick={() => setStep(1)}>← Back</button>
                  <button className="btn btn-gold" style={{ padding:"13px 32px", fontSize:14, flex:2 }} onClick={() => { if(!form.name||!form.email){showToast("Name and email required","error");return;} setStep(3); }}>
                    Choose Payment →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 — Payment Method */}
          {step === 3 && (
            <div className="fade-up">
              <h2 className="syne" style={{ fontSize:32, fontWeight:800, textAlign:"center", marginBottom:8 }}>Choose Payment</h2>
              <p className="outfit" style={{ color:"#64748B", textAlign:"center", marginBottom:32 }}>All methods are instant and secure. No hidden fees.</p>

              <div style={{ maxWidth:580, margin:"0 auto" }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
                  {PAYMENT_METHODS.map(m => {
                    const sel = method === m.id;
                    return (
                      <div key={m.id} className="method-card" onClick={() => setMethod(m.id)} style={{ padding:"20px 18px", background: sel ? `${m.color}15` : "#0F1420", border:`2px solid ${sel ? m.color : "rgba(255,255,255,.07)"}`, display:"flex", gap:14, alignItems:"center" }}>
                        <div style={{ width:44, height:44, background:`${m.color}20`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{m.emoji}</div>
                        <div>
                          <div className="syne" style={{ fontSize:15, fontWeight:700, color: sel ? m.color : "#E2E8F0" }}>{m.name}</div>
                          <div className="outfit" style={{ fontSize:11, color:"#64748B" }}>{m.desc}</div>
                        </div>
                        {sel && <div style={{ marginLeft:"auto", color:"#22C55E", fontSize:18 }}>✓</div>}
                      </div>
                    );
                  })}
                </div>

                {/* Payment detail panels */}
                {method && method !== "stripe" && (
                  <div className="card fade-in" style={{ padding:"28px", marginBottom:20, background:"rgba(255,255,255,.02)" }}>
                    {method === "venmo" && <PaymentPanel title="Pay via Venmo" handle={OWNER.venmo} color="#3D95CE" emoji="💙" amount={price} billing={billing} totalYr={selectedPlan.yr} plan={selectedPlan.name} note={`${selectedPlan.name} Plan — ${form.email}`} qrVal={OWNER.venmo} instructions={["Open Venmo app on your phone","Tap the 🔍 Search bar","Search for: " + OWNER.venmo,"Enter the exact amount shown below","In the NOTE field, paste your email address","Tap 'Pay' and come back here to confirm"]} />}
                    {method === "cashapp" && <PaymentPanel title="Pay via Cash App" handle={OWNER.cashapp} color="#00D64F" emoji="💚" amount={price} billing={billing} totalYr={selectedPlan.yr} plan={selectedPlan.name} note={`${selectedPlan.name} Plan — ${form.email}`} qrVal={OWNER.cashapp} instructions={["Open Cash App on your phone","Tap '$' at the bottom","Search for: " + OWNER.cashapp,"Enter the exact amount shown below","Add your email in the 'For' / Note field","Tap 'Pay' and confirm below"]} />}
                    {method === "zelle" && <PaymentPanel title="Pay via Zelle" handle={OWNER.zelle} color="#6D1ED4" emoji="💜" amount={price} billing={billing} totalYr={selectedPlan.yr} plan={selectedPlan.name} note={`${selectedPlan.name} Plan — ${form.email}`} qrVal={OWNER.zelle} isZelle instructions={["Open your bank's app or Zelle.com","Select 'Send Money'","Enter the recipient: " + OWNER.zelle,"OR use phone: " + OWNER.zellePhone,"Enter the exact amount shown below","In the memo, put your email address","Send and confirm below"]} zellePhone={OWNER.zellePhone} />}
                  </div>
                )}

                /* Stripe removed */ false && (
                  <div className="card fade-in" style={{ padding:"28px", marginBottom:20 }}>
                    <div style={{ textAlign:"center", marginBottom:24 }}>
                      <div style={{ fontSize:32, marginBottom:8 }}>💳</div>
                      <div className="syne" style={{ fontSize:18, fontWeight:700, marginBottom:6 }}>Pay Securely by Card</div>
                      <p className="outfit" style={{ fontSize:13, color:"#64748B" }}>Visa, Mastercard, Amex, Discover — powered by Stripe. 256-bit encrypted.</p>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                      {[["Card Number","number","1234 5678 9012 3456","2"],["Name on Card","name","John Smith","2"],["Expiry","expiry","MM/YY","1"],["CVV","cvv","123","1"],["ZIP Code","zip","90210","1"]].map(([label, key, ph, cols]) => (
                        <div key={key} style={{ gridColumn: cols==="2" ? "span 2" : "span 1" }}>
                          <label className="outfit" style={{ fontSize:12, color:"#64748B", display:"block", marginBottom:6 }}>{label}</label>
                          <input placeholder={ph} value={cardForm[key]} onChange={e => setCardForm(f => ({...f,[key]:e.target.value}))} />
                        </div>
                      ))}
                    </div>
                    <div style={{ background:"rgba(103,114,229,.07)", border:"1px solid rgba(103,114,229,.2)", borderRadius:9, padding:"12px 16px", display:"flex", gap:10, alignItems:"center", marginBottom:20 }}>
                      <span style={{ fontSize:16 }}>🔒</span>
                      <span className="outfit" style={{ fontSize:12, color:"#818CF8" }}>Your card info is encrypted end-to-end by Stripe. We never store card numbers.</span>
                    </div>
                    <AmountBox price={price} billing={billing} totalYr={selectedPlan.yr} plan={selectedPlan.name} color="#6772E5" />
                  </div>
                )}

                {/* Note field */}
                {method && (
                  <div className="card" style={{ padding:"18px 20px", marginBottom:20, background:"rgba(245,166,35,.03)", border:"1px solid rgba(245,166,35,.12)" }}>
                    <label className="outfit" style={{ fontSize:12, color:"#9CA3AF", display:"block", marginBottom:7 }}>📝 Note to owner (optional — include payment confirmation #)</label>
                    <input placeholder="e.g. 'Payment sent at 3:45pm'" value={form.note} onChange={e => setForm(f => ({...f,note:e.target.value}))} />
                  </div>
                )}

                <div style={{ display:"flex", gap:10 }}>
                  <button className="btn btn-ghost" style={{ padding:"13px 20px", fontSize:14, flex:1 }} onClick={() => setStep(2)}>← Back</button>
                  <button className="btn btn-gold" disabled={!method || loading} style={{ padding:"13px 28px", fontSize:15, flex:2, opacity: !method ? .5 : 1, cursor: !method ? "not-allowed" : "pointer" }} onClick={handleSubmit}>
                    {loading ? <span className="spin" style={{ display:"inline-block" }}>⏳</span> :  "I've Sent Payment →"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 — Confirm */}
          {step === 4 && (
            <div className="fade-up">
              <div style={{ maxWidth:480, margin:"0 auto", textAlign:"center" }}>
                <div style={{ fontSize:48, marginBottom:16 }}>⏳</div>
                <h2 className="syne" style={{ fontSize:28, fontWeight:800, marginBottom:10 }}>Almost Done!</h2>
                <p className="outfit" style={{ color:"#64748B", marginBottom:28, lineHeight:1.75 }}>
                  Click below to confirm you've sent your payment. The owner will verify and activate your account within <strong style={{ color:"#F5A623" }}>10–30 minutes</strong>.
                </p>
                <div className="card" style={{ padding:"20px", marginBottom:24, textAlign:"left" }}>
                  {[["Name",form.name],["Email",form.email],["Plan",selectedPlan.name + " — $" + price + "/mo"],["Payment via", PAYMENT_METHODS.find(m=>m.id===method)?.name || ""],["Note",form.note || "(none)"]].map(([l,v]) => (
                    <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,.05)", fontSize:13 }}>
                      <span className="outfit" style={{ color:"#64748B" }}>{l}</span>
                      <span className="outfit" style={{ color:"#E2E8F0" }}>{v}</span>
                    </div>
                  ))}
                </div>
                <button className="btn btn-gold glow-gold" style={{ width:"100%", padding:"15px", fontSize:16, marginBottom:10 }} onClick={handleConfirm}>
                  {loading ? <span className="spin" style={{ display:"inline-block" }}>⏳</span> : "✅ Confirm Payment Sent"}
                </button>
                <button className="btn btn-ghost" style={{ padding:"11px 20px", fontSize:14 }} onClick={() => setStep(3)}>← Go Back</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ADMIN PAYMENT PANEL ── */}
      {screen === "admin" && (
        <div style={{ maxWidth:1000, margin:"0 auto", padding:"40px 24px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
            <div>
              <h1 className="syne" style={{ fontSize:30, fontWeight:800, marginBottom:4 }}>Payment Management</h1>
              <p className="outfit" style={{ color:"#64748B", fontSize:14 }}>Review, confirm, and manage all incoming payments</p>
            </div>
            <div style={{ display:"flex", gap:12 }}>
              <div className="card" style={{ padding:"12px 18px", textAlign:"center" }}>
                <div className="syne" style={{ fontSize:22, fontWeight:800, color:"#F5A623" }}>$80.95</div>
                <div className="outfit" style={{ fontSize:11, color:"#64748B" }}>Today's Revenue</div>
              </div>
              <div className="card" style={{ padding:"12px 18px", textAlign:"center" }}>
                <div className="syne" style={{ fontSize:22, fontWeight:800, color:"#EF4444" }}>2</div>
                <div className="outfit" style={{ fontSize:11, color:"#64748B" }}>Pending</div>
              </div>
            </div>
          </div>

          {/* Filter tabs */}
          <div style={{ display:"flex", gap:8, marginBottom:20 }}>
            {["all","pending","confirmed","expired"].map(t => (
              <button key={t} onClick={() => setAdminTab(t)} className="btn outfit" style={{ padding:"8px 16px", borderRadius:9, fontSize:13, background: adminTab===t ? "rgba(245,166,35,.12)" : "transparent", color: adminTab===t ? "#F5A623" : "#64748B", border:`1px solid ${adminTab===t ? "rgba(245,166,35,.3)" : "transparent"}`, textTransform:"capitalize" }}>{t} {t==="pending" && <span style={{ background:"#EF4444", color:"#fff", borderRadius:100, padding:"1px 6px", fontSize:10, marginLeft:4 }}>2</span>}</button>
            ))}
          </div>

          <div className="card" style={{ overflow:"auto", marginBottom:24 }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }} className="outfit">
              <thead>
                <tr style={{ borderBottom:"1px solid rgba(255,255,255,.06)" }}>
                  {["Order","Customer","Plan","Amount","Method","Status","Note","Actions"].map(h => (
                    <th key={h} style={{ padding:"13px 16px", textAlign:"left", color:"#64748B", fontWeight:600, fontSize:11, textTransform:"uppercase", letterSpacing:.5, whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockOrders.filter(o => adminTab==="all" || o.status.toLowerCase()===adminTab).map(o => (
                  <tr key={o.id} className="table-row" style={{ borderBottom:"1px solid rgba(255,255,255,.03)" }}>
                    <td style={{ padding:"13px 16px", color:"#F5A623", fontWeight:600 }}>{o.id}</td>
                    <td style={{ padding:"13px 16px" }}>
                      <div style={{ fontWeight:600, marginBottom:2 }}>{o.name}</div>
                      <div style={{ color:"#64748B", fontSize:11 }}>{o.email}</div>
                    </td>
                    <td style={{ padding:"13px 16px" }}>
                      <span className="badge" style={{ background:"rgba(245,166,35,.1)", color:"#F5A623", border:"1px solid rgba(245,166,35,.2)" }}>{o.plan}</span>
                    </td>
                    <td style={{ padding:"13px 16px", color:"#22C55E", fontWeight:700 }}>{o.amount}</td>
                    <td style={{ padding:"13px 16px", color:"#9CA3AF" }}>{o.method}</td>
                    <td style={{ padding:"13px 16px" }}>
                      <span className="badge" style={{ background: o.status==="Confirmed" ? "rgba(34,197,94,.12)" : o.status==="Pending" ? "rgba(245,166,35,.12)" : "rgba(239,68,68,.12)", color: o.status==="Confirmed" ? "#22C55E" : o.status==="Pending" ? "#F5A623" : "#EF4444", border:`1px solid ${o.status==="Confirmed" ? "rgba(34,197,94,.25)" : o.status==="Pending" ? "rgba(245,166,35,.25)" : "rgba(239,68,68,.25)"}` }}>{o.status}</span>
                    </td>
                    <td style={{ padding:"13px 16px", color:"#64748B", maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{o.note}</td>
                    <td style={{ padding:"13px 16px" }}>
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                        {o.status === "Pending" && (
                          <button className="btn outfit" style={{ padding:"5px 10px", fontSize:11, borderRadius:6, background:"rgba(34,197,94,.1)", color:"#22C55E", border:"1px solid rgba(34,197,94,.2)" }} onClick={() => showToast(`✅ ${o.name} confirmed! Credentials sent.`)}>✅ Confirm</button>
                        )}
                        <button className="btn outfit" style={{ padding:"5px 10px", fontSize:11, borderRadius:6, background:"rgba(59,130,246,.1)", color:"#3B82F6", border:"1px solid rgba(59,130,246,.2)" }} onClick={() => showToast(`📧 Credentials sent to ${o.email}`)}>📧 Send Creds</button>
                        {o.status === "Pending" && (
                          <button className="btn outfit" style={{ padding:"5px 10px", fontSize:11, borderRadius:6, background:"rgba(239,68,68,.1)", color:"#EF4444", border:"1px solid rgba(239,68,68,.2)" }} onClick={() => showToast(`❌ ${o.id} rejected`)}>✕ Reject</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Owner payment handles */}
          <div className="card" style={{ padding:"24px 26px", background:"rgba(245,166,35,.03)", border:"1px solid rgba(245,166,35,.12)" }}>
            <div className="syne" style={{ fontSize:16, fontWeight:700, color:"#F5A623", marginBottom:16 }}>⚙️ Your Payment Handles — Update These in Code</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:12 }}>
              {[["Venmo",OWNER.venmo,"#3D95CE"],["Cash App",OWNER.cashapp,"#00D64F"],["Zelle Email",OWNER.zelle,"#6D1ED4"],["Zelle Phone",OWNER.zellePhone,"#6D1ED4"],["Stripe Link",OWNER.stripe,"#6772E5"]].map(([label, val, color]) => (
                <div key={label} style={{ background:"#0B0F1C", borderRadius:9, padding:"12px 14px" }}>
                  <div className="outfit" style={{ fontSize:11, color:"#64748B", marginBottom:4 }}>{label}</div>
                  <div className="syne" style={{ fontSize:13, fontWeight:700, color }}>{val}</div>
                </div>
              ))}
            </div>
            <p className="outfit" style={{ fontSize:12, color:"#374151", marginTop:14 }}>To update: Open the code file and edit the <code style={{ color:"#F5A623", background:"rgba(245,166,35,.1)", padding:"1px 6px", borderRadius:4 }}>OWNER</code> object at the top with your real handles.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PAYMENT PANEL COMPONENT ──────────────────────────────────────
function PaymentPanel({ title, handle, color, emoji, amount, billing, totalYr, plan, qrVal, instructions, isZelle, zellePhone }) {
  const [copied, setCopied] = useState(null);
  const copy = (text, key) => {
    navigator.clipboard?.writeText(text).catch(()=>{});
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
        <span style={{ fontSize:24 }}>{emoji}</span>
        <span className="syne" style={{ fontSize:18, fontWeight:700, color }}>{title}</span>
      </div>
      <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
        {/* QR Code */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10, flexShrink:0 }}>
          <QRCode value={qrVal} size={140} color={color} />
          <span className="outfit" style={{ fontSize:11, color:"#64748B" }}>Scan QR Code</span>
        </div>
        {/* Details */}
        <div style={{ flex:1, minWidth:200 }}>
          <div style={{ marginBottom:14 }}>
            <div className="outfit" style={{ fontSize:11, color:"#64748B", marginBottom:6, textTransform:"uppercase", letterSpacing:1 }}>{isZelle ? "Send to Email" : "Handle / Username"}</div>
            <div style={{ background:"#0B0F1C", border:`1px solid ${color}40`, borderRadius:9, padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span className="syne" style={{ fontSize:16, fontWeight:700, color }}>{handle}</span>
              <button className="btn outfit" style={{ padding:"4px 12px", fontSize:11, borderRadius:6, background:`${color}20`, color, border:`1px solid ${color}40` }} onClick={() => copy(handle, "handle")}>{copied==="handle" ? "✓ Copied!" : "Copy"}</button>
            </div>
          </div>
          {isZelle && (
            <div style={{ marginBottom:14 }}>
              <div className="outfit" style={{ fontSize:11, color:"#64748B", marginBottom:6, textTransform:"uppercase", letterSpacing:1 }}>OR Phone Number</div>
              <div style={{ background:"#0B0F1C", border:`1px solid ${color}40`, borderRadius:9, padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span className="syne" style={{ fontSize:16, fontWeight:700, color }}>{zellePhone}</span>
                <button className="btn outfit" style={{ padding:"4px 12px", fontSize:11, borderRadius:6, background:`${color}20`, color, border:`1px solid ${color}40` }} onClick={() => copy(zellePhone, "phone")}>{copied==="phone" ? "✓ Copied!" : "Copy"}</button>
              </div>
            </div>
          )}
          <AmountBox price={amount} billing={billing} totalYr={totalYr} plan={plan} color={color} copy={copy} copied={copied} />
        </div>
      </div>
      {/* Instructions */}
      <div style={{ background:"rgba(255,255,255,.02)", borderRadius:10, padding:"16px 18px", marginTop:18 }}>
        <div className="outfit" style={{ fontSize:12, color:"#64748B", letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>Step-by-Step</div>
        {instructions.map((inst, i) => (
          <div key={i} style={{ display:"flex", gap:10, marginBottom:8, alignItems:"flex-start" }}>
            <span style={{ width:20, height:20, background:`${color}20`, borderRadius:"50%", display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:10, color, fontWeight:700, flexShrink:0, marginTop:1 }}>{i+1}</span>
            <span className="outfit" style={{ fontSize:13, color:"#9CA3AF", lineHeight:1.6 }}>{inst}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AmountBox({ price, billing, totalYr, plan, color, copy, copied }) {
  return (
    <div style={{ background:`${color}10`, border:`1px solid ${color}30`, borderRadius:10, padding:"14px 16px" }}>
      <div className="outfit" style={{ fontSize:11, color:"#64748B", marginBottom:4 }}>Amount to Send</div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <span className="syne" style={{ fontSize:28, fontWeight:800, color }}>
            ${billing === "yearly" ? totalYr : price}
          </span>
          <span className="outfit" style={{ fontSize:12, color:"#64748B" }}> {billing === "yearly" ? "/year" : "/month"}</span>
          <div className="outfit" style={{ fontSize:11, color:"#64748B", marginTop:2 }}>{plan} Plan · {billing === "yearly" ? "Annual" : "Monthly"}</div>
        </div>
        {copy && <button className="btn outfit" style={{ padding:"6px 14px", fontSize:12, borderRadius:7, background:`${color}20`, color, border:`1px solid ${color}40` }} onClick={() => copy(billing==="yearly" ? totalYr.toString() : price.toString(), "amount")}>{copied==="amount" ? "✓ Copied!" : "Copy $"}</button>}
      </div>
    </div>
  );
}
