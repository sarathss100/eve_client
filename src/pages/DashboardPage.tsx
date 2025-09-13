import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Users, Calendar, BarChart3, Settings } from 'lucide-react';
import { Event, User } from '../types';
import { useAuthStore } from '../stores/authStore';

export const DashboardPage: React.FC = () => {
  const { user, token, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'events' | 'users'>('events');
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (user?.role === 'organizer') {
      fetchOrganizerEvents();
      fetchAllUsers();
    }
  }, [user]);

  const fetchOrganizerEvents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/organizer/events`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setEvents(data.data.events);
      }
    } catch (error) {
      console.error('Error fetching organizer events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/organizer/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'organizer' | 'attendee') => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/organizer/users/role/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ new_role: newRole }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map(user => user.user_id === userId ? updatedUser : user));
        
        if (userId === user?.user_id) {
          updateUser(updatedUser);
        }
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (user?.role !== 'organizer') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center w-24 h-24 bg-red-100 text-red-600 rounded-full mx-auto mb-4">
            <Settings size={48} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need organizer privileges to access this dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Organizer Dashboard</h1>
              <p className="text-gray-600">Manage your events and users</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="text-blue-600" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">Total Events</p>
                    <p className="text-2xl font-bold text-gray-900">{events.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('events')}
              className={`py-2 px-4 font-medium text-sm rounded-lg transition-colors duration-200 ${
                activeTab === 'events'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Event Management
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-4 font-medium text-sm rounded-lg transition-colors duration-200 ${
                activeTab === 'users'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              User Management
            </button>
          </nav>
        </div>

        {/* Event Management Tab */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            {/* Add Event Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Your Events</h2>
              <button
                onClick={() => setShowEventModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 transform hover:scale-105"
              >
                <Plus size={18} />
                <span>Add Event</span>
              </button>
            </div>

            {/* Events Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tickets
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {events.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <Calendar className="text-gray-400 mb-4" size={48} />
                            <p className="text-gray-500 font-medium">No events created yet</p>
                            <p className="text-gray-400 text-sm">Start by creating your first event</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      events.map((event) => (
                        <tr key={event.event_id} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{event.title}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{event.description}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(event.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {event.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{event.total_tickets} total</div>
                            <div className="text-sm text-green-600">{event.available_tickets || event.total_tickets} available</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => {
                                setEditingEvent(event);
                                setShowEventModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this event?')) {
                                  // Handle delete event
                                }
                              }}
                              className="text-red-600 hover:text-red-900 transition-colors duration-200"
                            >
                              <Trash2 size={16} />
                            </button>
                            <button
                              onClick={() => {
                                // Handle view attendees
                                alert('Attendee list feature would be implemented here');
                              }}
                              className="text-green-600 hover:text-green-900 transition-colors duration-200"
                            >
                              <Users size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">User Management</h2>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((userItem) => (
                      <tr key={userItem.user_id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                              {userItem.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-sm font-medium text-gray-900">{userItem.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {userItem.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            userItem.role === 'organizer' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {userItem.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(userItem.joined_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <select
                            value={userItem.role}
                            onChange={(e) => handleRoleChange(userItem.user_id, e.target.value as 'organizer' | 'attendee')}
                            className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="attendee">Attendee</option>
                            <option value="organizer">Organizer</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Event Modal would be implemented here */}
        {showEventModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => {
                setShowEventModal(false);
                setEditingEvent(null);
              }}></div>
              <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingEvent ? 'Edit Event' : 'Add New Event'}
                </h3>
                <p className="text-gray-600 mb-6">
                  Event creation/editing form would be implemented here with proper form handling, validation, and API integration.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setShowEventModal(false);
                      setEditingEvent(null);
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                    {editingEvent ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};