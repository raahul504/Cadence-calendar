import React, { useState, useEffect } from "react";

function Clock({ timeFormat, timeZone }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const day = time.toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: timeZone
  });

  const formattedTime = time.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: timeFormat === "12h",
    timeZone: timeZone
  });

  return (
    <div className="clock-time">
      {`${day}, ${formattedTime}`}
    </div>
  );
}

export default Clock;