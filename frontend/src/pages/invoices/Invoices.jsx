import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  getInvoices, generateInvoice, updatePaymentStatus,
} from "../../api/invoiceApi";
import { getBookings } from "../../api/bookingApi";
import {
  Search, X, RefreshCw, FileText, Plus,
  DollarSign, Clock, CheckCircle, AlertCircle,
  MoreVertical, Eye, CreditCard,
} from "lucide-react";

/* ─── constants ─── */
const STATUSES = ["All", "Pending", "Paid", "Refunded"];

const PAY_S = {
  Paid:     { bg: "rgba(34,197,94,0.12)",   text: "#22c55e" },
  Pending:  { bg: "rgba(245,158,11,0.12)",  text: "#fbbf24" },
  Refunded: { bg: "rgba(239,68,68,0.12)",   text: "#f87171" },
};

const INP = {
  width: "100%", background: "#1e2028",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10, padding: "10px 14px",
  color: "#fff", fontSize: 13, outline: "none",
};

const fmt = (n) => `$${(n || 0).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
const isStaff    = ["Admin", "Manager", "Receptionist"].includes(loggedUser?.role);

/* ════════════════════════════════════════════════════════ */
export default function Invoices() {
  const navigate = useNavigate();

  const [invoices,    setInvoices]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [statusFilter,setStatusFilter]= useState("All");
  const [showModal,   setShowModal]   = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(null);
  const [updating,    setUpdating]    = useState(null);

  useEffect(() => { fetchInvoices(); }, []);

  useEffect(() => {
    const close = () => setMenuOpen(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await getInvoices();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  /* ── stats ── */
  const stats = useMemo(() => {
    const total   = invoices.reduce((s, i) => s + (i.totalAmount || 0), 0);
    const pending = invoices.filter(i => i.paymentStatus === "Pending").reduce((s, i) => s + (i.totalAmount || 0), 0);
    const overdue = invoices.filter(i => i.paymentStatus === "Refunded").reduce((s, i) => s + (i.totalAmount || 0), 0);
    return { total, pending, overdue, count: invoices.length };
  }, [invoices]);

  /* ── filtered ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return invoices.filter(inv => {
      const matchSearch = !q ||
        inv.guest?.name?.toLowerCase().includes(q) ||
        inv.guest?.email?.toLowerCase().includes(q) ||
        inv._id?.toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || inv.paymentStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, search, statusFilter]);

  /* ── update payment ── */
  const handlePaymentUpdate = async (id, paymentStatus, paymentMethod) => {
    try {
      setUpdating(id);
      await updatePaymentStatus(id, { paymentStatus, paymentMethod });
      setInvoices(p => p.map(i => i._id === id ? { ...i, paymentStatus } : i));
    } catch (e) { console.error(e); }
    finally { setUpdating(null); setMenuOpen(null); }
  };

  /* ── invoice number ── */
  const invNum = (inv, idx) => {
    const d = new Date(inv.createdAt);
    return `INV-${d.getFullYear()}-${String(idx + 1).padStart(3, "0")}`;
  };

  return (
    <div className="space-y-6 text-white">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices & Payments</h1>
          <p className="text-xs mt-1" style={{ color: "#64748b" }}>
            Manage billing and payment transactions
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={fetchInvoices} className="p-2 rounded-xl transition"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <RefreshCw size={15} style={{ color: "#64748b" }} />
          </button>
          {isStaff && (
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
              style={{ background: "#3b82f6", color: "#fff" }}
              onMouseEnter={e => e.currentTarget.style.background = "#2563eb"}
              onMouseLeave={e => e.currentTarget.style.background = "#3b82f6"}>
              <Plus size={15} /> Create Invoice
            </button>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue",  value: fmt(stats.total),   icon: <DollarSign size={18}/>, color: "#22c55e", bg: "rgba(34,197,94,0.1)"   },
          { label: "Pending",        value: fmt(stats.pending),  icon: <Clock size={18}/>,      color: "#fbbf24", bg: "rgba(245,158,11,0.1)" },
          { label: "Overdue",        value: fmt(stats.overdue),  icon: <AlertCircle size={18}/>,color: "#f87171", bg: "rgba(239,68,68,0.1)"   },
          { label: "Total Invoices", value: stats.count,         icon: <FileText size={18}/>,   color: "#60a5fa", bg: "rgba(59,130,246,0.1)"  },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: s.bg, color: s.color }}>
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">{s.value}</p>
              <p className="text-[11px] mt-1.5" style={{ color: "#64748b" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] px-3 py-2 rounded-xl"
          style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.08)" }}>
          <Search size={14} style={{ color: "#475569" }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search invoices..."
            className="bg-transparent text-sm outline-none flex-1 placeholder-slate-600" />
          {search && <button onClick={() => setSearch("")}><X size={13} style={{ color: "#475569" }} /></button>}
        </div>

        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
          style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.08)" }}>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-transparent text-sm outline-none text-white cursor-pointer">
            {STATUSES.map(s => <option key={s} value={s} className="bg-[#1e2028]">{s === "All" ? "All Status" : s}</option>)}
          </select>
        </div>

        {(statusFilter !== "All" || search) && (
          <button onClick={() => { setSearch(""); setStatusFilter("All"); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs"
            style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
            <X size={12} /> Clear
          </button>
        )}

        <p className="ml-auto text-xs" style={{ color: "#475569" }}>
          <span className="text-white font-medium">{filtered.length}</span> of {invoices.length} invoices
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
          <FileText size={40} style={{ color: "#1e293b" }} />
          <p className="text-sm" style={{ color: "#334155" }}>No invoices found</p>
        </div>
      )}

      {/* Table */}
      {!loading && filtered.length > 0 && (
        <div className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.07)" }}>

          {/* Head */}
          <div className="grid grid-cols-12 px-5 py-3 text-[11px] font-semibold uppercase tracking-widest"
            style={{ background: "#16181d", color: "#334155", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="col-span-2">Invoice</div>
            <div className="col-span-3">Guest</div>
            <div className="col-span-3">Booking</div>
            <div className="col-span-1">Amount</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Due Date</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* Rows */}
          {filtered.map((inv, i) => {
            const ps       = PAY_S[inv.paymentStatus] || PAY_S.Pending;
            const initials = (inv.guest?.name || "G").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
            const dueDate  = inv.booking?.checkOutDate
              ? new Date(new Date(inv.booking.checkOutDate).getTime() + 7 * 86400000)
              : null;

            return (
              <div key={inv._id}
                className="grid grid-cols-12 px-5 py-4 items-center transition"
                style={{
                  background: i % 2 === 0 ? "#13151a" : "#16181d",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(59,130,246,0.04)"}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#13151a" : "#16181d"}>

                {/* Invoice # */}
                <div className="col-span-2">
                  <p className="text-xs font-semibold" style={{ color: "#60a5fa" }}>{invNum(inv, i)}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "#334155" }}>
                    {fmtDate(inv.createdAt)}
                  </p>
                </div>

                {/* Guest */}
                <div className="col-span-3 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                    style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{inv.guest?.name || "—"}</p>
                    <p className="text-[11px] truncate" style={{ color: "#475569" }}>{inv.guest?.email || "—"}</p>
                  </div>
                </div>

                {/* Booking */}
                <div className="col-span-3">
                  <p className="text-xs font-medium">
                    {inv.booking?.room?.type
                      ? `${inv.booking.room.type} Room ${inv.booking.room.roomNumber || ""}`
                      : "—"}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: "#475569" }}>
                    {inv.booking?.checkInDate
                      ? `${fmtDate(inv.booking.checkInDate)} – ${fmtDate(inv.booking.checkOutDate)}`
                      : "—"}
                  </p>
                </div>

                {/* Amount */}
                <div className="col-span-1">
                  <p className="text-sm font-bold" style={{ color: "#22c55e" }}>
                    {fmt(inv.totalAmount)}
                  </p>
                </div>

                {/* Status */}
                <div className="col-span-1">
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: ps.bg, color: ps.text }}>
                    {inv.paymentStatus}
                  </span>
                </div>

                {/* Due date */}
                <div className="col-span-1">
                  <p className="text-xs" style={{ color: "#64748b" }}>
                    {dueDate ? fmtDate(dueDate) : "—"}
                  </p>
                </div>

                {/* Actions */}
                <div className="col-span-1 flex justify-end" onClick={e => e.stopPropagation()}>
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === inv._id ? null : inv._id)}
                      className="p-1.5 rounded-lg transition"
                      style={{ color: "#475569" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <MoreVertical size={15} />
                    </button>

                    {menuOpen === inv._id && (
                      <div className="absolute right-0 top-8 z-30 rounded-xl overflow-hidden shadow-2xl"
                        style={{ background: "#1e2028", border: "1px solid rgba(255,255,255,0.1)", minWidth: 170 }}>

                        <MItem label="View Details" color="#60a5fa"
                          onClick={() => { navigate(`/invoices/${inv._id}`); setMenuOpen(null); }} />

                        {isStaff && inv.paymentStatus === "Pending" && (
                          <MItem label="Mark as Paid" color="#22c55e"
                            onClick={() => handlePaymentUpdate(inv._id, "Paid", inv.paymentMethod || "Cash")} />
                        )}
                        {isStaff && inv.paymentStatus === "Paid" && (
                          <MItem label="Mark as Refunded" color="#f87171"
                            onClick={() => handlePaymentUpdate(inv._id, "Refunded", inv.paymentMethod)} />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Generate Invoice Modal */}
      {showModal && (
        <GenerateInvoiceModal
          onClose={() => setShowModal(false)}
          onCreated={ni => { setInvoices(p => [ni, ...p]); setShowModal(false); }}
        />
      )}
    </div>
  );
}

/* ── Menu item ── */
function MItem({ label, color, onClick }) {
  return (
    <button onClick={onClick}
      className="w-full text-left px-4 py-2.5 text-xs font-medium transition"
      style={{ color }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      {label}
    </button>
  );
}

/* ════════════════════════════════════════════════════════
   GENERATE INVOICE MODAL
════════════════════════════════════════════════════════ */
function GenerateInvoiceModal({ onClose, onCreated }) {
  const [bookings,    setBookings]    = useState([]);
  const [form,        setForm]        = useState({
    bookingId: "", paymentMethod: "Cash", notes: "",
    additionalCharges: [],
  });
  const [newCharge,   setNewCharge]   = useState({ description: "", amount: "" });
  const [errors,      setErrors]      = useState({});
  const [loading,     setLoading]     = useState(false);
  const [apiErr,      setApiErr]      = useState("");

  useEffect(() => {
    getBookings().then(data => {
      const checkedOut = (Array.isArray(data) ? data : []).filter(b => b.status === "CheckedOut");
      setBookings(checkedOut);
    });
  }, []);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: "" })); };

  const addCharge = () => {
    if (!newCharge.description || !newCharge.amount) return;
    setForm(p => ({
      ...p,
      additionalCharges: [...p.additionalCharges, { description: newCharge.description, amount: parseFloat(newCharge.amount) }],
    }));
    setNewCharge({ description: "", amount: "" });
  };

  const removeCharge = (i) =>
    setForm(p => ({ ...p, additionalCharges: p.additionalCharges.filter((_, j) => j !== i) }));

  const validate = () => {
    const e = {};
    if (!form.bookingId) e.bookingId = "Select a booking";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true); setApiErr("");
      const ni = await generateInvoice(form);
      onCreated(ni);
    } catch (err) {
      setApiErr(err?.response?.data?.message || "Failed to generate invoice");
    } finally { setLoading(false); }
  };

  const selectedBooking = bookings.find(b => b._id === form.bookingId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }} onClick={onClose}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: "#13151a", border: "1px solid rgba(255,255,255,0.1)" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <h2 className="text-base font-semibold">Generate Invoice</h2>
            <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
              Create invoice for a checked-out booking
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.05)", color: "#64748b" }}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
            onMouseLeave={e => e.currentTarget.style.color = "#64748b"}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {apiErr && (
            <div className="px-4 py-3 rounded-xl text-sm"
              style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
              {apiErr}
            </div>
          )}

          {/* Booking select */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>
              Booking (Checked-Out) <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select value={form.bookingId} onChange={e => set("bookingId", e.target.value)}
              style={{ ...INP, cursor: "pointer", borderColor: errors.bookingId ? "#ef4444" : "rgba(255,255,255,0.08)" }}>
              <option value="" className="bg-[#1e2028]">Select booking</option>
              {bookings.map(b => (
                <option key={b._id} value={b._id} className="bg-[#1e2028]">
                  {b.guest?.name || "Guest"} — Room {b.room?.roomNumber || "—"} — ${b.totalAmount}
                </option>
              ))}
            </select>
            {errors.bookingId && <p className="text-[11px] mt-1" style={{ color: "#f87171" }}>{errors.bookingId}</p>}
            {bookings.length === 0 && (
              <p className="text-[11px] mt-1" style={{ color: "#475569" }}>
                No checked-out bookings without invoices found
              </p>
            )}
          </div>

          {/* Booking preview */}
          {selectedBooking && (
            <div className="px-4 py-3 rounded-xl space-y-1"
              style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
              <p className="text-xs font-medium" style={{ color: "#60a5fa" }}>Booking Summary</p>
              <p className="text-xs" style={{ color: "#94a3b8" }}>
                Guest: {selectedBooking.guest?.name} · Room {selectedBooking.room?.roomNumber} ({selectedBooking.room?.type})
              </p>
              <p className="text-xs" style={{ color: "#94a3b8" }}>
                Stay: {new Date(selectedBooking.checkInDate).toLocaleDateString()} → {new Date(selectedBooking.checkOutDate).toLocaleDateString()}
              </p>
              <p className="text-xs font-semibold" style={{ color: "#22c55e" }}>
                Room Charges: ${selectedBooking.totalAmount}
              </p>
            </div>
          )}

          {/* Payment method */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "#94a3b8" }}>Payment Method</label>
            <div className="grid grid-cols-4 gap-2">
              {["Cash", "Card", "Online", "Other"].map(m => (
                <button key={m} type="button" onClick={() => set("paymentMethod", m)}
                  className="py-2 rounded-xl text-xs font-medium transition"
                  style={{
                    background: form.paymentMethod === m ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.04)",
                    color:      form.paymentMethod === m ? "#60a5fa" : "#64748b",
                    border:     `1px solid ${form.paymentMethod === m ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.07)"}`,
                  }}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Additional charges */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "#94a3b8" }}>
              Additional Charges
            </label>
            {form.additionalCharges.map((c, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg mb-1.5"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="text-xs">{c.description}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold" style={{ color: "#22c55e" }}>${c.amount}</span>
                  <button type="button" onClick={() => removeCharge(i)}>
                    <X size={12} style={{ color: "#f87171" }} />
                  </button>
                </div>
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <input value={newCharge.description}
                onChange={e => setNewCharge(p => ({ ...p, description: e.target.value }))}
                placeholder="Description" style={{ ...INP, padding: "8px 12px" }} />
              <input value={newCharge.amount} type="number" min="0"
                onChange={e => setNewCharge(p => ({ ...p, amount: e.target.value }))}
                placeholder="$" style={{ ...INP, padding: "8px 12px", width: 80 }} />
              <button type="button" onClick={addCharge}
                className="px-3 rounded-xl text-xs font-medium shrink-0"
                style={{ background: "rgba(59,130,246,0.12)", color: "#60a5fa" }}>
                Add
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Notes</label>
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
              placeholder="Any additional notes..." rows={2}
              style={{ ...INP, resize: "none" }} />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: "rgba(255,255,255,0.05)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)" }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
              style={{ background: loading ? "#1d4ed8" : "#3b82f6", color: "#fff" }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#2563eb"; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#3b82f6"; }}>
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating...</>
                : <><Plus size={14} />Generate Invoice</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
