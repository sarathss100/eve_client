import type React from "react"
import { useEffect, useState } from "react"
import { Plus, Edit, Trash2, Users, Calendar, BarChart3, Settings, MapPin, Mail, Phone, IndianRupeeIcon } from "lucide-react"
import type { Event } from "../types"
import { useAuthStore } from "../stores/authStore"
import { useEventStore } from "../stores/eventStore"
import { useTicketStore } from "../stores/ticketStore"
import { useUserStore } from "../stores/userStore"
import { EventFormModal } from "../components/modals/event-form-modal"
import { AttendeesModal } from "../components/modals/attendees-modal"
import { DeleteConfirmationModal } from "../components/modals/delete-confirmation-modal"

export const DashboardPage: React.FC = () => {
  const { user, token, updateUser } = useAuthStore()
  
  // Event store
  const { isLoading: eventsLoading, error: eventsError } = useEventStore()
  const { fetchMultipleEvents } = useEventStore()
  
  // Ticket store
  const { tickets, isLoading: ticketsLoading, error: ticketsError } = useTicketStore()
  const { fetchUserTicketsForOrganizer } = useTicketStore()
  
  // User store
  const { users, isLoading: usersLoading, error: usersError } = useUserStore()
  const { fetchAllUsers, updateUserRole } = useUserStore()

  const [activeTab, setActiveTab] = useState<"events" | "users">("events")
  const [events, setEvents] = useState<Event[]>([])
  const [showEventModal, setShowEventModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [showAttendeesModal, setShowAttendeesModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<{ id: string; title: string } | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [updatingUserRoles, setUpdatingUserRoles] = useState<Set<string>>(new Set())

  const loading = eventsLoading || ticketsLoading || usersLoading

  useEffect(() => {
    if (user?.role === "organizer") {
      // Fetch organizer events
      fetchOrganizerEvents()
      
      // Fetch all users
      fetchAllUsers(token || '')
      
      // Fetch user tickets (if needed for analytics)
      fetchUserTicketsForOrganizer(token || '')
    }
  }, [user, token])

  const fetchOrganizerEvents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/organizer/events`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })
      
      if (response.ok) {
        const data = await response.json()
        const organizerEvents = data.data.events
        setEvents(organizerEvents)

        const eventIds = organizerEvents.map((event: Event) => event.event_id)
        if (eventIds.length > 0) {
          fetchMultipleEvents(eventIds, token || '');
        }
      }
    } catch (error) {
      console.error("Error fetching organizer events:", error)
    }
  }

  const handleRoleChange = async (userId: string, newRole: "organizer" | "attendee") => {
    setUpdatingUserRoles(prev => new Set(prev).add(userId))
    
    try {
      // Update the role in the backend through the store
      await updateUserRole(userId, newRole, token || '')
      
      if (userId === user?.user_id && user) {
        // Create updated user object maintaining all existing properties
        const updatedUser = {
          ...user,
          role: newRole
        }
        updateUser(updatedUser)
      }
      
      // Refresh users list to get the latest data
      await fetchAllUsers(token || '')
      
    } catch (error) {
      console.error("Error updating user role:", error)
      // You might want to show a toast notification here
    } finally {
      // Remove user from updating set
      setUpdatingUserRoles(prev => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    }
  }

  const handleEventSubmit = async (eventData: Partial<Event>) => {
    try {
      const url = editingEvent 
        ? `${import.meta.env.VITE_API_URL}/api/v1/organizer/event`
        : `${import.meta.env.VITE_API_URL}/api/v1/organizer/event`
      
      const method = editingEvent ? "PATCH" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(eventData),
      })

      if (response.ok) {
        await fetchOrganizerEvents()
        setShowEventModal(false)
        setEditingEvent(null)
      }
    } catch (error) {
      console.error("Error saving event:", error)
    }
  }

  const handleDeleteEvent = async () => {
    if (!deletingEvent) return

    setIsDeleting(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/organizer/event/${deletingEvent.event_id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })

      if (response.ok) {
        await fetchOrganizerEvents()
        setShowDeleteModal(false)
        setDeletingEvent(null)
      }
    } catch (error) {
      console.error("Error deleting event:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const totalEvents = events.length
  const totalTicketsSold = tickets.filter(ticket => ticket.ticket_status === 'confirmed').length
  const totalRevenue = tickets
    .filter(ticket => ticket.ticket_status === 'confirmed')
    .reduce((sum, ticket) => {
      return sum + (Number(ticket?.amount) || 0)
    }, 0)

  const errors = [eventsError, ticketsError, usersError].filter(Boolean)

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    )
  }

  if (user.role !== "organizer") {
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
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {errors.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-medium mb-2">Error Loading Data</h3>
            <ul className="text-red-700 text-sm space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Organizer Dashboard</h1>
              <p className="mt-2 text-gray-600">Manage your events and view analytics</p>
            </div>
            <div className="flex items-center space-x-4">
              {activeTab === "events" && (
                <button
                  onClick={() => {
                    setEditingEvent(null)
                    setShowEventModal(true)
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Plus size={20} />
                  <span>Create Event</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("events")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "events"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>Events ({totalEvents})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "users"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Users size={16} />
                  <span>Users ({users.length})</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Events Tab Content */}
        {activeTab === "events" && (
          <div>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Events</p>
                    <p className="text-2xl font-bold text-gray-900">{totalEvents}</p>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tickets Sold</p>
                    <p className="text-2xl font-bold text-gray-900">{totalTicketsSold}</p>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Events List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Your Events</h2>
              </div>

              {events.length === 0 ? (
                <div className="text-center py-12">
                  <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
                  <p className="text-gray-600 mb-6">Get started by creating your first event</p>
                  <button
                    onClick={() => {
                      setEditingEvent(null)
                      setShowEventModal(true)
                    }}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Plus size={16} />
                    <span>Create Event</span>
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {events.map((event) => {
                    // Get event-specific tickets
                    const eventTickets = tickets.filter(ticket => ticket.event_id === event.event_id)
                    const confirmedTickets = eventTickets.filter(ticket => ticket.ticket_status === 'confirmed')
                    const eventRevenue = confirmedTickets.reduce((sum) => sum + event.price, 0)
                    
                    return (
                      <div key={event.event_id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{event.title}</h3>
                                <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <button
                                  onClick={() => {
                                    setSelectedEvent({ id: event.event_id, title: event.title })
                                    setShowAttendeesModal(true)
                                  }}
                                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View Attendees"
                                >
                                  <Users size={18} />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingEvent(event)
                                    setShowEventModal(true)
                                  }}
                                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit Event"
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  onClick={() => {
                                    setDeletingEvent(event)
                                    setShowDeleteModal(true)
                                  }}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Event"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center text-gray-600">
                                <Calendar className="w-4 h-4 mr-2" />
                                {formatDate(event.date)}
                              </div>
                              <div className="flex items-center text-gray-600">
                                <MapPin className="w-4 h-4 mr-2" />
                                {event.location}
                              </div>
                              <div className="flex items-center text-gray-600">
                                <Users className="w-4 h-4 mr-2" />
                                {confirmedTickets.length}/{event.total_tickets}
                              </div>
                              <div className="flex items-center text-gray-600">
                                <IndianRupeeIcon className="w-4 h-4 mr-2" />
                                {event.price} (₹{eventRevenue} earned)
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-4">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-600">Registration Progress</span>
                                <span className="text-sm font-medium text-gray-900">
                                  {Math.round((confirmedTickets.length / event.total_tickets) * 100)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${Math.min((confirmedTickets.length / event.total_tickets) * 100, 100)}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Users Tab Content */}
        {activeTab === "users" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
            </div>

            {users.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600">Users will appear here as they register</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tickets
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
                    {users.map((userItem) => {
                      const userTickets = tickets.filter(ticket => ticket.user_id === userItem.user_id)
                      const confirmedUserTickets = userTickets.filter(ticket => ticket.ticket_status === 'confirmed')
                      const isUpdating = updatingUserRoles.has(userItem.user_id)
                      
                      return (
                        <tr key={userItem.user_id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-4">
                                {userItem.name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div className="text-sm font-medium text-gray-900">{userItem.name || 'Unknown User'}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <div className="flex items-center text-sm text-gray-900">
                                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                {userItem.email || 'No email'}
                              </div>
                              {userItem.phone_number && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                  {userItem.phone_number}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                userItem.role === "organizer"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {userItem.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {confirmedUserTickets.length} confirmed
                              {userTickets.length > confirmedUserTickets.length && (
                                <span className="text-gray-500">
                                  , {userTickets.length - confirmedUserTickets.length} pending
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                              {formatDate(userItem.joined_date)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <select
                                value={userItem.role}
                                onChange={(e) => handleRoleChange(userItem.user_id, e.target.value as "organizer" | "attendee")}
                                disabled={isUpdating}
                                className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <option value="attendee">Attendee</option>
                                <option value="organizer">Organizer</option>
                              </select>
                              {isUpdating && (
                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Event Form Modal */}
      {showEventModal && (
        <EventFormModal
          isOpen={showEventModal}
          onClose={() => {
            setShowEventModal(false)
            setEditingEvent(null)
          }}
          onSubmit={handleEventSubmit}
          event={editingEvent}
        />
      )}

      {/* Attendees Modal */}
      {showAttendeesModal && selectedEvent && (
        <AttendeesModal
          isOpen={showAttendeesModal}
          onClose={() => {
            setShowAttendeesModal(false)
            setSelectedEvent(null)
          }}
          eventId={selectedEvent.id}
          eventTitle={selectedEvent.title}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingEvent && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setDeletingEvent(null)
          }}
          onConfirm={handleDeleteEvent}
          title="Delete Event"
          message={`Are you sure you want to delete "${deletingEvent.title}"? This action cannot be undone and will remove all associated tickets and data.`}
          isLoading={isDeleting}
          confirmText="Delete Event"
          confirmButtonClass="bg-red-600 hover:bg-red-700 focus:ring-red-500"
        />
      )}

      {/* Floating Action Button for Mobile */}
      {activeTab === "events" && (
        <div className="fixed bottom-6 right-6 md:hidden">
          <button
            onClick={() => {
              setEditingEvent(null)
              setShowEventModal(true)
            }}
            className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
          >
            <Plus size={24} />
          </button>
        </div>
      )}
    </div>
  )
}