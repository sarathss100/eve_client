export interface User {
  user_id: string;
  name: string;
  email: string;
  phone_number?: string;
  role: 'organizer' | 'attendee';
  joined_date: Date | undefined;
}

export interface Event {
  event_id: string;
  organizer_id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  total_tickets: number;
  available_tickets?: number;
  price: number;
  createdAt: string;
}

export interface Ticket {
  _id: string;
  ticket_id: string;
  event_id: string;
  user_id: string;
  ticket_type: 'attendee';
  status: 'booked' | 'used' | 'cancelled';
  price: number;
  booking_date: string;
  event?: Event;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface BookingData {
  eventId: string;
  userId: string;
  price: number;
}