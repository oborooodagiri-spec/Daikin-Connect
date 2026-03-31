// @ts-nocheck
// src/lib/googleCalendar.ts
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/google/oauth'
);

// If using a Service Account instead:
// const serviceAccountAuth = new google.auth.GoogleAuth({
//   credentials: {
//     client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
//     private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
//   },
//   scopes: ['https://www.googleapis.com/auth/calendar'],
// });
// const calendar = google.calendar({ version: 'v3', auth: serviceAccountAuth });

// Helper for sending the invite (Placeholder logic for when Google Auth is fully set up)
export async function createGoogleCalendarEvent(
  title: string, 
  description: string, 
  start_at: Date, 
  end_at: Date, 
  attendeeEmail: string
) {
  try {
    console.log("Mocking Google Calendar Event Creation:", { title, start_at, attendeeEmail });
    // const response = await calendar.events.insert({
    //   calendarId: 'primary',
    //   requestBody: {
    //     summary: title,
    //     description: description,
    //     start: { dateTime: start_at.toISOString() },
    //     end: { dateTime: end_at.toISOString() },
    //     attendees: [{ email: attendeeEmail }]
    //   }
    // });
    // return response.data.id;
    return `mock-google-event-${Date.now()}`;
  } catch (error) {
    console.error('Google Calendar Error:', error);
    return null;
  }
}
