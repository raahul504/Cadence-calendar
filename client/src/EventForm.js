import React, { useState, useEffect } from "react";

function EventForm({ onAdd, onSave, editingEvent, onCancel }) {
  const [form, setForm] = useState({ title: "", date: "", time: "", description: "" });
  const [title, setTitle] = useState(editingEvent ? editingEvent.title : "");
  const [date, setDate] = useState(editingEvent ? editingEvent.date : "");
  const [time, setTime] = useState(editingEvent ? editingEvent.time : "");

  useEffect(() => {
    if (editingEvent) {
      // Prefill form with existing data
        setForm({
            title: editingEvent.title || "",
            date: editingEvent.date || "",
            time: editingEvent.time || "",
            description: editingEvent.description || "",
        });
    }
  }, [editingEvent]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Merge existing data with new changes for edit

  const eventToSave = editingEvent ? { ...editingEvent, ...form } : form; // only fields you changed in form overwrite existing
     // new event
     onSave(eventToSave); // unified add/edit handler
     // Reset form after saving
  setForm({ title: "", date: "", time: "", description: "" });
};

const handleCancel = () => {
  onCancel(); // clear editingEvent in App.js
  setForm({ title: "", date: "", time: "", description: "" }); // clear form fields

  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
      <input placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
      <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
      <input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
      <input placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
      <button type="submit">{editingEvent ? "Update Event" : "Add Event"}</button>
      {editingEvent && <button type="button" onClick={handleCancel}>Cancel</button>}
    </form>
  );
}

export default EventForm;
