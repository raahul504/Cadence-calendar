import React from "react";

function EventList({ events, onDelete }) {
  return (
    <ul>
      {events.map(e => (
        <li key={e.id}>
          <strong>{e.title}</strong> — {e.date} at {e.time}
          <button onClick={() => onDelete(e.id)}>❌</button>
        </li>
      ))}
    </ul>
  );
}

export default EventList;
