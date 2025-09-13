import React, { useEffect, useState } from 'react';
import { Ticket, Calendar, MapPin, Clock, Download, Eye } from 'lucide-react';
import { Ticket as TicketType, Event } from '../types';
import { useAuthStore } from '../stores/authStore';
import { TicketModal } from '../components/TicketModal';

export const TicketsPage: React.FC = () => {
  const { token } = useAuthStore();
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [events, setEvents] = useState<{ [key: string]: Event }>({});
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);

  useEffect(() => {
    fetchUserTickets();
  }, []);

  const fetchUserTickets = async () => {
    try {
      const response = await fetch('/api/tickets/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const ticketsData = await response.json();
        setTickets(ticketsData);

        // Fetch event details for each ticket
        const eventIds = [...new Set(ticketsData.map((ticket: TicketType) => ticket.event_id))];
        const eventsMap: { [key: string]: Event } = {};

        for (const eventId of eventIds) {
          const eventResponse = await fetch(`/api/events/${eventId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: 'include',
          });
          
          if (eventResponse.ok) {
            const eventData = await eventResponse.json();
            eventsMap[event_id] = eventData;
          }
        }

        setEvents(eventsMap);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'used':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isEventPast = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Ticket size={24} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
          </div>
          <p className="text-gray-600">View and manage all your event tickets</p>
        </div>

        {/* Tickets List */}
        {tickets.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="flex items-center justify-center w-24 h-24 bg-gray-100 text-gray-400 rounded-full mx-auto mb-6">
              <Ticket size={48} />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Tickets Found</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              You haven't booked any tickets yet. Start exploring amazing events and book your first ticket!
            </p>
            <a
              href="/"
              className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              Discover Events
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {tickets.map((ticket) => {
              const event = events[ticket.event_id];
              if (!event) return null;

              return (
                <div
                  key={ticket._id}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      {/* Event Info */}
                      <div className="flex-1 mb-4 lg:mb-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{event.title}</h3>
                            <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(ticket.status)}`}>
                              {ticket.status.toUpperCase()}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">${ticket.price}</p>
                            <p className="text-xs text-gray-500">Ticket Price</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Calendar size={16} />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock size={16} />
                            <span>{formatTime(event.date)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin size={16} />
                            <span>{event.location}</span>
                          </div>
                        </div>

                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-center text-sm">
                            <div>
                              <span className="text-gray-600">Ticket ID: </span>
                              <span className="font-mono font-medium">{ticket.ticket_id || ticket._id}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Type: </span>
                              <span className="font-medium capitalize">{ticket.ticket_type}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 lg:ml-6">
                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                        >
                          <Eye size={16} />
                          <span>View Ticket</span>
                        </button>
                        <button
                          onClick={() => {
                            // In a real app, this would generate and download a PDF
                            alert('PDF download feature would be implemented here');
                          }}
                          className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                        >
                          <Download size={16} />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>

                    {/* Warning for past events */}
                    {isEventPast(event.date) && ticket.status === 'booked' && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>Notice:</strong> This event has already passed.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Ticket Modal */}
        {selectedTicket && (
          <TicketModal
            ticket={selectedTicket}
            event={events[selectedTicket.event_id]}
            onClose={() => setSelectedTicket(null)}
          />
        )}
      </div>
    </div>
  );
};