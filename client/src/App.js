import React, { useState, useEffect } from "react";
import Clock from "./clock";
import EventForm from "./EventForm";
import EventList from "./EventList";
import CalendarView from "./CalendarView";

function App() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const eventsForSelectedDate = events.filter(
    e => e.date === selectedDate.toISOString().slice(0, 10));
  const [editingEvent, setEditingEvent] = useState(null);


  // Fetch events from backend
  useEffect(() => {
    fetch("http://localhost:5000/events")
      .then(res => res.json())
      .then(data => setEvents(data));
  }, []);

  const saveEvent = async (event) => {
  if (event.id) {
    // 🟢 Existing event — update
    await fetch(`http://localhost:5000/events/${event.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });

    // Update state locally so UI refreshes immediately
    setEvents((prev) =>
      prev.map((e) => (e.id === event.id ? { ...e, ...event } : e))
    );
  } else {
    // 🆕 New event — add
    const res = await fetch("http://localhost:5000/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
    const newEvent = await res.json();
    setEvents((prev) => [...prev, { ...event, id: newEvent.id }]);
  }

  setEditingEvent(null); // close edit mode
};


  // Delete event
  const deleteEvent = (id) => {
    fetch(`http://localhost:5000/events/${id}`, { method: "DELETE" })
      .then(() => setEvents(events.filter(e => e.id !== id)));
  };
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>🕓 My Clock & Calendar App</h1>
      <Clock />

      <EventForm onSave={saveEvent} editingEvent={editingEvent} onCancel={() => setEditingEvent(null)} />
      <EventList events={events} onDelete={deleteEvent} onEdit={setEditingEvent} />

      <div style={{ marginBottom: "10px" }}>
        <strong>Task Summary for {selectedDate.toDateString()}:</strong>{" "}
        {eventsForSelectedDate.length > 0
          ? `You have ${eventsForSelectedDate.length} event(s) today.`
          : "No events today."}
      </div>

      <CalendarView events={events} onSelectDate={setSelectedDate} />

      <br></br><p>Welcome! Backend is running on port 5000.</p>
    </div>
  );
}

export default App;
