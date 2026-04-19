import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { auth } from "../services/firebase";
import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Link } from "react-router-dom";

const CATEGORIES = ["All", "Education", "Environment", "Health", "Community", "Technology", "Other"];

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);
  const [filter, setFilter] = useState("All");
  const user = auth.currentUser;

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch events
      const eventsSnap = await getDocs(
        query(collection(db, "events"), orderBy("createdAt", "desc"))
      );
      setEvents(eventsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      // Fetch user's applications
      const appsSnap = await getDocs(
        query(collection(db, "applications"), where("userId", "==", user.uid))
      );
      setApplications(appsSnap.docs.map((d) => d.data().eventId));
    } catch (err) {
      // If index not ready, fetch without orderBy
      const eventsSnap = await getDocs(collection(db, "events"));
      setEvents(eventsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleJoin = async (event) => {
    if (applications.includes(event.id)) return;
    setJoining(event.id);
    try {
      await addDoc(collection(db, "applications"), {
        eventId: event.id,
        eventTitle: event.title,
        userId: user.uid,
        userEmail: user.email,
        joinedAt: Date.now(),
      });
      setApplications((prev) => [...prev, event.id]);
    } catch (err) {
      alert("Error joining event. Please try again.");
    } finally {
      setJoining(null);
    }
  };

  const filteredEvents = filter === "All"
    ? events
    : events.filter((e) => e.category === filter);

  const formatDate = (ts) => {
    if (!ts) return "";
    return new Date(ts).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric"
    });
  };

  return (
    <div className="min-h-screen px-4 py-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-10 fade-up">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-4xl font-bold text-white">
              Upcoming <span className="text-brand-green">Events</span>
            </h1>
            <p className="text-brand-muted mt-1">
              {events.length} opportunities to create impact
            </p>
          </div>
          <Link
            to="/create"
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-green text-brand-dark font-display font-bold rounded-xl hover:bg-brand-green/90 active:scale-95 transition-all glow-sm"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
            </svg>
            New Event
          </Link>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { label: "Total Events", value: events.length, icon: "📅" },
            { label: "Joined", value: applications.length, icon: "✅" },
            { label: "Available", value: events.length - applications.length, icon: "🎯" },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="font-display text-2xl font-bold text-brand-green">{stat.value}</div>
              <div className="text-xs text-brand-muted">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 fade-up-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filter === cat
                ? "bg-brand-green text-brand-dark font-bold"
                : "bg-brand-card border border-brand-border text-brand-muted hover:text-brand-light"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin w-8 h-8 text-brand-green" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <span className="text-brand-muted text-sm">Loading events...</span>
          </div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-5xl mb-4">🌱</div>
          <h3 className="font-display text-xl font-bold text-white mb-2">No events yet</h3>
          <p className="text-brand-muted text-sm mb-6">Be the first to create an event!</p>
          <Link
            to="/create"
            className="inline-flex px-6 py-2.5 bg-brand-green text-brand-dark font-display font-bold rounded-xl hover:bg-brand-green/90 transition-all"
          >
            Create Event
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((event, i) => {
            const joined = applications.includes(event.id);
            return (
              <div
                key={event.id}
                className={`glass rounded-2xl p-5 flex flex-col gap-3 hover:border-brand-green/30 transition-all group fade-up`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Category badge */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-green/10 text-brand-green border border-brand-green/20">
                    {event.category || "General"}
                  </span>
                  <span className="text-xs text-brand-muted">{formatDate(event.createdAt)}</span>
                </div>

                {/* Title */}
                <h3 className="font-display font-bold text-lg text-white leading-snug group-hover:text-brand-green transition-colors">
                  {event.title}
                </h3>

                {/* Description */}
                <p className="text-brand-muted text-sm leading-relaxed flex-1 line-clamp-3">
                  {event.desc}
                </p>

                {/* Location */}
                {event.location && (
                  <div className="flex items-center gap-1.5 text-xs text-brand-muted">
                    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 shrink-0" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                      <circle cx="12" cy="9" r="2.5"/>
                    </svg>
                    {event.location}
                  </div>
                )}

                {/* Join Button */}
                <button
                  onClick={() => handleJoin(event)}
                  disabled={joined || joining === event.id}
                  className={`w-full py-2.5 rounded-xl text-sm font-display font-bold transition-all ${
                    joined
                      ? "bg-brand-green/10 text-brand-green border border-brand-green/30 cursor-default"
                      : joining === event.id
                      ? "bg-brand-card border border-brand-border text-brand-muted cursor-wait"
                      : "bg-brand-green text-brand-dark hover:bg-brand-green/90 active:scale-95"
                  }`}
                >
                  {joined ? "✓ Joined" : joining === event.id ? "Joining..." : "Join Event"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
