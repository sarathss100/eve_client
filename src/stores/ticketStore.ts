import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Ticket } from '../types';

interface TicketState {
  tickets: Ticket[];
  isLoading: boolean;
  error: string | null;
}

interface TicketActions {
  fetchUserTickets: (token: string) => Promise<void>;
  clearTickets: () => void;
  setError: (error: string | null) => void;
  updateTicketStatus: (ticketId: string, status: 'confirmed' | 'cancelled') => void;
  setLoading: (loading: boolean) => void;
}

type TicketStore = TicketState & TicketActions;

export const useTicketStore = create<TicketStore>()(
  persist(
    (set) => ({
      // State
      tickets: [],
      isLoading: false,
      error: null,

      fetchUserTickets: async (token: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tickets`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to fetch tickets:', response.status, errorText);
            set({ 
              error: `Failed to fetch tickets: ${response.status} ${response.statusText}`, 
              isLoading: false 
            });
            return;
          }

          const ticketsData = await response.json();

          let tickets = null;
    
          tickets = ticketsData.data.ticketDetails;
          
          
          if (!Array.isArray(tickets)) {
            console.error('Tickets data is not an array:', tickets);
            set({ 
              error: 'Invalid tickets data format', 
              isLoading: false 
            });
            return;
          }

          set({ tickets, isLoading: false });

          const eventIds = [...new Set(tickets.map((ticket: Ticket) => ticket.event_id))];
          if (eventIds.length > 0) {
            const { useEventStore } = await import('./eventStore');
            const eventStore = useEventStore.getState();
            
            try {
              await eventStore.fetchMultipleEvents(eventIds, token);
            } catch (eventError) {
              console.error('Failed to fetch event details:', eventError);
            }
          }
          
        } catch (error) {
          console.error('Network error fetching tickets:', error);
          set({ 
            error: `Network error: ${error instanceof Error ? error.message : 'Please check your connection and try again.'}`,
            isLoading: false 
          });
        }
      },

      updateTicketStatus: (ticketId: string, status: 'confirmed' | 'cancelled') => {
        set((state) => ({
          tickets: state.tickets.map(ticket =>
            ticket.ticket_id === ticketId
              ? { ...ticket, ticket_status: status }
              : ticket
          )
        }));
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearTickets: () => {
        set({
          tickets: [],
          isLoading: false,
          error: null,
        });
        
        if (useTicketStore.persist?.clearStorage) {
          useTicketStore.persist.clearStorage();
        }
      },
    }),
    {
      name: 'ticket-store',
      partialize: (state) => ({
        tickets: state.tickets,
      }),
      // Add version for cache busting if needed
      version: 1,
    }
  )
);

export const ticketStoreActions = {
  clearTickets: () => useTicketStore.getState().clearTickets(),
  setError: (error: string | null) => useTicketStore.getState().setError(error),
  updateTicketStatus: (ticketId: string, status: 'confirmed' | 'cancelled') => 
    useTicketStore.getState().updateTicketStatus(ticketId, status),
  setLoading: (loading: boolean) => useTicketStore.getState().setLoading(loading),
};