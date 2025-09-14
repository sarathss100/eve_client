import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Event } from '../types';

interface EventState {
  events: Record<string, Event>;
  isLoading: boolean;
  error: string | null;
}

interface EventActions {
  fetchEvent: (eventId: string, token: string) => Promise<Event | null>;
  fetchMultipleEvents: (eventIds: string[], token: string) => Promise<Record<string, Event>>;
  setEvents: (events: Record<string, Event>) => void;
  clearEvents: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

type EventStore = EventState & EventActions;

export const useEventStore = create<EventStore>()(
  persist(
    (set, get) => ({
      // State
      events: {},
      isLoading: false,
      error: null,

      fetchEvent: async (eventId: string, token: string): Promise<Event | null> => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/events/${eventId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });

          if (response.ok) {
            const eventData = await response.json();
            const event = eventData.data.event;
            
            if (event && event.event_id) {
              // Update the events record
              set((state) => ({
                events: {
                  ...state.events,
                  [eventId]: event
                }
              }));
              
              return event;
            } else {
              console.error(`Invalid event data structure for event ${eventId}:`, eventData);
              return null;
            }
          } else {
            const errorData = await response.json();
            console.error(`Failed to fetch event ${eventId}:`, errorData);
            set({ error: errorData.message || `Failed to fetch event ${eventId}` });
            return null;
          }
        } catch (error) {
          console.error(`Error fetching event ${eventId}:`, error);
          set({ error: `Network error while fetching event ${eventId}` });
          return null;
        }
      },

      fetchMultipleEvents: async (eventIds: string[], token: string): Promise<Record<string, Event>> => {
        set({ isLoading: true, error: null });
        
        const currentEvents = get().events;
        const eventsToFetch = eventIds.filter(id => !currentEvents[id]);
        
        if (eventsToFetch.length === 0) {
          set({ isLoading: false });
          return currentEvents;
        }

        try {
          const eventPromises = eventsToFetch.map(eventId => 
            get().fetchEvent(eventId, token)
          );
          
          const results = await Promise.allSettled(eventPromises);
          const newEvents: Record<string, Event> = { ...currentEvents };
          
          results.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value) {
              newEvents[eventsToFetch[index]] = result.value;
            }
          });

          set({ events: newEvents, isLoading: false });
          return newEvents;
        } catch (error) {
          console.error('Error fetching multiple events:', error);
          set({ 
            error: 'Failed to fetch event details',
            isLoading: false 
          });
          return currentEvents;
        }
      },

      setEvents: (events: Record<string, Event>) => {
        set({ events });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearEvents: () => {
        set({
          events: {},
          isLoading: false,
          error: null,
        });
        useEventStore.persist.clearStorage();
      },
    }),
    {
      name: 'event-store',
      partialize: (state) => ({
        events: state.events,
      }),
    }
  )
);

export const eventStoreActions = {
  clearEvents: () => useEventStore.getState().clearEvents(),
  setError: (error: string | null) => useEventStore.getState().setError(error),
  fetchEvent: (eventId: string, token: string) => 
    useEventStore.getState().fetchEvent(eventId, token),
  fetchMultipleEvents: (eventIds: string[], token: string) =>
    useEventStore.getState().fetchMultipleEvents(eventIds, token),
};