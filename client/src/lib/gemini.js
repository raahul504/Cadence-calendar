// Gemini AI Service
// client/src/lib/gemini.js

// Backend URL - Railway proxy
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// System prompt that defines Cadence's personality and capabilities
const SYSTEM_PROMPT = `You are Cadence, an intelligent calendar assistant built into a modern calendar application.

Your capabilities:
- Help users manage their schedule and events
- Answer questions about their calendar
- Provide scheduling suggestions and time management advice
- Create, modify, or delete events (when explicitly asked)
- Summarize upcoming events and schedule
- Give reminders and notifications suggestions

Your personality:
- Friendly, helpful, and professional
- Concise but informative
- Proactive in suggesting better ways to organize time
- Use emojis sparingly but appropriately (📅 🎯 ⏰)

CRITICAL: In your conversational responses to users:
- NEVER mention event IDs (like "ID: 18" or "event with ID 19")
- NEVER mention technical details like database operations and symbols like curly braces
- Speak naturally about events using only their titles, dates, and times
- IDs are only for internal JSON commands, never for user-facing text

When users ask to create/modify/delete events, respond with:
1. A friendly confirmation message 
2. A JSON command block with this exact format:

For CREATING a new event:
{"action": "create_event", "data": {"title": "Event Title", "date": "2024-12-25", "time": "14:30", "description": "Optional description"}}

For UPDATING an existing event (you MUST use the event's ID from the context):
{"action": "update_event", "data": {"id": "the-event-id-from-context", "title": "Updated Title", "date": "2024-12-25", "time": "15:00", "description": "Updated description"}}

For DELETING an event (you MUST use the event's ID from the context):
{"action": "delete_event", "data": {"id": "the-event-id-from-context"}}

IMPORTANT: When modifying or deleting events, always reference the event by its ID shown in the context above.

Otherwise, provide natural conversational responses.`;

// Format events for context
export const formatEventsForContext = (events) => {
  if (!events || events.length === 0) {
    return "The user currently has no events scheduled.";
  }

  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time || "00:00"}`);
    const dateB = new Date(`${b.date}T${b.time || "00:00"}`);
    return dateA - dateB;
  });

  const now = new Date();
  
  // Separate past and upcoming events
  const pastEvents = sortedEvents.filter(e => {
    const eventDate = new Date(`${e.date}T${e.time || "00:00"}`);
    return eventDate < now;
  }).slice(-100); // Last 100 past events
  
  const upcomingEvents = sortedEvents.filter(e => {
    const eventDate = new Date(`${e.date}T${e.time || "00:00"}`);
    return eventDate >= now;
  }).slice(0, 100); // Next 100 upcoming events

  let context = '';
  
  // Add past events if any
  if (pastEvents.length > 0) {
    context += `User's recent past events:\n`;
    pastEvents.forEach(event => {
      const date = new Date(event.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
      context += `- ID: ${event.id} | ${event.title} on ${date} at ${event.time || 'no time set'}`;
      if (event.description) context += ` (${event.description})`;
      context += `\n`;
    });
    context += `\n`;
  }
  
  // Add upcoming events
  if (upcomingEvents.length > 0) {
    context += `User's upcoming events:\n`;
    upcomingEvents.forEach(event => {
      const date = new Date(event.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
      context += `- ID: ${event.id} | ${event.title} on ${date} at ${event.time || 'no time set'}`;
      if (event.description) context += ` (${event.description})`;
      context += `\n`;
    });
  } else {
    context += `No upcoming events scheduled.\n`;
  }

  return context;
};

// Parse AI response for commands
// REPLACE the parseAICommand function (around line 60)
export const parseAICommand = (response) => {
  try {
    // Remove markdown code blocks first
    let cleaned = response.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Find all JSON objects (simple pattern that captures nested braces)
    const commands = [];
    let braceCount = 0;
    let jsonStart = -1;
    
    for (let i = 0; i < cleaned.length; i++) {
      if (cleaned[i] === '{') {
        if (braceCount === 0) jsonStart = i;
        braceCount++;
      } else if (cleaned[i] === '}') {
        braceCount--;
        if (braceCount === 0 && jsonStart !== -1) {
          const jsonStr = cleaned.substring(jsonStart, i + 1);
          try {
            const obj = JSON.parse(jsonStr);
            if (obj.action) {
              commands.push(obj);
            }
          } catch (e) {
            // Not valid JSON, skip
          }
          jsonStart = -1;
        }
      }
    }
    
    if (commands.length > 0) {
      // Remove all JSON objects from the message
      let cleanMessage = response;
      // Remove code blocks
      cleanMessage = cleanMessage.replace(/```json\s*[\s\S]*?\s*```/g, '');
      // Remove remaining JSON objects
      cleanMessage = cleanMessage.replace(/\{[\s\S]*?\}/g, '');
      cleanMessage = cleanMessage.trim();
      
      return {
        hasCommand: true,
        commands: commands,
        message: cleanMessage
      };
    }
  } catch (e) {
    console.error('Error parsing AI commands:', e);
  }
  
  return {
    hasCommand: false,
    message: response
  };
};

// Main chat function
export const chatWithGemini = async (userMessage, conversationHistory = [], userEvents = []) => {
  try {
    // Build context with system prompt and events
    const eventsContext = formatEventsForContext(userEvents);
    const fullContext = `${SYSTEM_PROMPT}\n\nCurrent date: ${new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}\n\n${eventsContext}`;

    // Build conversation history
    const history = conversationHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Prepare full history with context
    const fullHistory = [
      {
        role: 'user',
        parts: [{ text: fullContext }]
      },
      {
        role: 'model',
        parts: [{ text: 'I understand. I\'m Cadence, your calendar assistant. I\'m ready to help you manage your schedule!' }]
      },
      ...history
    ];

    // Call Railway backend instead of Gemini directly
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        history: fullHistory,
        message: userMessage,
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get AI response');
    }

    const data = await response.json();
    const responseText = data.response;

    // Parse for commands (frontend handles this)
    return parseAICommand(responseText);

  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to get AI response. Please try again.');
  }
};

// Helper: Generate event suggestions
export const generateEventSuggestions = async (context, userEvents = []) => {
  if (!genAI) return null;

  try {
    const eventsContext = formatEventsForContext(userEvents);
    const prompt = `${SYSTEM_PROMPT}\n\n${eventsContext}\n\nBased on the user's schedule, suggest 3 productive events or activities they could add. Consider gaps in their schedule and work-life balance. Format as a simple list.`;

    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        history: [],
        message: prompt,
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        }
      })
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return null;
  }
};

// Helper: Summarize schedule
export const summarizeSchedule = async (timeframe, userEvents = []) => {
  if (!genAI) return null;

  try {
    const eventsContext = formatEventsForContext(userEvents);
    const prompt = `${SYSTEM_PROMPT}\n\n${eventsContext}\n\nProvide a brief, friendly summary of the user's ${timeframe} schedule. Highlight the busiest days and any patterns you notice.`;

    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        history: [],
        message: prompt,
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        }
      })
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error summarizing schedule:', error);
    return null;
  }
};