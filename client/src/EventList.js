import React from "react";

function EventList({ events, onDelete, onEdit }) {
  return (
    <ul>
      {events.map(e => (
        <li key={e.id} style={{ marginBottom: "8px"}}>
          <strong>{e.title}</strong> — {e.date} at {e.time}
          {e.description && ` — ${e.description}`}
          <button onClick={() => onEdit(e)} style={{ marginLeft: "10px" }}>Edit</button>
          <button onClick={() => onDelete(e.id)} style={{ marginLeft: "5px" }}>❌</button>
        </li>
      ))}
    </ul>
  );
}

export default EventList;
