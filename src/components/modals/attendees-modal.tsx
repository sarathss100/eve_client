import type React from "react"
import { useState, useEffect } from "react"
import { X, Users, Mail, Phone, Calendar, Search, Download } from "lucide-react"
import type { User } from "../../types"
import { useTicketStore } from "../../stores/ticketStore"
import { useUserStore } from "../../stores/userStore"

interface AttendeesModalProps {
  isOpen: boolean
  onClose: () => void
  eventId: string
  eventTitle: string
}

interface AttendeeWithTicket extends User {
  ticket_id: string
  ticket_status: "confirmed" | "cancelled"
  registration_date: string
  amount: number
}

export const AttendeesModal: React.FC<AttendeesModalProps> = ({ isOpen, onClose, eventId, eventTitle }) => {
  const [attendees, setAttendees] = useState<AttendeeWithTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredAttendees, setFilteredAttendees] = useState<AttendeeWithTicket[]>([])

  const { tickets } = useTicketStore()
  const { users } = useUserStore()

  useEffect(() => {
    if (isOpen && eventId) {
      setLoading(true)
      
      // Filter tickets for this specific event
      const eventTickets = tickets.filter(ticket => ticket.event_id === eventId)
      
      const eventAttendees = eventTickets
        .map(ticket => {
          // Find the user for this ticket
          const user = users.find(u => u.user_id === ticket.user_id)
          
          if (user) {
            return {
              ...user,
              ticket_id: ticket.ticket_id,
              ticket_status: ticket.ticket_status,
              registration_date: ticket.purchased_at,
              amount: Number(ticket.amount || 0)
            }
          }
          return null
        })
      
      setAttendees(eventAttendees.filter((a): a is AttendeeWithTicket => a !== null));
      setFilteredAttendees(eventAttendees.filter((a): a is AttendeeWithTicket => a !== null))
      setLoading(false)
    }
  }, [isOpen, eventId, tickets, users])

  useEffect(() => {
    const filtered = attendees.filter(
      (attendee) =>
        attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendee.ticket_status.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredAttendees(filtered)
  }, [searchTerm, attendees])

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTicketStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleExportAttendees = () => {
    const csvContent = [
      ["Name", "Email", "Phone", "Registration Date", "Ticket Status", "Amount Paid"],
      ...filteredAttendees.map((attendee) => [
        attendee.name,
        attendee.email,
        attendee.phone_number || "N/A",
        formatDate(attendee.registration_date),
        attendee.ticket_status,
        attendee.amount ? `₹${attendee.amount}` : "N/A"
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${eventTitle.replace(/\s+/g, "_")}_attendees.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Get statistics
  const confirmedAttendees = filteredAttendees.filter(a => a.ticket_status === 'confirmed')
  const pendingAttendees = filteredAttendees.filter(a => a.ticket_status === 'cancelled')
  const totalRevenue = confirmedAttendees.reduce((sum, attendee) => sum + (Number(attendee.amount) || 0), 0)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-5xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Event Attendees</h3>
                <p className="text-gray-600">{eventTitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            >
              <X size={24} />
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{filteredAttendees.length}</div>
              <div className="text-sm text-blue-800">Total Registrations</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{confirmedAttendees.length}</div>
              <div className="text-sm text-green-800">Confirmed</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">{pendingAttendees.length}</div>
              <div className="text-sm text-yellow-800">Pending</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">₹{totalRevenue.toLocaleString()}</div>
              <div className="text-sm text-purple-800">Revenue</div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading attendees...</span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {filteredAttendees.length} of {attendees.length} attendees
                  </span>
                  <button
                    onClick={handleExportAttendees}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Download size={16} />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Attendee
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Registration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAttendees.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center">
                            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-gray-500 font-medium">
                              {searchTerm ? "No attendees match your search" : "No attendees registered yet"}
                            </p>
                            {!searchTerm && (
                              <p className="text-gray-400 text-sm mt-2">
                                Attendees will appear here once they purchase tickets
                              </p>
                            )}
                          </td>
                        </tr>
                      ) : (
                        filteredAttendees.map((attendee) => (
                          <tr key={`${attendee.user_id}-${attendee.ticket_id}`} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-4">
                                  {attendee.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{attendee.name}</div>
                                  <div className="text-xs text-gray-500">ID: {attendee.ticket_id.slice(-6)}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="space-y-1">
                                <div className="flex items-center text-sm text-gray-900">
                                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                  {attendee.email}
                                </div>
                                {attendee.phone_number && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                    {attendee.phone_number}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm text-gray-900">
                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                {formatDate(attendee.registration_date)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTicketStatusColor(attendee.ticket_status)}`}
                              >
                                {attendee.ticket_status.charAt(0).toUpperCase() + attendee.ticket_status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {attendee.amount ? `₹${attendee.amount}` : "N/A"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}