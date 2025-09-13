import { Mail, Phone, Calendar, Shield } from "lucide-react"
import { useAuth } from "../contexts/AuthContext";

export default function ProfileSettingsPage() {
  const { user } = useAuth();

  const formatDate = (date: Date | undefined) => {
    if (!date) return "Not available"
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  const getRoleBadgeColor = (role: string) => {
    return role === "organizer"
      ? "bg-purple-100 text-purple-800 border-purple-200"
      : "bg-blue-100 text-blue-800 border-blue-200"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Details Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12 text-center">
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">{user.name ? user.name : 'n/a'}</h2>
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(user.role ? user?.role as 'organizer' | 'attendee' : 'attendee' as 'organizer' | 'attendee')}`}
              >
                <Shield size={16} className="mr-2" />
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </div>
            </div>

            {/* Profile Information */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* User ID */}
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <Shield size={20} className="text-gray-600" /> 
                    </div>
                    <span className="font-medium">User ID</span>
                  </div>
                  <div className="ml-13 pl-3 border-l-2 border-gray-200">
                    <p className="text-gray-900 font-mono text-sm bg-gray-50 px-3 py-2 rounded-lg">{user.user_id.toString().slice(0, 4)}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <Mail size={20} className="text-blue-600" />
                    </div>
                    <span className="font-medium">Email Address</span>
                  </div>
                  <div className="ml-13 pl-3 border-l-2 border-blue-200">
                    <p className="text-gray-900 font-medium">{user.email}</p>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <Phone size={20} className="text-green-600" />
                    </div>
                    <span className="font-medium">Phone Number</span>
                  </div>
                  <div className="ml-13 pl-3 border-l-2 border-green-200">
                    <p className="text-gray-900 font-medium">{user.phone_number || "Not provided"}</p>
                  </div>
                </div>

                {/* Joined Date */}
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <Calendar size={20} className="text-purple-600" />
                    </div>
                    <span className="font-medium">Member Since</span>
                  </div>
                  <div className="ml-13 pl-3 border-l-2 border-purple-200">
                    <p className="text-gray-900 font-medium">{formatDate(user.joined_date)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
