import { useState } from "react";
import { db, auth } from "../services/firebase";
import { addDoc, collection } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const CATEGORIES = ["Education", "Environment", "Health", "Community", "Technology", "Other"];

export default function CreateEvent() {
  const [form, setForm] = useState({
    title: "",
    desc: "",
    category: "Education",
    location: "",
    date: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const nav = useNavigate();

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleCreate = async () => {
    if (!form.title || !form.desc) return alert("Title and description are required.");
    setLoading(true);
    try {
      await addDoc(collection(db, "events"), {
        ...form,
        createdBy: auth.currentUser.uid,
        creatorEmail: auth.currentUser.email,
        createdAt: Date.now(),
      });
      setSuccess(true);
      setTimeout(() => nav("/"), 1500);
    } catch (err) {
      alert("Error creating event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center fade-up">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">Event Created!</h2>
          <p className="text-brand-muted">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 max-w-2xl mx-auto">
      <div className="mb-8 fade-up">
        <h1 className="font-display text-4xl font-bold text-white">
          Create <span className="text-brand-green">Event</span>
        </h1>
        <p className="text-brand-muted mt-1">Organise a volunteer opportunity for your community</p>
      </div>

      <div className="glass rounded-2xl p-8 fade-up-1">
        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">
              Event Title *
            </label>
            <input
              type="text"
              className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-white placeholder-brand-muted/50 focus:outline-none focus:border-brand-green/60 focus:ring-1 focus:ring-brand-green/30 transition-all"
              placeholder="e.g. Beach Cleanup Drive 2025"
              value={form.title}
              onChange={handleChange("title")}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">
              Description *
            </label>
            <textarea
              rows={4}
              className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-white placeholder-brand-muted/50 focus:outline-none focus:border-brand-green/60 focus:ring-1 focus:ring-brand-green/30 transition-all resize-none"
              placeholder="Describe the event, what volunteers will do, who it helps..."
              value={form.desc}
              onChange={handleChange("desc")}
            />
          </div>

          {/* Category + Date row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-green/60 focus:ring-1 focus:ring-brand-green/30 transition-all appearance-none"
                value={form.category}
                onChange={handleChange("category")}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">
                Event Date
              </label>
              <input
                type="date"
                className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-green/60 focus:ring-1 focus:ring-brand-green/30 transition-all"
                value={form.date}
                onChange={handleChange("date")}
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">
              Location
            </label>
            <input
              type="text"
              className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-white placeholder-brand-muted/50 focus:outline-none focus:border-brand-green/60 focus:ring-1 focus:ring-brand-green/30 transition-all"
              placeholder="e.g. Bengaluru, Karnataka"
              value={form.location}
              onChange={handleChange("location")}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => nav("/")}
              className="flex-1 py-3 rounded-xl border border-brand-border text-brand-muted font-medium hover:text-brand-light hover:border-brand-muted transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-brand-green text-brand-dark font-display font-bold hover:bg-brand-green/90 active:scale-95 transition-all disabled:opacity-60 glow-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Creating...
                </span>
              ) : "Create Event →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
