import { useState, useEffect, useRef } from "react";

// ── CONFIG ────────────────────────────────────────────────────────────────────
// When you deploy to Render, replace this with your Render backend URL
// e.g. https://intelafrica-api.onrender.com
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// ── THEME ─────────────────────────────────────────────────────────────────────
const DARK = {
  bg: "#080812", surface: "rgba(255,255,255,0.025)", surface2: "rgba(255,255,255,0.05)",
  border: "rgba(255,255,255,0.07)", text: "#e8eaf2", textSub: "rgba(200,205,220,0.6)",
  textMuted: "rgba(255,255,255,0.18)", navBg: "rgba(8,8,18,0.97)",
  inputBg: "rgba(255,255,255,0.05)", inputBorder: "rgba(255,255,255,0.1)",
  accent: "#00e5a0", accentText: "#080812",
  heroBg: "linear-gradient(135deg,#00e5a012 0%,#0060ff08 50%,#e879f908 100%)",
  heroBorder: "rgba(0,229,160,0.15)", suggBg: "#111122",
  modalBg: "#0e0e1e", modalBd: "rgba(255,255,255,0.1)",
};
const LIGHT = {
  bg: "#f2f4f9", surface: "#ffffff", surface2: "#f8f9fc",
  border: "rgba(0,0,0,0.08)", text: "#111827", textSub: "#6b7280",
  textMuted: "#d1d5db", navBg: "rgba(255,255,255,0.98)",
  inputBg: "#ffffff", inputBorder: "rgba(0,0,0,0.12)",
  accent: "#0d9488", accentText: "#ffffff",
  heroBg: "linear-gradient(135deg,#0d948812,#0d948806,#7c3aed06)",
  heroBorder: "rgba(13,148,136,0.2)", suggBg: "#ffffff",
  modalBg: "#ffffff", modalBd: "rgba(0,0,0,0.1)",
};

const INDUSTRY_META = {
  Fintech:                    { icon: "💳", color: "#00c896" },
  "E-Commerce":               { icon: "🛍️", color: "#ff6b35" },
  "Logistics & Delivery":     { icon: "📦", color: "#f59e0b" },
  "Fashion & Retail":         { icon: "👗", color: "#f472b6" },
  Healthtech:                 { icon: "🏥", color: "#10b981" },
  Edtech:                     { icon: "🎓", color: "#8b5cf6" },
  "Real Estate & Proptech":   { icon: "🏠", color: "#38bdf8" },
  "Transportation & Mobility":{ icon: "🚗", color: "#fb923c" },
  "Consumer Goods & Beverages":{ icon:"🍺", color: "#c084fc" },
};

function getColor(industry) {
  return INDUSTRY_META[industry]?.color || "#00e5a0";
}
function getIcon(industry) {
  return INDUSTRY_META[industry]?.icon || "🏢";
}
function fmtNum(n) {
  if (!n) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}
function fmtUSD(n) {
  if (!n) return "—";
  if (n >= 1_000_000_000) return "$" + (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(1) + "M";
  return "$" + n.toLocaleString();
}

// ── COMPONENTS ────────────────────────────────────────────────────────────────

function Badge({ label, color, T }) {
  return (
    <span style={{
      background: color + "18", border: `1px solid ${color}30`,
      color, borderRadius: 20, padding: "2px 10px",
      fontSize: 11, fontWeight: 600, letterSpacing: "0.3px",
    }}>{label}</span>
  );
}

function ScoreRing({ score, size = 44, T }) {
  const r = 16, circ = 2 * Math.PI * r;
  const color = score >= 85 ? "#00e5a0" : score >= 70 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={3}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={3}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }}/>
      </svg>
      <span style={{ position:"absolute", inset:0, display:"flex", alignItems:"center",
        justifyContent:"center", fontSize: size < 40 ? 10 : 12, fontWeight: 800, color }}>
        {score}
      </span>
    </div>
  );
}

function DataBadge({ label, value, live, T }) {
  return (
    <div style={{ background: T.surface2, borderRadius: 8, padding: "8px 12px", minWidth: 80 }}>
      <div style={{ fontSize: 10, color: T.textSub, marginBottom: 2, display:"flex", alignItems:"center", gap:4 }}>
        {live && <span style={{ width:5, height:5, borderRadius:"50%", background:"#00e5a0", display:"inline-block" }}/>}
        {label}
      </div>
      <div style={{ fontWeight: 700, color: T.text, fontSize: 13 }}>{value || "—"}</div>
    </div>
  );
}

function CompanyCard({ c, T, onClick }) {
  const color = getColor(c.industry);
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? T.surface2 : T.surface,
        border: `1px solid ${hov ? color + "40" : T.border}`,
        borderRadius: 14, padding: "16px", cursor: "pointer",
        transition: "all 0.18s", transform: hov ? "translateY(-2px)" : "none",
        boxShadow: hov ? `0 8px 24px ${color}15` : "none",
      }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:38, height:38, borderRadius:10, background: color + "20",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>
            {getIcon(c.industry)}
          </div>
          <div>
            <div style={{ fontWeight:800, color: T.text, fontSize:14 }}>{c.name}</div>
            <div style={{ fontSize:11, color: T.textSub }}>{c.location} · {c.founded}</div>
          </div>
        </div>
        <ScoreRing score={c.score || 70} T={T} size={40}/>
      </div>
      <Badge label={c.industry} color={color} T={T}/>
      <div style={{ display:"flex", gap:6, marginTop:10, flexWrap:"wrap" }}>
        <DataBadge label="Monthly Visits" value={fmtNum(c.monthly_visits)} live={!!c.monthly_visits} T={T}/>
        <DataBadge label="Employees" value={fmtNum(c.employee_count || c.employees)} T={T}/>
        {c.total_funding_usd && <DataBadge label="Total Funding" value={fmtUSD(c.total_funding_usd)} live T={T}/>}
        {c.active_ad_count > 0 && <DataBadge label="Active Ads" value={c.active_ad_count + " ads"} live T={T}/>}
      </div>
    </div>
  );
}

function CompanyProfile({ company: c, T, onBack, onRefresh }) {
  const color = getColor(c.industry);
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await fetch(`${API_URL}/api/companies/${c.slug}/refresh`, { method: "POST" });
      onRefresh();
    } catch (e) { console.error(e); }
    setRefreshing(false);
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
        <button onClick={onBack} style={{ background: T.surface, border:`1px solid ${T.border}`,
          borderRadius:10, padding:"8px 14px", color: T.textSub, cursor:"pointer", fontSize:13 }}>
          ← Back
        </button>
        <div style={{ flex:1 }}>
          <h1 style={{ fontSize:24, fontWeight:900, color: T.text, margin:0 }}>{c.name}</h1>
          <p style={{ color: T.textSub, fontSize:13, margin:0 }}>{c.desc || c.description}</p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing}
          style={{ background: color + "20", border:`1px solid ${color}40`, color,
            borderRadius:10, padding:"8px 16px", cursor:"pointer", fontWeight:700, fontSize:13 }}>
          {refreshing ? "Refreshing…" : "🔄 Refresh Data"}
        </button>
      </div>

      {/* Stats grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:12, marginBottom:24 }}>
        {[
          ["Industry", c.industry],
          ["Location", c.location || c.headquarters],
          ["Founded", c.founded || c.founded_year],
          ["Employees", fmtNum(c.employee_count || c.employees)],
          ["Monthly Visits", fmtNum(c.monthly_visits)],
          ["Global Rank", c.global_rank ? "#" + c.global_rank.toLocaleString() : null],
          ["Total Funding", fmtUSD(c.total_funding_usd)],
          ["Funding Rounds", c.num_funding_rounds],
          ["Last Round", c.last_funding_type],
          ["Revenue Range", c.revenue_range || c.revenue],
          ["LinkedIn Followers", fmtNum(c.follower_count)],
          ["Active Ads", c.active_ad_count != null ? c.active_ad_count + " running" : null],
        ].map(([label, value]) => value ? (
          <div key={label} style={{ background: T.surface, border:`1px solid ${T.border}`,
            borderRadius:12, padding:"12px 14px" }}>
            <div style={{ fontSize:10, color: T.textSub, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>
              {label}
            </div>
            <div style={{ fontWeight:700, color: T.text, fontSize:14 }}>{value}</div>
          </div>
        ) : null)}
      </div>

      {/* Meta Ads */}
      {c.meta_ads && c.meta_ads.length > 0 && (
        <div style={{ background: T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:20, marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
            <span style={{ fontSize:18 }}>📣</span>
            <h3 style={{ margin:0, fontWeight:800, color: T.text, fontSize:16 }}>Active Facebook / Instagram Ads</h3>
            <span style={{ background:"#1877f220", border:"1px solid #1877f240", color:"#1877f2",
              borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:700 }}>
              LIVE · {c.active_ad_count} ads
            </span>
          </div>
          <div style={{ display:"grid", gap:10 }}>
            {c.meta_ads.slice(0, 5).map((ad, i) => (
              <div key={i} style={{ background: T.surface2, borderRadius:10, padding:"12px 14px" }}>
                {ad.headline && <div style={{ fontWeight:700, color: T.text, fontSize:13, marginBottom:4 }}>{ad.headline}</div>}
                {ad.body && <div style={{ color: T.textSub, fontSize:12, marginBottom:6 }}>{ad.body}</div>}
                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  {ad.spend_range && <span style={{ fontSize:11, color: T.textSub }}>💰 Spend: {ad.spend_range}</span>}
                  {ad.impressions_range && <span style={{ fontSize:11, color: T.textSub }}>👁 Impressions: {ad.impressions_range}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data freshness */}
      <div style={{ fontSize:11, color: T.textMuted, textAlign:"center", marginTop:16 }}>
        {c.linkedin_updated_at && `LinkedIn updated: ${new Date(c.linkedin_updated_at).toLocaleDateString()} · `}
        {c.traffic_updated_at && `Traffic updated: ${new Date(c.traffic_updated_at).toLocaleDateString()} · `}
        {c.meta_ads_updated_at && `Ads updated: ${new Date(c.meta_ads_updated_at).toLocaleDateString()}`}
        {!c.linkedin_updated_at && !c.traffic_updated_at && "⚠️ No real data yet — click Refresh Data to fetch"}
      </div>
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark] = useState(true);
  const T = dark ? DARK : LIGHT;
  const accentColor = T.accent;

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterIndustry, setFilterIndustry] = useState("All");
  const [sortBy, setSortBy] = useState("score");
  const [view, setView] = useState("explorer"); // explorer | profile
  const [selected, setSelected] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const searchRef = useRef();

  // Fetch all companies from backend
  async function loadCompanies() {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/companies`);
      if (!res.ok) throw new Error("Backend not reachable");
      const data = await res.json();
      setCompanies(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCompanies(); }, []);

  // Search suggestions
  useEffect(() => {
    if (search.length < 2) { setSuggestions([]); return; }
    setSuggestions(
      companies
        .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
        .slice(0, 6)
    );
  }, [search, companies]);

  const industries = ["All", ...Object.keys(INDUSTRY_META)];

  const filtered = companies
    .filter(c => filterIndustry === "All" || c.industry === filterIndustry)
    .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.industry?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "score") return (b.score || 0) - (a.score || 0);
      if (sortBy === "growth") return (b.growth || 0) - (a.growth || 0);
      if (sortBy === "revenue") return (b.revenueNum || 0) - (a.revenueNum || 0);
      if (sortBy === "visits") return (b.monthly_visits || 0) - (a.monthly_visits || 0);
      return a.name.localeCompare(b.name);
    });

  function selectCompany(c) {
    setSelected(c);
    setView("profile");
    setSearch("");
    setSuggestions([]);
    window.scrollTo(0, 0);
  }

  return (
    <div style={{ minHeight:"100vh", background: T.bg, color: T.text,
      fontFamily: "'DM Sans', system-ui, sans-serif", transition:"background 0.3s" }}>

      {/* NAV */}
      <nav style={{ position:"sticky", top:0, zIndex:100, background: T.navBg,
        borderBottom:`1px solid ${T.border}`, backdropFilter:"blur(12px)",
        padding:"0 24px", display:"flex", alignItems:"center", height:56, gap:16 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:900, fontSize:20,
          color: accentColor, letterSpacing:"-0.5px", cursor:"pointer" }}
          onClick={() => setView("explorer")}>
          IntelAfrica
        </div>
        <span style={{ fontSize:11, background: accentColor + "20", color: accentColor,
          border:`1px solid ${accentColor}30`, borderRadius:20, padding:"2px 8px", fontWeight:700 }}>
          Nigeria
        </span>
        <div style={{ flex:1 }}/>
        <button onClick={() => setDark(d => !d)}
          style={{ background: T.surface, border:`1px solid ${T.border}`, borderRadius:8,
            padding:"6px 12px", color: T.textSub, cursor:"pointer", fontSize:13 }}>
          {dark ? "☀️ Light" : "🌙 Dark"}
        </button>
      </nav>

      <main style={{ maxWidth:1200, margin:"0 auto", padding:"32px 24px" }}>

        {/* HERO SEARCH */}
        {view === "explorer" && (
          <div style={{ background: T.heroBg, border:`1px solid ${T.heroBorder}`,
            borderRadius:20, padding:"40px 32px", marginBottom:32, textAlign:"center" }}>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:36, fontWeight:900,
              color: T.text, margin:"0 0 8px", letterSpacing:"-1px" }}>
              Nigerian Company Intelligence
            </h1>
            <p style={{ color: T.textSub, fontSize:15, margin:"0 0 28px" }}>
              Real traffic, funding, ads & LinkedIn data for {companies.length}+ Nigerian companies
            </p>
            <div style={{ maxWidth:560, margin:"0 auto", position:"relative" }} ref={searchRef}>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search Flutterwave, Paystack, Jumia…"
                style={{ width:"100%", padding:"14px 20px 14px 48px", borderRadius:14,
                  background: T.inputBg, border:`1.5px solid ${T.inputBorder}`,
                  color: T.text, fontSize:15, outline:"none", boxSizing:"border-box",
                  transition:"border 0.2s" }}
                onFocus={e => e.target.style.borderColor = accentColor}
                onBlur={e => e.target.style.borderColor = T.inputBorder}/>
              <span style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)",
                fontSize:18 }}>🔍</span>
              {suggestions.length > 0 && (
                <div style={{ position:"absolute", top:"calc(100% + 8px)", left:0, right:0,
                  background: T.suggBg, border:`1px solid ${T.border}`, borderRadius:12,
                  overflow:"hidden", boxShadow:"0 16px 40px rgba(0,0,0,0.3)", zIndex:200 }}>
                  {suggestions.map(c => (
                    <div key={c.id || c.slug} onClick={() => selectCompany(c)}
                      style={{ padding:"12px 16px", cursor:"pointer", display:"flex",
                        alignItems:"center", gap:12, borderBottom:`1px solid ${T.border}`,
                        transition:"background 0.1s" }}
                      onMouseEnter={e => e.currentTarget.style.background = T.surface2}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <span style={{ fontSize:20 }}>{getIcon(c.industry)}</span>
                      <div>
                        <div style={{ fontWeight:700, color: T.text, fontSize:14 }}>{c.name}</div>
                        <div style={{ fontSize:11, color: T.textSub }}>{c.industry} · {c.location}</div>
                      </div>
                      {c.monthly_visits && (
                        <div style={{ marginLeft:"auto", fontSize:11, color: accentColor, fontWeight:700 }}>
                          {fmtNum(c.monthly_visits)}/mo
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {error && (
          <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)",
            borderRadius:12, padding:"16px 20px", marginBottom:24, color:"#ef4444" }}>
            <strong>⚠️ Backend not connected</strong> — showing cached data.
            <br/><span style={{ fontSize:12, opacity:0.8 }}>
              Deploy your backend to Render and set VITE_API_URL in your .env to see real data.
            </span>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div style={{ textAlign:"center", padding:"60px 0", color: T.textSub }}>
            <div style={{ fontSize:32, marginBottom:12 }}>⏳</div>
            <div>Loading companies…</div>
          </div>
        )}

        {/* EXPLORER */}
        {!loading && view === "explorer" && (
          <>
            {/* Filters */}
            <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap", marginBottom:16 }}>
              <select value={filterIndustry} onChange={e => setFilterIndustry(e.target.value)}
                style={{ background: T.inputBg, border:`1px solid ${T.inputBorder}`,
                  borderRadius:10, padding:"8px 12px", color: T.text, fontSize:13,
                  outline:"none", cursor:"pointer" }}>
                {industries.map(i => <option key={i} value={i}>{i === "All" ? "All Industries" : i}</option>)}
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                style={{ background: T.inputBg, border:`1px solid ${T.inputBorder}`,
                  borderRadius:10, padding:"8px 12px", color: T.text, fontSize:13,
                  outline:"none", cursor:"pointer" }}>
                <option value="score">Sort: Score</option>
                <option value="growth">Sort: Growth</option>
                <option value="revenue">Sort: Revenue</option>
                <option value="visits">Sort: Traffic</option>
                <option value="name">Sort: A–Z</option>
              </select>
              <span style={{ color: T.textSub, fontSize:13, marginLeft:"auto" }}>
                {filtered.length} companies
              </span>
            </div>

            {/* Industry pills */}
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:20 }}>
              {industries.map(ind => {
                const meta = INDUSTRY_META[ind];
                const active = filterIndustry === ind;
                const color = meta?.color || accentColor;
                return (
                  <button key={ind} onClick={() => setFilterIndustry(ind)}
                    style={{ background: active ? color + "20" : T.surface,
                      border:`1px solid ${active ? color + "45" : T.border}`,
                      borderRadius:20, padding:"5px 13px",
                      color: active ? color : T.textSub, fontSize:12,
                      fontWeight: active ? 700 : 500, cursor:"pointer", transition:"all 0.15s" }}>
                    {meta ? meta.icon + " " : ""}{ind === "All" ? "All" : ind}
                  </button>
                );
              })}
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
              <div style={{ textAlign:"center", padding:"60px 0", color: T.textSub }}>
                <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
                <div style={{ fontSize:16, fontWeight:700, color: T.text }}>No companies found</div>
              </div>
            ) : (
              <div style={{ display:"grid",
                gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:14 }}>
                {filtered.map(c => (
                  <CompanyCard key={c.id || c.slug} c={c} T={T} onClick={() => selectCompany(c)}/>
                ))}
              </div>
            )}
          </>
        )}

        {/* PROFILE */}
        {!loading && view === "profile" && selected && (
          <CompanyProfile company={selected} T={T}
            onBack={() => setView("explorer")}
            onRefresh={() => {
              loadCompanies().then(() => {
                const updated = companies.find(c => c.slug === selected.slug || c.id === selected.id);
                if (updated) setSelected(updated);
              });
            }}/>
        )}
      </main>

      <footer style={{ borderTop:`1px solid ${T.border}`, padding:"14px 32px",
        display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:12, color: T.textSub }}>
          © 2026 <strong style={{ color: accentColor }}>IntelAfrica</strong> · Nigeria Edition · {companies.length} Companies Tracked
        </span>
        <span style={{ fontSize:11, color: T.textMuted }}>
          Data refreshes daily at 2am Lagos time
        </span>
      </footer>
    </div>
  );
}
