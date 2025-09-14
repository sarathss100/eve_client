import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Users, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Event, Ticket } from '../types';
import { EventCard } from '../components/EventCard';
import { useAuthStore } from '../stores/authStore';

export const HomePage: React.FC = () => {
  const { isAuthenticated, token, user } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [userTickets, setUserTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false); 
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 6;

  useEffect(() => {
    fetchEvents();
    if (isAuthenticated) {
      fetchUserTickets();
    }
    
    // Check for Stripe return on component mount
    handleStripeReturn();
  }, [isAuthenticated]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterLocation]);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/events`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data.data.events);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTickets = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tickets`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUserTickets(data.data.ticketDetails);
      }
    } catch (error) {
      console.error('Error fetching user tickets:', error);
    }
  };

  const handleBookEvent = async (eventId: string, price: number) => {
    if (!isAuthenticated) {
      window.location.href = `/login?redirect=/`;
      return;
    }

    const existingSessionUrl = typeof window !== 'undefined' 
      ? localStorage.getItem(`activeStripeSession_${eventId}`) 
      : null;

    if (existingSessionUrl) {
      alert("You already have an active payment session for this event.");
      window.location.href = existingSessionUrl;
      return;
    }

    setIsProcessing(true);

    try {
      const paymentResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/payments/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          user_id: user?.user_id,
          event_id: eventId,
          amount: price,
          currency: 'inr',
          type: 'ticket_booking',
        }),
      });

      if (!paymentResponse.ok) {
        throw new Error('Failed to initiate payment session');
      }

      const paymentData = await paymentResponse.json();
      const checkoutUrl = paymentData.data.checkOutUrl;

      if (checkoutUrl) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`activeStripeSession_${eventId}`, checkoutUrl);
          localStorage.setItem(`paymentSessionId_${eventId}`, paymentData.data.session_id);
        }

        alert('Redirecting to payment gateway...');
        window.location.href = checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }

    } catch (error) {
      console.error('Error initiating payment:', error);
      alert('Error initiating payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handlePaymentSuccess = async (eventId: string, sessionId: string) => {
    setIsProcessing(true);
    
    try {
      const maxAttempts = 30;
      let attempts = 0;

      while (attempts < maxAttempts) {
        try {
          const ticketResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/api/v1/tickets/by-session/${sessionId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              credentials: 'include',
            }
          );

          if (ticketResponse.ok) {
            const ticketData = await ticketResponse.json();

            if (ticketData.success && ticketData.data) {
              if (typeof window !== 'undefined') {
                localStorage.removeItem(`activeStripeSession_${eventId}`);
                localStorage.removeItem(`paymentSessionId_${eventId}`);
              }

              await fetchUserTickets();
              alert('Ticket booked successfully!');
              return;
            }
          }
        } catch (error) {
          console.error('Error checking ticket:', error);
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      alert('Payment successful but processing is taking longer than expected. Please check your tickets page.');

    } catch (error) {
      console.error('Error processing payment success:', error);
      alert('Payment successful but verification failed. Please check your tickets page or contact support.');
    } finally {
      localStorage.removeItem(`activeStripeSession_${eventId}`);
      localStorage.removeItem(`paymentSessionId_${eventId}`);
      setIsProcessing(false);
    }
  };

  const handlePaymentFailure = async (eventId: string, sessionId?: string) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`activeStripeSession_${eventId}`);
        localStorage.removeItem(`paymentSessionId_${eventId}`);
      }

      if (sessionId) {
        await fetch(`${import.meta.env.VITE_API_URL}/api/v1/payments/failed`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
          body: JSON.stringify({
            eventId,
            sessionId,
            reason: 'payment_cancelled_or_failed',
          }),
        });
      }

      alert('Payment was cancelled or failed. Please try again.');
      
    } catch (error) {
      console.error('Error handling payment failure:', error);
    }
  };

  const handleStripeReturn = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const eventId = urlParams.get('event_id');
    
    if (sessionId && eventId) {
      const success = urlParams.get('success');
      
      if (success === 'true') {
        await handlePaymentSuccess(eventId, sessionId);
      } else {
        await handlePaymentFailure(eventId, sessionId);
      }
      
      // Clean up URL parameters after processing
      const url = new URL(window.location.href);
      url.searchParams.delete('session_id');
      url.searchParams.delete('event_id');
      url.searchParams.delete('success');
      window.history.replaceState({}, document.title, url.toString());
    }
  };

  const getUserTicketForEvent = (eventId: string) => {
    return userTickets.find(ticket => ticket.event_id === eventId);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = filterLocation === '' || event.location.toLowerCase().includes(filterLocation.toLowerCase());
    const isFutureEvent = new Date(event.date) >= new Date();
    
    return matchesSearch && matchesLocation && isFutureEvent;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const startIndex = (currentPage - 1) * eventsPerPage;
  const endIndex = startIndex + eventsPerPage;
  const currentEvents = filteredEvents.slice(startIndex, endIndex);

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(page);
    // Scroll to events section
    const eventsSection = document.getElementById('events-section');
    if (eventsSection) {
      eventsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than or equal to maxVisiblePages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);
      
      // Adjust if we're at the beginning or end
      if (currentPage <= 3) {
        endPage = Math.min(totalPages, 5);
      }
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(1, totalPages - 4);
      }
      
      // Add first page and ellipsis if needed
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('...');
        }
      }
      
      // Add visible pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis and last page if needed
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const uniqueLocations = Array.from(new Set(events.map(event => event.location)));

  if (loading || isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loading ? 'Loading events...' : 'Processing payment...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Amazing Events
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Find, book, and attend incredible events in your area. Create memories that last a lifetime.
          </p>
          
          {!isAuthenticated && (
            <div className="space-x-4">
              <a
                href="/register"
                className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 transform hover:scale-105"
              >
                Get Started
              </a>
              <a
                href="/login"
                className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200"
              >
                Login
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mx-auto mb-4">
                <Calendar size={32} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{events.length}+</h3>
              <p className="text-gray-600">Active Events</p>
            </div>
            <div>
              <div className="flex items-center justify-center w-16 h-16 bg-purple-100 text-purple-600 rounded-full mx-auto mb-4">
                <Users size={32} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">10K+</h3>
              <p className="text-gray-600">Happy Attendees</p>
            </div>
            <div>
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mx-auto mb-4">
                <MapPin size={32} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{uniqueLocations.length}+</h3>
              <p className="text-gray-600">Cities Covered</p>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events-section" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Upcoming Events
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Browse and book tickets for the most exciting events happening near you.
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-8 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isProcessing}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-3 text-gray-400" size={20} />
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="w-full md:w-48 pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                disabled={isProcessing}
              >
                <option value="">All Locations</option>
                {uniqueLocations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results summary */}
          {filteredEvents.length > 0 && (
            <div className="mb-6 text-gray-600">
              <p>
                Showing {startIndex + 1}-{Math.min(endIndex, filteredEvents.length)} of {filteredEvents.length} events
                {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
              </p>
            </div>
          )}

          {/* Events Grid */}
          {filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <div className="flex items-center justify-center w-24 h-24 bg-gray-100 text-gray-400 rounded-full mx-auto mb-4">
                <Calendar size={48} />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Events Found</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {events.length === 0 
                  ? "There are no events available at the moment. Check back soon!"
                  : "No events match your search criteria. Try adjusting your filters."
                }
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentEvents.map((event) => (
                  <EventCard
                    key={event.event_id}
                    event={event}
                    userTicket={getUserTicketForEvent(event.event_id)}
                    onBookEvent={handleBookEvent}
                    isProcessing={isProcessing}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex flex-col items-center space-y-4">
                  {/* Pagination Info */}
                  <div className="text-sm text-gray-700">
                    <p>
                      Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(endIndex, filteredEvents.length)}</span> of{' '}
                      <span className="font-medium">{filteredEvents.length}</span> results
                    </p>
                  </div>

                  {/* Pagination Controls */}
                  <nav className="flex items-center justify-center space-x-2">
                    {/* Previous Button */}
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900'
                      } transition-colors duration-200`}
                    >
                      <ChevronLeft size={16} className="mr-1" />
                      Previous
                    </button>

                    {/* Page Numbers */}
                    <div className="flex space-x-1">
                      {getPageNumbers().map((page, index) => (
                        <React.Fragment key={index}>
                          {page === '...' ? (
                            <span className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-500">
                              ...
                            </span>
                          ) : (
                            <button
                              onClick={() => goToPage(page as number)}
                              className={`flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                                currentPage === page
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900'
                              }`}
                            >
                              {page}
                            </button>
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === totalPages
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900'
                      } transition-colors duration-200`}
                    >
                      Next
                      <ChevronRight size={16} className="ml-1" />
                    </button>
                  </nav>

                  {/* Quick Page Jump (for mobile) */}
                  {totalPages > 5 && (
                    <div className="flex items-center space-x-2 md:hidden">
                      <label htmlFor="page-select" className="text-sm text-gray-700">
                        Go to page:
                      </label>
                      <select
                        id="page-select"
                        value={currentPage}
                        onChange={(e) => goToPage(Number(e.target.value))}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <option key={page} value={page}>
                            {page}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Your Event Journey?
            </h2>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              Join thousands of event organizers and attendees who trust Eve for their event management needs.
            </p>
            <div className="space-x-4">
              <a
                href="/register"
                className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 transform hover:scale-105"
              >
                Sign Up Free
              </a>
              <a
                href="/login"
                className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200"
              >
                Login
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};