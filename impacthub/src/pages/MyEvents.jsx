import { useEffect, useState } from "react";
import { db, auth } from "../services/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";

export default function MyEvents() {
  const [joined, setJoined] = useState([]);
  const [created, setCreated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("joined");
  const [deleting, setDeleting] = useState(null);
  const user = auth.currentUser;

  const fetchData = async () => {
    setLoading(true);
    try {
      // Joined events (via applications)
      const appsSnap = await getDocs(
        query(collection(db, "applications"), where("userId", "==", user.uid))
      );
      const apps = appsSnap.docs.map((d) => ({ appId: d.id, ...d.data() }));

      // Fetch full event details for each
      const joinedFull = await Promise.all(
        apps.map(async (app) => {
          try {
            const evtDoc = await getDoc(doc(db, "events", app.eventId));
            if (evtDoc.exists()) {
              return { appId: app.appId, joinedAt: app.joinedAt, ...evtDoc.data(), id: evtDoc.id };
            }
          } catch {}
          return null;
        })
      );
      setJoined(joinedFull.filter(Boolean));

      // Created events
      const createdSnap = await getDocs(
        query(collection(db, "events"), where("createdBy", "==", user.uid))
      );
      setCreated(createdSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteEvent = async (eventId) => {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    setDeleting(eventId);
    try {
      await deleteDoc(doc(db, "events", eventId));
      setCreated((prev) => prev.filter((e) => e.id !== eventId));
    } catch {
      alert("Error deleting event.");
    } finally {
      setDeleting(null);
    }
  };

  const handleLeave = async (appId, eventId) => {
    if (!confirm("Leave this event?")) return;
    try {
      await deleteDoc(doc(db, "applications", appId));
      setJoined((prev) => prev.filter((e) => e.appId !== appId));
    } catch {
      alert("Error leaving event.");
    }
  };

  const formatDate = (ts) => {
    if (!ts) return "";
    return new Date(ts).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric"
    });
  };

  const EventCard = ({ event, isCreated }) => (
    <div className="glass rounded-2xl p-5 flex flex-col gap-3 hover:border-brand-green/30 transition-all group">
      <div className="flex items-start justify-between gap-2">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-green/10 text-brand-green border border-brand-green/20">
          {event.category || "General"}
        </span>
        {isCreated ? (
          <span className="text-xs text-brand-muted">Created {formatDate(event.createdAt)}</span>
        ) : (
          <span className="text-xs text-brand-muted">Joined {formatDate(event.joinedAt)}</span>
        )}
      </div>

      <h3 className="font-display font-bold text-lg text-white group-hover:text-brand-green transition-colors">
        {event.title}
      </h3>
      <p className="text-brand-muted text-sm leading-relaxed line-clamp-2">{event.desc}</p>

      {event.location && (
        <div className="flex items-center gap-1.5 text-xs text-brand-muted">
          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 shrink-0" stroke="currentColor" strokeWidth="2">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
          {event.location}
        </div>
      )}

      {isCreated ? (
        <button
          onClick={() => handleDeleteEvent(event.id)}
          disabled={deleting === event.id}
          className="w-full py-2.5 rounded-xl text-sm font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 active:scale-95 transition-all disabled:opacity-50"
        >
          {deleting === event.id ? "Deleting..." : "🗑 Delete Event"}
        </button>
      ) : (
        <button
          onClick={() => handleLeave(event.appId, event.id)}
          className="w-full py-2.5 rounded-xl text-sm font-medium border border-brand-border text-brand-muted hover:border-red-500/30 hover:text-red-400 active:scale-95 transition-all"
        >
          Leave Event
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-10 max-w-6xl mx-auto">
      <div className="mb-8 fade-up">
        <h1 className="font-display text-4xl font-bold text-white">
          My <span className="text-brand-green">Activity</span>
        </h1>
        <p className="text-brand-muted mt-1">Track your events and contributions</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 fade-up-1">
        <button
          onClick={() => setTab("joined")}
          className={`px-5 py-2.5 rounded-xl text-sm font-display font-semibold transition-all ${
            tab === "joined"
              ? "bg-brand-green text-brand-dark"
              : "glass text-brand-muted hover:text-brand-light"
          }`}
        >
          Joined ({joined.length})
        </button>
        <button
          onClick={() => setTab("created")}
          className={`px-5 py-2.5 rounded-xl text-sm font-display font-semibold transition-all ${
            tab === "created"
              ? "bg-brand-green text-brand-dark"
              : "glass text-brand-muted hover:text-brand-light"
          }`}
        >
          Created ({created.length})
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <svg className="animate-spin w-8 h-8 text-brand-green" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>
      ) : tab === "joined" ? (
        joined.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🙌</div>
            <h3 className="font-display text-xl font-bold text-white mb-2">No events joined yet</h3>
            <p className="text-brand-muted text-sm">Browse events and start making an impact!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {joined.map((e) => <EventCard key={e.appId} event={e} isCreated={false} />)}
          </div>
        )
      ) : (
        created.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="font-display text-xl font-bold text-white mb-2">No events created yet</h3>
            <p className="text-brand-muted text-sm">Create your first event to get started!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {created.map((e) => <EventCard key={e.id} event={e} isCreated={true} />)}
          </div>
        )
      )}
    </div>
  );
}
