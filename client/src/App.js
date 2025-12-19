import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "./contexts/AuthContext";
import { eventHelpers } from "./lib/supabase";
import Clock from "./clock";
import EventForm from "./EventForm";
import EventList from "./EventList";
import CalendarView from "./CalendarView";
import ChatInterface from "./ChatInterface"; 
import AuthPage from "./pages/AuthPage";
import "./styles/index.css";

function App() {
  const { user, profile, loading: authLoading, signOut, updateProfile } = useAuth();
  
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [editingEvent, setEditingEvent] = useState(null);
  const [isEventListExpanded, setIsEventListExpanded] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [viewMode, setViewMode] = useState("selected");
  const [isChatSidebarExpanded, setIsChatSidebarExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  // Local state for settings
  const [timeFormat, setTimeFormat] = useState("12h");
  const [timeZone, setTimeZone] = useState("Asia/Calcutta");

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsWidth, setSettingsWidth] = useState(0);
  const [showClearChatModal, setShowClearChatModal] = useState(false);

  // Load settings from profile
  useEffect(() => {
    if (profile) {
      setTimeFormat(profile.time_format || "12h");
      setTimeZone(profile.timezone || "Asia/Calcutta");
    }
  }, [profile]);
  
  useEffect(() => {
    window.openChatClearModal = () => {
      setShowClearChatModal(true);
    };
  }, []);

  // Filter events for selected date
  const eventsForSelectedDate = events.filter(e => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const selectedYYYYMMDD = `${year}-${month}-${day}`;
    return e.date === selectedYYYYMMDD;
  });

  // Fetch events when user is authenticated
  useEffect(() => {
    if (user) {
      loadEvents();
    } else {
      setEvents([]);
    }
  }, [user]);

  const loadEvents = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await eventHelpers.getEvents(user.id);
      if (error) throw error;
      
      const formattedEvents = data.map(event => ({
        ...event,
        date: event.date instanceof Date 
          ? `${event.date.getFullYear()}-${String(event.date.getMonth() + 1).padStart(2, '0')}-${String(event.date.getDate()).padStart(2, '0')}`
          : event.date
      }));
      
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveEvent = async (event) => {
    try {
      if (event.id) {
        const { data, error } = await eventHelpers.updateEvent(event.id, event);
        if (error) throw error;
        setEvents((prev) => prev.map((e) => (e.id === event.id ? { ...e, ...data } : e)));
      } else {
        const { data, error } = await eventHelpers.createEvent(user.id, event);
        if (error) throw error;
        const formattedEvent = {
          ...data,
          date: data.date instanceof Date 
            ? `${data.date.getFullYear()}-${String(data.date.getMonth() + 1).padStart(2, '0')}-${String(data.date.getDate()).padStart(2, '0')}`
            : data.date
        };
        setEvents((prev) => [...prev, formattedEvent]);
      }
      setEditingEvent(null);
      setShowEventForm(false);
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Failed to save event. Please try again.");
    }
  };

  const deleteEvent = async (id) => {
    try {
      const { error } = await eventHelpers.deleteEvent(id);
      if (error) throw error;
      setEvents(events.filter(e => e.id !== id));
      setEventToDelete(null);
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event. Please try again.");
    }
  };

  // NEW - Handle AI event commands
const handleEventCommand = async (commandData) => {
  console.log('=== handleEventCommand called ===');
  console.log('Raw commandData:', commandData);
  console.log('Type:', typeof commandData);
  
  try {
    // Handle different input formats
    let commands = [];
    
    if (Array.isArray(commandData)) {
      commands = commandData;
      console.log('Format: Array');
    } else if (commandData?.commands) {
      commands = commandData.commands;
      console.log('Format: Has commands property');
    } else if (commandData?.command) {
      commands = [commandData.command];
      console.log('Format: Has command property');
    } else if (commandData?.action) {
      commands = [commandData];
      console.log('Format: Single command object');
    } else {
      console.log('Invalid command data:', commandData);
      return;
    }
    
    console.log('Commands to execute:', commands);
    
    for (const command of commands) {
      console.log('Executing command:', command);
      
      switch (command.action) {
        case 'create_event':
          if (command.data) {
            console.log('Creating event:', command.data);
            await saveEvent(command.data);
          }
          break;
          
        case 'update_event':
          if (command.data && command.data.id) {
            console.log('Updating event:', command.data);
            await saveEvent(command.data);
          }
          break;
          
        case 'delete_event':
          if (command.data && command.data.id) {
            console.log('Deleting event:', command.data.id);
            await deleteEvent(command.data.id);
          }
          break;
          
        default:
          console.log('Unknown command:', command.action);
      }
    }
    
    await loadEvents();
    console.log('Events reloaded');
    
  } catch (error) {
    console.error('Error executing AI command:', error);
    throw error;
  }
};

  const formatDateLong = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const selectedDateFormatted = selectedDate ? formatDateLong(new Date(selectedDate)) : "";
  const handleShowAllEvents = () => setViewMode("all");

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Peek drawer when cursor touches left 5px
      if (!settingsOpen && e.clientX <= 5) {
        setSettingsWidth(30);
      } else if (!settingsOpen) {
        setSettingsWidth(0);
      }
    };

    const handleMouseDown = (e) => {
      // Click-to-open when clicking within the left 15px zone
      if (!settingsOpen && e.clientX <= 15) {
        setSettingsOpen(true);
        setSettingsWidth(320);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, [settingsOpen]);

  if (authLoading) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
         
          <span className="header-date">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric"
            })}
          </span>
        </div>

        <div className="clock-container">
          <Clock timeFormat={timeFormat} timeZone={timeZone}/>
        </div>
      </header>
      <div className="calendar-layout">
        <div className={`event-sidebar ${isEventListExpanded ? 'expanded' : ''}`}
          onClick={() => { if (!isEventListExpanded) setIsEventListExpanded(true); }}>
          <div className="event-sidebar-header">
            {!isEventListExpanded && (
              <div className="sidebar-vertical-label left">Events</div>
            )}

            {isEventListExpanded && (
              <>
                <button className="btn-toggle-sidebar" onClick={(e) => { e.stopPropagation(); setIsEventListExpanded(false); }}>
                  <span className="material-icons icon-large">chevron_left</span>
                  <span>Events</span>
                </button>
                <button className="btn btn-add-event" onClick={() => setShowEventForm(true)}>➕</button>
              </>
            )}
          </div>

          {isEventListExpanded && (
            <div className="event-list-header">
              <div className="event-list-title">
                {viewMode === "all" ? "All Events" : `Events for ${selectedDateFormatted}`}
              </div>
              {viewMode !== "all" && <button className="all-events-btn" onClick={handleShowAllEvents}>All Events</button>}
            </div>
          )} 

          {isEventListExpanded && (
            loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading events...</div>
            ) : (
              <EventList events={viewMode === "all" ? events : eventsForSelectedDate} onDelete={setEventToDelete}
                onEdit={(event) => { setEditingEvent(event); setShowEventForm(true); }}
                timeFormat={timeFormat} timeZone={timeZone} />
            )
          )}
        </div>

        <div className={`calendar-main ${isEventListExpanded ? 'shrink' : ''}`}>
          <div className="card">
            <div className="calendar-summary">
              <strong>{selectedDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</strong>
              <span style={{ marginLeft: "1rem" }}>
                {eventsForSelectedDate.length > 0 ? `${eventsForSelectedDate.length} event${eventsForSelectedDate.length > 1 ? 's' : ''} scheduled` : "No events scheduled"}
              </span>
            </div>
            <CalendarView events={events} onChangeViewMode={setViewMode} selectedDate={selectedDate} onSelectDate={(date) => {
              setSelectedDate(date);
              // Format clicked date to YYYY-MM-DD
              const y = date.getFullYear();
              const m = String(date.getMonth() + 1).padStart(2, "0");
              const d = String(date.getDate()).padStart(2, "0");
              const formatted = `${y}-${m}-${d}`;

              // Check how many events match this date
              const hasEvents = events.some(e => e.date === formatted);

              if (hasEvents) {
                setIsEventListExpanded(true);   // <-- OPEN SIDEBAR
                setViewMode("selected");        // <-- Show events for that date
              }
              }}/>
          </div>
        </div>
        
        <div className={`chat-sidebar ${isChatSidebarExpanded ? "expanded" : ""}`}
          onClick={() => { if (!isChatSidebarExpanded) setIsChatSidebarExpanded(true); }}>
          <div className="chat-sidebar-header">
            {!isChatSidebarExpanded && (
              <div className="sidebar-vertical-label right">Ask Cadence</div>
            )}

          {isChatSidebarExpanded && (
            <>
              <button
                className="btn-clear-chat"
                onClick={(e) => {
                  e.stopPropagation();
                  window.openChatClearModal();   // Call ChatInterface method
                }}
                title="Clear conversation"
              >
                <span className="material-icons icon-medium">delete_outline</span>
              </button>

              <button className="btn-toggle-sidebar" 
                style={{ width: "60%", padding: "5px 5px 5px 20px" }}
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setIsChatSidebarExpanded(false); 
                }}>
                <span>Ask Cadence</span>
                <span className="material-icons icon-large">chevron_right</span>
              </button>
            </>
          )}

          </div>
          {isChatSidebarExpanded && <ChatInterface 
              userId={user.id}
              userEvents={events}
              onEventCommand={handleEventCommand}
              onClearChatRef={(handler) => {window.confirmClearChat = handler;}}/>
          }
        </div>
      </div>

      {showEventForm && (
        <div className="modal-overlay" onClick={() => { setShowEventForm(false); setEditingEvent(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingEvent ? "✏️ Edit Event" : "➕ Create Event"}</h2>
              <button className="btn-close-modal" onClick={() => { setShowEventForm(false); setEditingEvent(null); }}>✕</button>
            </div>
            <EventForm onSave={saveEvent} editingEvent={editingEvent} onCancel={() => { setShowEventForm(false); setEditingEvent(null); }} />
          </div>
        </div>
      )}

      {eventToDelete && (
        <div className="modal-overlay" onClick={() => setEventToDelete(null)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">⚠️ Delete Event</h2>
              <button className="btn-close-modal" onClick={() => setEventToDelete(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="delete-warning-text">Are you sure you want to delete <strong>"{eventToDelete.title}"</strong>?</p>
              <p className="delete-warning-subtext">This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setEventToDelete(null)}>Cancel</button>
              <button className="btn btn-delete-confirm" onClick={() => deleteEvent(eventToDelete.id)}>Delete Event</button>
            </div>
          </div>
        </div>
      )}

      {showClearChatModal && (
        <div className="modal-overlay" onClick={() => setShowClearChatModal(false)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">🧹 Clear Chat</h2>
              <button className="btn-close-modal" onClick={() => setShowClearChatModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <p className="delete-warning-text">
                Are you sure you want to clear this conversation?
              </p>
              <p className="delete-warning-subtext">This action cannot be undone.</p>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowClearChatModal(false)}
              >
                Cancel
              </button>

              <button
                className="btn btn-delete-confirm"
                onClick={async () => {
                  if (typeof window.confirmClearChat === "function") {
                    await window.confirmClearChat();
                  }
                  setShowClearChatModal(false);
                }}
              >
                Clear Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Drawer */}
      <div
        className="settings-drawer"
        style={{
          width: `${settingsWidth}px`,
        }}
      >
        <div className="settings-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">⚙️ Settings</h2>
            <button
              className="btn-close-modal"
              onClick={() => {
                setSettingsOpen(false);
                setSettingsWidth(0);
              }}
            >
              ✕
            </button>
          </div>

          <div className="modal-body">
            <div className="settings-group">
              <label className="settings-label">Signed in as</label>
              <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                {profile?.full_name || user?.email}
              </p>
            </div>
            <div className="settings-group">
              <label className="settings-label">Time Format</label>
              <select
                className="settings-select"
                value={timeFormat}
                onChange={async (e) => {
                  const newFormat = e.target.value;
                  setTimeFormat(newFormat);
                  // auto-save to Supabase
                  await updateProfile({ time_format: newFormat });
                }}
              >
                <option value="12h">12-hour (7:30 PM)</option>
                <option value="24h">24-hour (19:30)</option>
              </select>
            </div>
            <div className="settings-group">
              <label className="settings-label">Time Zone</label>
              <select
                className="settings-select"
                value={timeZone}
                onChange={async (e) => {
                  const newZone = e.target.value;
                  setTimeZone(newZone);

                  // auto-save to Supabase
                  await updateProfile({ timezone: newZone });
                }}
              >
                {Intl.supportedValuesOf("timeZone").map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}>
            </div>
            <button className="btn sign-out-btn" onClick={signOut}>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Background Overlay */}
      {settingsOpen && (
        <div
          className="settings-overlay"
          onClick={() => {
            setSettingsOpen(false);
            setSettingsWidth(0);
          }}
        ></div>
      )}
      {/*<footer className="app-footer">
        <p>Welcome, {profile?.full_name || user?.email} • Made with ❤️</p>
      </footer>*/}
    </div>
  );
}

export default App;