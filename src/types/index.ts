export interface User {
  user_id: string;
  name: string;
  email: string;
  phone_number?: string;
  role: 'organizer' | 'attendee';
  joined_date: Date;
}

export interface Event {
  event_id: string;
  organizer_id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  initial_ticket_count: number;
  total_tickets: number;
  price: number;
  createdAt: string;
}

export interface Ticket {
  ticket_id: string;
  event_id: string;
  user_id: string;
  session_id: string;
  amount: string;
  ticket_status: 'confirmed' | 'cancelled';
  purchased_at: string;
  event?: Event;
  user?: User;
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