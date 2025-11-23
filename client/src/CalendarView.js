import React, { useState } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';

function CalendarView({ events, selectedDate, onSelectDate, onChangeViewMode }) {
  const handleDateChange = (d) => {
    onSelectDate(d);
    onChangeViewMode("selected");   // <-- add this line
  };

  // ADD THIS - Function to check if a date is in the past
  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  return (
    <div>
      <Calendar 
        onChange={handleDateChange} 
        value={selectedDate}
        //minDate={new Date()} ADD THIS - Disable past dates
        tileClassName={({ date: d, view }) => {
          if (view === 'month') {
            // Create local date string without timezone conversion
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const formatted = `${year}-${month}-${day}`;

            const eventDates = events.map(e => {
              // Extract just the date part if it's a full timestamp
              if (e.date && e.date.includes('T')) {
                return e.date.split('T')[0];
              }
              return e.date;
            });
            if (eventDates.includes(formatted)) {
              return 'event-date';
            }
          }
          return null;
        }}
        /*tileDisabled={({ date: d, view }) => { // ADD THIS - Disable past dates
          if (view === 'month') {
            return isPastDate(d);
          }
          return false;
        }}*/
      />
    </div>
  );
}

export default CalendarView;