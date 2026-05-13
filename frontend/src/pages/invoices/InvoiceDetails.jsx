import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInvoiceById, updatePaymentStatus } from "../../api/invoiceApi";
import { ArrowLeft, FileText, AlertCircle, CheckCircle, Save } from "lucide-react";

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

const fmt    = (n) => `$${(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
const isStaff    = ["Admin", "Manager", "Receptionist"].includes(loggedUser?.role);

export default function InvoiceDetails() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [invoice,  setInvoice]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");
  const [payForm,  setPayForm]  = useState({ paymentStatus: "", paymentMethod: "" });

  useEffect(() => { fetchInvoice(); }, [id]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const data = await getInvoiceById(id);
      setInvoice(data);
      setPayForm({ paymentStatus: data.paymentStatus, paymentMethod: data.paymentMethod || "Cash" });
    } catch (e) { setError("Invoice not found"); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updatePaymentStatus(id, payForm);
      setInvoice(p => ({ ...p, ...payForm }));
    } catch (e) { setError("Update failed"); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !invoice) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <AlertCircle size={40} style={{ color: "#334155" }} />
      <p style={{ color: "#64748b" }}>{error || "Not found"}</p>
      <button onClick={() => navigate("/invoices")}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
        style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa" }}>
        <ArrowLeft size={14} /> Back
      </button>
    </div>
  );

  const ps = PAY_S[invoice.paymentStatus] || PAY_S.Pending;

  return (
    <div className="max-w-2xl mx-auto space-y-5 text-white">

      {/* Back */}
      <button onClick={() => navigate("/invoices")}
        className="flex items-center gap-2 text-sm transition"
        style={{ color: "#64748b" }}
        onMouseEnter={e => e.currentTarget.style.color = "#fff"}
        onMouseLeave={e => e.currentTarget.style.color = "#64748b"}>
        <ArrowLeft size={15} /> Back to Invoices
      </button>

      {/* Header */}
      <div className="rounded-2xl p-6"
        style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(59,130,246,0.12)" }}>
              <FileText size={20} style={{ color: "#60a5fa" }} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Invoice</h1>
              <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                Generated {fmtDate(invoice.createdAt)}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ background: ps.bg, color: ps.text }}>
            {invoice.paymentStatus}
          </span>
        </div>
      </div>

      {/* Guest + Booking */}
      <div className="rounded-2xl p-6 space-y-3"
        style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.07)" }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: "#94a3b8" }}>Guest & Booking</h3>
        {[
          { label: "Guest",       value: invoice.guest?.name || "—" },
          { label: "Email",       value: invoice.guest?.email || "—" },
          { label: "Room",        value: invoice.booking?.room ? `Room ${invoice.booking.room.roomNumber} — ${invoice.booking.room.type}` : "—" },
          { label: "Check-in",    value: fmtDate(invoice.booking?.checkInDate) },
          { label: "Check-out",   value: fmtDate(invoice.booking?.checkOutDate) },
          { label: "Pay Method",  value: invoice.paymentMethod || "—" },
        ].map((r, i) => (
          <div key={i} className="flex items-center justify-between py-2.5"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <span className="text-xs" style={{ color: "#475569" }}>{r.label}</span>
            <span className="text-sm font-medium">{r.value}</span>
          </div>
        ))}
      </div>

      {/* Charges breakdown */}
      <div className="rounded-2xl p-6"
        style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.07)" }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: "#94a3b8" }}>Charges Breakdown</h3>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span style={{ color: "#64748b" }}>Room Charges</span>
            <span>{fmt(invoice.roomCharges)}</span>
          </div>

          {invoice.additionalCharges?.map((c, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span style={{ color: "#64748b" }}>{c.description}</span>
              <span>{fmt(c.amount)}</span>
            </div>
          ))}

          <div className="flex justify-between text-sm pt-2"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ color: "#64748b" }}>Tax ({((invoice.taxRate || 0.1) * 100).toFixed(0)}%)</span>
            <span>{fmt(invoice.taxAmount)}</span>
          </div>

          <div className="flex justify-between text-base font-bold pt-2"
            style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <span>Total</span>
            <span style={{ color: "#22c55e" }}>{fmt(invoice.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Update payment — staff only */}
      {isStaff && (
        <div className="rounded-2xl p-6 space-y-4"
          style={{ background: "#16181d", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "#94a3b8" }}>Update Payment</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Status</label>
              <select value={payForm.paymentStatus}
                onChange={e => setPayForm(p => ({ ...p, paymentStatus: e.target.value }))}
                style={{ ...INP, cursor: "pointer" }}>
                {["Pending", "Paid", "Refunded"].map(s => (
                  <option key={s} value={s} className="bg-[#1e2028]">{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>Method</label>
              <select value={payForm.paymentMethod}
                onChange={e => setPayForm(p => ({ ...p, paymentMethod: e.target.value }))}
                style={{ ...INP, cursor: "pointer" }}>
                {["Cash", "Card", "Online", "Other"].map(m => (
                  <option key={m} value={m} className="bg-[#1e2028]">{m}</option>
                ))}
              </select>
            </div>
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition"
            style={{ background: saving ? "#1d4ed8" : "#3b82f6", color: "#fff" }}>
            {saving
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
              : <><Save size={14} />Save Changes</>}
          </button>
        </div>
      )}
    </div>
  );
}
