import React from "react";

function EventList({ events, onDelete, onEdit, timeFormat, timeZone }) {
  if (events.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '2rem 1rem' }}>
      <div className="empty-state-icon" style={{ fontSize: '2rem' }}>📭</div>
      <p className="empty-state-text" style={{ fontSize: '0.9rem' }}>
        No events yet
      </p>
      </div>
    );
  }

  // Sort events chronologically (date + time)
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time || "00:00"}`);
    const dateB = new Date(`${b.date}T${b.time || "00:00"}`);
    return dateA - dateB;
  });

  const formatTime = (time) => {
    if (!time) return "No time";

    // Time coming from server: "13:00:00"
    const [h, m] = time.split(":");

    const dateObj = new Date();
    dateObj.setHours(h, m);

    return dateObj.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: timeFormat === "12h",
      timeZone
    });
  };

  const formatDate = (date) => {
    if (!date) return "No date";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone
    });
  };

  return (
    <ul className="event-list">
      {sortedEvents.map(e => (
        <li key={e.id} className="event-item" style={{ borderLeftColor: e.color || '#3f51b5' }}>
          <div className="event-info">
            <div className="event-title">{e.title}</div>
            <div className="event-meta">
              <span><span class="material-icons icon-small">calendar_today</span> {formatDate(e.date)}</span>
              <span><span class="material-icons icon-small">access_time</span> {formatTime(e.time)}</span>
            </div>
            {e.description && (
              <div className="event-description">{e.description}</div>
            )}
          </div>
          <div className="event-actions">
            <button 
              onClick={() => onEdit(e)} 
              className="btn btn-edit"
              title="Edit event"
            >
              <span className="material-icons icon-small">edit</span>
            </button>
            <button 
              onClick={() => onDelete(e)} // CHANGE from onDelete(e.id) to onDelete(e)
              className="btn btn-danger"
              title="Delete event"
            >
              <span className="material-icons icon-small">delete</span>
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default EventList;