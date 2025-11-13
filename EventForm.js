import React, { useState } from "react";

function EventForm({ onAdd }) {
  const [form, setForm] = useState({ title: "", date: "", time: "", description: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(form);
    setForm({ title: "", date: "", time: "", description: "" });
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
      <input placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
      <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
      <input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} required />
      <input placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
      <button type="submit">Add Event</button>
    </form>
  );
}

export default EventForm;
