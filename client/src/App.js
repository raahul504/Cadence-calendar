import React, { useState, useEffect, useRef } from "react";
import Clock from "./clock";
import EventForm from "./EventForm";
import EventList from "./EventList";
import CalendarView from "./CalendarView";
//import "./modern-calendar.css";
import "./styles/index.css";

// API URL - will use environment variable in production, localhost in development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const eventsForSelectedDate = events.filter(e => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const selectedYYYYMMDD = `${year}-${month}-${day}`;
    return e.date === selectedYYYYMMDD;
  });
  const [editingEvent, setEditingEvent] = useState(null);
  const [isEventListExpanded, setIsEventListExpanded] = useState(false); // ADD THIS
  const [showEventForm, setShowEventForm] = useState(false); // ADD THIS
  const [eventToDelete, setEventToDelete] = useState(null); // ADD THIS
  const [viewMode, setViewMode] = useState("selected");
  const [showSettings, setShowSettings] = useState(false);
  const [timeFormat, setTimeFormat] = useState("12h");
  const [timeZone, setTimeZone] = useState("Asia/Kolkata");
  const [isChatSidebarExpanded, setIsChatSidebarExpanded] = useState(false);

  // Fetch events from backend
  useEffect(() => {
    fetch(`${API_URL}/events`)
      .then(res => res.json())
      .then(data => setEvents(data));
  }, []);

  const saveEvent = async (event) => {
    try {
      if (event.id) {
        // Existing event — update
        await fetch(`${API_URL}/events/${event.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(event),
        });

        setEvents((prev) =>
          prev.map((e) => (e.id === event.id ? { ...e, ...event } : e))
        );
      } else {
        // New event — add
        const res = await fetch(`${API_URL}/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(event),
        });
        const newEvent = await res.json();
        setEvents((prev) => [...prev, { ...event, id: newEvent.id }]);
      }

      setEditingEvent(null);
      setShowEventForm(false);
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

  // Delete event
  const deleteEvent = (id) => {
    fetch(`${API_URL}/events/${id}`, { method: "DELETE" })
      .then(() => setEvents(events.filter(e => e.id !== id)));
      setEventToDelete(null); // ADD THIS - Close confirmation modal
  };

  // Format date like "14 November 2025"
  const formatDateLong = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const selectedDateFormatted = selectedDate 
  ? formatDateLong(new Date(selectedDate))
  : "";

  const handleShowAllEvents = () => {
    setViewMode("all");
  };


  useEffect(() => {
    const handler = (e) => {
      if (showSettings && !settingsButtonRef.current.contains(e.target)) {
        setShowSettings(false);
      }
    };

    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [showSettings]);

  const settingsButtonRef = useRef(null);
  const [settingsPos, setSettingsPos] = useState({ x: 0, y: 0 });

  const toggleSettings = () => {
    if (!showSettings) {
      const rect = settingsButtonRef.current.getBoundingClientRect();
      setSettingsPos({ x: rect.left, y: rect.bottom });
    }
    setShowSettings(!showSettings);
  };

  return (
    <div className="app-container">
    <header className="app-header">
      <h1 className="app-title">
        <button 
          className="settings-trigger"
          ref={settingsButtonRef}
          onClick={() => setShowSettings(true)}
        >
          <span className="material-icons icon-large">settings</span>
        </button>
        Cadence
      </h1>

      <div className="clock-container">
        <Clock timeFormat={timeFormat} timeZone={timeZone}/>
      </div>
    </header>

      {/* REPLACE the main-grid section with this: */}
      <div className="calendar-layout">
        {/* Collapsible Event List Sidebar */}
        <div className={`event-sidebar ${isEventListExpanded ? 'expanded' : ''}`}
          onClick={() => {
              if (!isEventListExpanded) setIsEventListExpanded(true);
            }}>
          <div className="event-sidebar-header">
            {/*<button 
              className="btn-toggle-sidebar" 
              onClick={() => setIsEventListExpanded(!isEventListExpanded)}
            >
            {isEventListExpanded ? '◀' : '▶'}
            </button>*/}

            {isEventListExpanded && (
              <>
                <button
                  className="btn-toggle-sidebar"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEventListExpanded(false);
                  }}
                >
                  <span className="material-icons icon-large">chevron_left</span>
                  <span>Events</span>
                </button>
                <button 
                  className="btn btn-add-event"
                  onClick={() => setShowEventForm(true)}
                >
                  ➕
                </button>
              </>
            )}
          </div>

          {/* ---- NEW event list header ---- */}
          {isEventListExpanded && (
            <div className="event-list-header">
                <div className="event-list-title">
                    {viewMode === "all" 
                        ? "All Events"
                        : `Events for ${selectedDateFormatted}`
                    }
                </div>

                {viewMode !== "all" && (
                    <button 
                        className="all-events-btn"
                        onClick={handleShowAllEvents}
                    >
                        All Events
                    </button>
                )}
            </div>
          )} 

          {isEventListExpanded && (
            <EventList 
              events={
                viewMode === "all" 
                  ? events 
                  : events.filter(e => {
                    const year = selectedDate.getFullYear();
                    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                    const day = String(selectedDate.getDate()).padStart(2, '0');
                    const selectedYYYYMMDD = `${year}-${month}-${day}`;
                    return e.date === selectedYYYYMMDD;
                  })
              }
              onDelete={setEventToDelete} // CHANGE THIS - Pass setEventToDelete instead of deleteEvent 
              onEdit={(event) => {
                setEditingEvent(event);
                setShowEventForm(true);
              }}
              timeFormat={timeFormat}
              timeZone={timeZone}
            />
          )}
        </div>

        {/* Calendar View */}
        <div className={`calendar-main ${isEventListExpanded ? 'shrink' : ''}`}>
          <div className="card">
            <div className="calendar-summary">
              <strong>📅 {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
              })}</strong>
              <span style={{ marginLeft: "1rem" }}>
                {eventsForSelectedDate.length > 0
                  ? `${eventsForSelectedDate.length} event${eventsForSelectedDate.length > 1 ? 's' : ''} scheduled`
                  : "No events scheduled"}
              </span>
            </div>
            <CalendarView 
              events={events} 
              onSelectDate={setSelectedDate}
              onChangeViewMode={setViewMode} 
              selectedDate={selectedDate}
            />
          </div>
        </div>
        
        {/* RIGHT-SIDE CHAT SIDEBAR */}
        <div className={`chat-sidebar ${isChatSidebarExpanded ? "expanded" : ""}`}
        onClick={() => {
          if (!isChatSidebarExpanded) setIsChatSidebarExpanded(true);
        }}>

          <div className="chat-sidebar-header">

            {isChatSidebarExpanded && (
              <button
                  className="btn-toggle-sidebar" style={{width: "60%", padding: "5px 5px 5px 20px"}}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsChatSidebarExpanded(false);
                  }}
                >
                  <span>Ask Cadence</span>
                  <span className="material-icons icon-large">chevron_right</span>
                </button>
            )}
          </div>

          {isChatSidebarExpanded && (
            <div className="chat-content">
              Chat content coming soon...
            </div>
          )}
        </div>
      </div>

      {/* REPLACE Event Form with Modal */}
      {showEventForm && (
        <div className="modal-overlay" onClick={() => {
          setShowEventForm(false);
          setEditingEvent(null);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingEvent ? "✏️ Edit Event" : "➕ Create Event"}
              </h2>
              <button 
                className="btn-close-modal"
                onClick={() => {
                  setShowEventForm(false);
                  setEditingEvent(null);
                }}
              >
                ✕
              </button>
            </div>
            <EventForm 
              onSave={saveEvent} 
              editingEvent={editingEvent} 
              onCancel={() => {
                setShowEventForm(false);
                setEditingEvent(null);
              }} 
            />
          </div>
        </div>
      )}

      {/* ADD THIS - Delete Confirmation Modal */}
      {eventToDelete && (
        <div className="modal-overlay" onClick={() => setEventToDelete(null)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">⚠️ Delete Event</h2>
              <button 
                className="btn-close-modal"
                onClick={() => setEventToDelete(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p className="delete-warning-text">
                Are you sure you want to delete <strong>"{eventToDelete.title}"</strong>?
              </p>
              <p className="delete-warning-subtext">
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setEventToDelete(null)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-delete-confirm"
                onClick={() => deleteEvent(eventToDelete.id)}
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="settings-overlay" onClick={() => setShowSettings(false)}>
        <div 
          className="settings-popout" style={{ top: settingsPos.y + 126, left: settingsPos.x + 31 }}
          onClick={(e) => e.stopPropagation()} >
        {/*<div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>*/}
            <div className="modal-header">
              <h2 className="modal-title">⚙️ Settings</h2>
              <button 
                className="btn-close-modal"
                onClick={() => toggleSettings(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">

              {/* Universal Time Format */}
              <div className="settings-group">
                <label className="settings-label">Time Format</label>
                <select 
                  className="settings-select"
                  onChange={(e) => setTimeFormat(e.target.value)}
                  value={timeFormat}
                >
                  <option value="12h">12-hour (7:30 PM)</option>
                  <option value="24h">24-hour (19:30)</option>
                </select>
              </div>

              {/* Settings */}
              <div className="settings-group">
                <label className="settings-label">Time Zone</label>
                <select 
                  className="settings-select"
                  onChange={(e) => setTimeZone(e.target.value)}
                  value={timeZone}
                >
                  {Intl.supportedValuesOf("timeZone").map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>

            </div>
          {/*</div>*/}
        </div>
        </div>
      )}


      <footer className="app-footer">
        <p>Backend running on port 5000 • Made with ❤️</p>
      </footer>
    </div>
  );
}

export default App;