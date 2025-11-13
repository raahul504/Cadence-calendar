import React, { useState } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';

function CalendarView({ events, onSelectDate }) {
  const [date, setDate] = useState(new Date());

  const handleDateChange = (d) => {
    setDate(d);
    onSelectDate(d);
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <Calendar onChange={handleDateChange} value={date} />
      <p>Selected Date: {date.toDateString()}</p>
      <ul>
        {events
          .filter(e => e.date === date.toISOString().slice(0, 10))
          .map(e => (
            <li key={e.id}>
              <strong>{e.title}</strong> at {e.time}
            </li>
          ))}
      </ul>
    </div>
  );
}

export default CalendarView;
