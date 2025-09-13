import React, { useState } from 'react';
import { Calendar, MapPin, Users, Clock, Ticket } from 'lucide-react';
import { Event } from '../types';
import { useAuthStore } from '../stores/authStore';
import { TicketModal } from './TicketModal';

interface EventCardProps {
  event: Event;
  userTicket?: any;
  onBookEvent: (eventId: string, price: number) => void;
  isProcessing?: boolean; 
}

export const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  userTicket, 
  onBookEvent, 
  isProcessing = false
}) => {
  const { isAuthenticated } = useAuthStore();
  const [showTicketModal, setShowTicketModal] = useState(false);

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

  const handleBookClick = () => {
    if (!isAuthenticated) {
      // Redirect to registration with return URL
      window.location.href = `/register?redirect=/events/${event.event_id}`;
      return;
    }
    onBookEvent(event.event_id, event.price);
  };

  const availableTickets = event.available_tickets ?? event.total_tickets;
  const isEventPast = new Date(event.date) < new Date();
  const isSoldOut = availableTickets <= 0;

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        {/* Event Image Placeholder */}
        <div className="h-48 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute top-4 left-4">
            <span className="bg-white bg-opacity-90 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">
              {event.total_tickets} Total Tickets
            </span>
          </div>
          {isSoldOut && (
            <div className="absolute top-4 right-4">
              <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Sold Out
              </span>
            </div>
          )}
        </div>

        <div className="p-6">
          {/* Event Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
          
          {/* Event Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

          {/* Event Details */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-2 text-gray-500">
              <Calendar size={16} />
              <span className="text-sm">{formatDate(event.date)}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-500">
              <Clock size={16} />
              <span className="text-sm">{formatTime(event.date)}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-500">
              <MapPin size={16} />
              <span className="text-sm">{event.location}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-500">
              <Users size={16} />
              <span className="text-sm">{availableTickets} tickets available</span>
            </div>
          </div>

          {/* Price */}
          <div className="mb-4">
            <span className="text-2xl font-bold text-green-600">
              ₹{event.price ?? 25}
            </span>
            <span className="text-gray-500 text-sm ml-2">per ticket</span>
          </div>

          {/* Action Button */}
          <div className="flex space-x-3">
            {userTicket ? (
              <button
                onClick={() => setShowTicketModal(true)}
                disabled={isProcessing}
                className={`flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 ${
                  isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Ticket size={18} />
                <span>View Ticket</span>
              </button>
            ) : (
              <button
                onClick={handleBookClick}
                disabled={isEventPast || isSoldOut || isProcessing}
                className={`flex-1 font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                  isEventPast || isSoldOut || isProcessing
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform hover:scale-105'
                }`}
              >
                <Ticket size={18} />
                <span>
                  {isProcessing 
                    ? 'Processing...' 
                    : isEventPast 
                    ? 'Event Ended' 
                    : isSoldOut 
                    ? 'Sold Out' 
                    : 'Book Now'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Ticket Modal */}
      {showTicketModal && userTicket && (
        <TicketModal
          ticket={userTicket}
          event={event}
          onClose={() => setShowTicketModal(false)}
        />
      )}
    </>
  );
};