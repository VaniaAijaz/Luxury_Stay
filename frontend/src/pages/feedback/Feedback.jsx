import { useEffect, useState, useMemo } from "react";
import { getFeedbacks, getAllFeedbacksAdmin, deleteFeedback } from "../../api/feedbackApi";
import { Search, X, RefreshCw, Star, Trash2, MessageSquare, ThumbsUp, Minus, ThumbsDown } from "lucide-react";

/* ─── helpers ─── */
const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
const isAdmin    = ["Admin", "Manager"].includes(loggedUser?.role);

const timeAgo = (d) => {
  const mins = Math.round((Date.now() - new Date(d)) / 60000);
  if (mins < 60)  return `${mins} min${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24)   return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  return `${Math.round(hrs / 24)} day${Math.round(hrs / 24) !== 1 ? "s" : ""} ago`;
};

const avg = (arr, key) => {
  const vals = arr.map(f => f[key]).filter(Boolean);
  return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : "—";
};

const StarRow = ({ value, max = 5, size = 14 }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: max }).map((_, i) => (
      <Star key={i} size={size}
        fill={i < Math.round(value) ? "#fbbf24" : "none"}
        style={{ color: i < Math.round(value) ? "#fbbf24" : "#334155" }} />
    ))}
  </div>
);

const BarRow = ({ label, value }) => (
  <div className="flex items-center gap-3">
    <span className="text-xs w-24 shrink-0" style={{ color: "#64748b" }}>{label}</span>
    <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
      <div className="h-1.5 rounded-full" style={{ width: `${(value / 5) * 100}%`, background: "#3b82f6" }} />
    </div>
    <span className="text-xs font-semibold w-6 text-right" style={{ color: "#94a3b8" }}>{value}</span>
  </div>
);

const SENTIMENTS = ["All", "Positive", "Neutral", "Negative"];
const RATINGS    = ["All", "5", "4", "3", "2", "1"];

const getSentiment = (rating) =>
  rating >= 4 ? "Positive" : rating === 3 ? "Neutral" : "Negative";

const SENTIMENT_S = {
  Positive: { bg: "rgba(34,197,94,0.12)",   text: "#22c55e", icon: <ThumbsUp size={11}/>   },
  Neutral:  { bg: "rgba(245,158,11,0.12)",  text: "#fbbf24", icon: <Minus size={11}/>      },
  Negative: { bg: "rgba(239,68,68,0.12)",   text: "#f87171", icon: <ThumbsDown size={11}/> },
};

/* ════════════════════════════════════════════════════════ */
export default function Feedback() {
  const [feedbacks,     setFeedbacks]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("All");
  const [ratingFilter,  setRatingFilter]  = useState("All");

  useEffect(() => { fetchFeedbacks(); }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const data = isAdmin ? await getAllFeedbacksAdmin() : await getFeedbacks();
      setFeedbacks(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this feedback?")) return;
    try {
      await deleteFeedback(id);
      setFeedbacks(p => p.filter(f => f._id !== id));
    } catch (e) { console.error(e); }
  };

  /* ── analytics ── */
  const analytics = useMemo(() => {
    if (!feedbacks.length) return null;
    const overallAvg = (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1);
    const dist = [5, 4, 3, 2, 1].map(n => ({
      star: n,
      count: feedbacks.filter(f => f.rating === n).length,
      pct: Math.round((feedbacks.filter(f => f.rating === n).length / feedbacks.length) * 100),
    }));
    const categories = [
      { label: "Cleanliness", value: parseFloat(avg(feedbacks, "cleanliness")) || 0 },
      { label: "Service",     value: parseFloat(avg(feedbacks, "service"))     || 0 },
      { label: "Amenities",   value: parseFloat(avg(feedbacks, "comfort"))     || 0 },
      { label: "Location",    value: parseFloat(avg(feedbacks, "location"))    || 0 },
    ];
    const positive = feedbacks.filter(f => f.rating >= 4).length;
    const neutral  = feedbacks.filter(f => f.rating === 3).length;
    const negative = feedbacks.filter(f => f.rating <= 2).length;
    return { overallAvg, dist, categories, positive, neutral, negative };
  }, [feedbacks]);

  /* ── filtered ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return feedbacks.filter(f => {
      const matchSearch = !q ||
        f.guest?.name?.toLowerCase().includes(q) ||
        f.comment?.toLowerCase().includes(q);
      const matchSentiment = sentimentFilter === "All" || getSentiment(f.rating) === sentimentFilter;
      const matchRating    = ratingFilter    === "All" || f.rating === parseInt(ratingFilter);
      return matchSearch && matchSentiment && matchRating;
    });
  }, [feedbacks, search, sentimentFilter, ratingFilter]);

  return (
    <div className="space-y-6 text-white">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Guest Feedback</h1>
          <p className="text-xs mt-1" style={{ color: "#64748b" }}>Monitor reviews and guest satisfaction</p>
        </div>
        <button onClick={fetchFeedbacks} className="p-2 rounded-xl transition"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <RefreshCw size={15} style={{ color: "#64748b" }} />
        </button>
      </div>

      {/* Analytics row */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Overall Rating */}
          <div className="rounded-2xl p-5"
            style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.07)" }}>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#475569" }}>
              Overall Rating
            </h3>
            <div className="flex items-end gap-4 mb-4">
              <p className="text-5xl font-bold">{analytics.overallAvg}</p>
              <div className="pb-1">
                <StarRow value={parseFloat(analytics.overallAvg)} size={16} />
                <p className="text-[11px] mt-1" style={{ color: "#475569" }}>
                  Based on {feedbacks.length} review{feedbacks.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {analytics.dist.map(d => (
                <div key={d.star} className="flex items-center gap-2">
                  <span className="text-[11px] w-3 text-right" style={{ color: "#64748b" }}>{d.star}</span>
                  <Star size={10} fill="#fbbf24" style={{ color: "#fbbf24" }} />
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-1.5 rounded-full" style={{ width: `${d.pct}%`, background: "#3b82f6" }} />
                  </div>
                  <span className="text-[11px] w-4 text-right" style={{ color: "#475569" }}>{d.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category Scores */}
          <div className="rounded-2xl p-5"
            style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.07)" }}>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#475569" }}>
              Category Scores
            </h3>
            <div className="space-y-4">
              {analytics.categories.map(c => (
                <BarRow key={c.label} label={c.label} value={c.value} />
              ))}
            </div>
          </div>

          {/* Sentiment Overview */}
          <div className="rounded-2xl p-5"
            style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.07)" }}>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#475569" }}>
              Sentiment Overview
            </h3>
            <div className="space-y-3">
              {[
                { label: "Positive", count: analytics.positive, ...SENTIMENT_S.Positive },
                { label: "Neutral",  count: analytics.neutral,  ...SENTIMENT_S.Neutral  },
                { label: "Negative", count: analytics.negative, ...SENTIMENT_S.Negative },
              ].map(s => {
                const pct = feedbacks.length ? Math.round((s.count / feedbacks.length) * 100) : 0;
                return (
                  <div key={s.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                          style={{ background: s.bg, color: s.text }}>
                          {s.icon}
                        </div>
                        <span className="text-xs font-medium">{s.label}</span>
                      </div>
                      <span className="text-xs" style={{ color: "#64748b" }}>
                        {s.count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div className="h-1.5 rounded-full transition-all"
                        style={{ width: `${pct}%`, background: s.text }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] px-3 py-2 rounded-xl"
          style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.08)" }}>
          <Search size={14} style={{ color: "#475569" }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search reviews..."
            className="bg-transparent text-sm outline-none flex-1 placeholder-slate-600" />
          {search && <button onClick={() => setSearch("")}><X size={13} style={{ color: "#475569" }} /></button>}
        </div>

        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
          style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.08)" }}>
          <select value={sentimentFilter} onChange={e => setSentimentFilter(e.target.value)}
            className="bg-transparent text-sm outline-none text-white cursor-pointer">
            {SENTIMENTS.map(s => <option key={s} value={s} className="bg-[#1e2028]">{s === "All" ? "All Sentim..." : s}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
          style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.08)" }}>
          <select value={ratingFilter} onChange={e => setRatingFilter(e.target.value)}
            className="bg-transparent text-sm outline-none text-white cursor-pointer">
            {RATINGS.map(r => <option key={r} value={r} className="bg-[#1e2028]">{r === "All" ? "All Ratings" : `${r} Stars`}</option>)}
          </select>
        </div>

        {(sentimentFilter !== "All" || ratingFilter !== "All" || search) && (
          <button onClick={() => { setSearch(""); setSentimentFilter("All"); setRatingFilter("All"); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs"
            style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
            <X size={12} /> Clear
          </button>
        )}

        <p className="ml-auto text-xs" style={{ color: "#475569" }}>
          <span className="text-white font-medium">{filtered.length}</span> of {feedbacks.length} reviews
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <MessageSquare size={40} style={{ color: "#1e293b" }} />
          <p className="text-sm" style={{ color: "#334155" }}>No reviews found</p>
        </div>
      )}

      {/* Review cards */}
      {!loading && filtered.length > 0 && (
        <div className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          {filtered.map((f, i) => {
            const sentiment = getSentiment(f.rating);
            const ss        = SENTIMENT_S[sentiment];
            const initials  = (f.guest?.name || "G").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
            const cats      = [
              { label: "Cleanliness", val: f.cleanliness },
              { label: "Service",     val: f.service     },
              { label: "Amenities",   val: f.comfort     },
              { label: "Location",    val: f.location    },
            ].filter(c => c.val);

            return (
              <div key={f._id}
                className="px-5 py-5 transition"
                style={{
                  background: i % 2 === 0 ? "#13151a" : "#16181d",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}>
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                    style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>
                    {initials}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Name + badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold">{f.guest?.name || "Guest"}</p>
                      <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: ss.bg, color: ss.text }}>
                        {ss.icon} {sentiment}
                      </span>
                      {!f.isPublic && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(245,158,11,0.12)", color: "#fbbf24" }}>
                          Private
                        </span>
                      )}
                    </div>

                    {/* Booking info */}
                    {f.booking && (
                      <p className="text-[11px] mt-0.5" style={{ color: "#475569" }}>
                        {f.booking.checkInDate
                          ? `${new Date(f.booking.checkInDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${new Date(f.booking.checkOutDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                          : ""}
                      </p>
                    )}

                    {/* Comment */}
                    {f.comment && (
                      <>
                        <p className="text-sm font-medium mt-2">
                          {f.comment.length > 60 ? f.comment.slice(0, 60) + "..." : f.comment.split("\n")[0]}
                        </p>
                        <p className="text-xs mt-1 line-clamp-2" style={{ color: "#64748b" }}>
                          {f.comment}
                        </p>
                      </>
                    )}

                    {/* Category scores */}
                    {cats.length > 0 && (
                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        {cats.map(c => (
                          <div key={c.label} className="flex items-center gap-1">
                            <span className="text-[10px]" style={{ color: "#475569" }}>{c.label}</span>
                            <StarRow value={c.val} size={10} />
                            <span className="text-[10px] font-semibold" style={{ color: "#94a3b8" }}>{c.val}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right — rating + time + delete */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <StarRow value={f.rating} size={13} />
                      <span className="text-sm font-bold">{f.rating}.0</span>
                    </div>
                    <p className="text-[11px]" style={{ color: "#334155" }}>{timeAgo(f.createdAt)}</p>
                    {isAdmin && (
                      <button onClick={() => handleDelete(f._id)}
                        className="p-1.5 rounded-lg transition"
                        style={{ color: "#334155" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#f87171"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#334155"; }}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
