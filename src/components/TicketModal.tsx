import React from 'react';
import { X, Calendar, MapPin, Clock, Ticket, User, CreditCard } from 'lucide-react';
import { Event, Ticket as TicketType } from '../types';

interface TicketModalProps {
  ticket: TicketType;
  event: Event;
  onClose: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({ ticket, event, onClose }) => {
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

  const formatBookingDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked':
        return 'bg-green-100 text-green-800';
      case 'used':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="relative inline-block w-full max-w-2xl px-6 pt-5 pb-6 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-xl shadow-2xl sm:my-8 sm:align-middle">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Event Ticket</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X size={20} />
            </button>
          </div>

          {/* Ticket Card */}
          <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl p-6 text-white mb-6 shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-2xl font-bold mb-1">{event.title}</h4>
                <p className="text-blue-100 opacity-90">Event Ticket</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)} text-gray-800`}>
                {ticket.status.toUpperCase()}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center space-x-2">
                <Calendar size={16} />
                <span className="text-sm">{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock size={16} />
                <span className="text-sm">{formatTime(event.date)}</span>
              </div>
              <div className="flex items-center space-x-2 md:col-span-2">
                <MapPin size={16} />
                <span className="text-sm">{event.location}</span>
              </div>
            </div>

            {/* Ticket ID */}
            <div className="border-t border-white border-opacity-20 pt-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Ticket size={16} />
                  <span className="text-sm font-medium">Ticket ID:</span>
                </div>
                <span className="font-mono text-sm bg-white bg-opacity-20 px-3 py-1 rounded">
                  {ticket.ticket_id || ticket._id}
                </span>
              </div>
            </div>
          </div>

          {/* Ticket Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Booking Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <User size={18} />
                <span>Booking Information</span>
              </h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium capitalize">{ticket.ticket_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Booked On:</span>
                  <span className="font-medium">{formatBookingDate(ticket.booking_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                    {ticket.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <CreditCard size={18} />
                <span>Payment Information</span>
              </h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-bold text-green-600">${ticket.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className="font-medium text-green-600">Completed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h6 className="font-semibold text-yellow-800 mb-2">Important Notice</h6>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Please arrive at the venue 30 minutes before the event starts</li>
              <li>• Bring a valid ID that matches your ticket information</li>
              <li>• This ticket is non-transferable and non-refundable</li>
              <li>• Take a screenshot or print this ticket for entry</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => window.print()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Print Ticket
            </button>
            <button
              onClick={() => {
                // In a real app, this would generate and download a PDF
                alert('PDF download feature would be implemented here');
              }}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};