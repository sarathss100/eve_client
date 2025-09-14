import React, { useEffect, useState } from 'react';
import { Ticket, Calendar, MapPin, Clock, Eye, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Ticket as TicketType } from '../types';
import { useAuthStore } from '../stores/authStore';
import { useTicketStore } from '../stores/ticketStore';
import { useEventStore } from '../stores/eventStore'; 
import { TicketModal } from '../components/TicketModal';

export const TicketsPage: React.FC = () => {
  const { token } = useAuthStore();
  const { 
    tickets, 
    isLoading: ticketsLoading, 
    error: ticketsError, 
    fetchUserTickets, 
    setError: setTicketsError 
  } = useTicketStore();
  
  const { 
    events, 
    isLoading: eventsLoading,
    error: eventsError 
  } = useEventStore();
  
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 5;

  const isLoading = ticketsLoading || eventsLoading;
  const error = ticketsError || eventsError;

  // Pagination calculations
  const totalPages = Math.ceil(tickets.length / ticketsPerPage);
  const startIndex = (currentPage - 1) * ticketsPerPage;
  const endIndex = startIndex + ticketsPerPage;
  const currentTickets = tickets.slice(startIndex, endIndex);

  useEffect(() => {
    fetchUserTickets(token || '');
  }, [token, fetchUserTickets]);

  // Reset to first page when tickets change
  useEffect(() => {
    setCurrentPage(1);
  }, [tickets.length]);

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
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isEventPast = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const handleRetry = () => {
    if (token) {
      setTicketsError(null);
      fetchUserTickets(token);
    }
  };

  const handleViewTicket = (ticket: TicketType) => {
    const event = events[ticket.event_id];
    if (event) {
      setSelectedTicket(ticket);
    } else {
      alert('Event details are not available. Please try refreshing the page.');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 text-red-600 rounded-full mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Tickets</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 mx-auto"
          >
            <RefreshCw size={16} />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <Ticket size={24} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
              </div>
              <p className="text-gray-600">
                View and manage all your event tickets
                {tickets.length > 0 && (
                  <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {tickets.length} total tickets
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={handleRetry}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>
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
          <>
            <div className="space-y-6">
              {currentTickets.map((ticket) => {
                const event = events[ticket.event_id];
                
                return (
                  <div
                    key={ticket.ticket_id}
                    className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        {/* Event Info */}
                        <div className="flex-1 mb-4 lg:mb-0">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-1">
                                {event ? event.title : 'Loading event details...'}
                              </h3>
                              <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(ticket.ticket_status)}`}>
                                {ticket.ticket_status.toUpperCase()}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-green-600">₹ {ticket.amount}</p>
                              <p className="text-xs text-gray-500">Ticket Price</p>
                            </div>
                          </div>

                          {event ? (
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
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
                              <div className="flex items-center space-x-2">
                                <Calendar size={16} />
                                <span>Loading date...</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock size={16} />
                                <span>Loading time...</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MapPin size={16} />
                                <span>Loading location...</span>
                              </div>
                            </div>
                          )}

                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-center text-sm">
                              <div>
                                <span className="text-gray-600">Ticket ID: </span>
                                <span className="font-mono font-medium">{ticket.ticket_id}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Transaction ID: </span>
                                <span className="font-mono font-medium text-xs">
                                  {ticket.session_id.length > 20 ? 
                                    `${ticket.session_id.slice(0, 20)}...` : 
                                    ticket.session_id
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 lg:ml-6">
                          <button
                            onClick={() => handleViewTicket(ticket)}
                            disabled={!event}
                            className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                              event 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            <Eye size={16} />
                            <span>{event ? 'View Ticket' : 'Loading...'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Warning for past events */}
                      {event && isEventPast(event.date) && ticket.ticket_status === 'confirmed' && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <strong>Notice:</strong> This event has already passed.
                          </p>
                        </div>
                      )}

                      {/* Warning for missing event data */}
                      {!event && (
                        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <p className="text-sm text-orange-800">
                            <strong>Notice:</strong> Event details are being loaded. Please refresh if this persists.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between bg-white rounded-lg border border-gray-200 px-6 py-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span>
                    Showing {startIndex + 1} to {Math.min(endIndex, tickets.length)} of {tickets.length} tickets
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <ChevronLeft size={16} />
                    <span>Previous</span>
                  </button>

                  <div className="flex space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded-lg font-medium transition-colors duration-200 ${
                          page === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Ticket Modal */}
        {selectedTicket && events[selectedTicket.event_id] && (
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