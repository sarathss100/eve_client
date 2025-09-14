import { Mail, Phone, Calendar, Shield, UserIcon } from "lucide-react"
import { useAuthStore } from "../stores/authStore"

export default function ProfileSettingsPage() {
  const { user } = useAuthStore()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return "Not available"

    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date)
    } catch (error) {
      return "Invalid date"
    }
  }

  const getRoleBadgeColor = (role: string) => {
    return role === "organizer"
      ? "bg-purple-100 text-purple-800 border-purple-200"
      : "bg-blue-100 text-blue-800 border-blue-200"
  }

  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Details Section */}
      <section className="py-20">
        <div className="px-6 sm:px-8 lg:px-12">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 px-12 py-16 text-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent"></div>
              <div className="relative z-10">
                <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border-2 border-white/40">
                  <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                    {getInitials(user.name)}
                  </div>
                </div>
                <h2
                  className="text-4xl font-bold text-white mb-4 tracking-tight"
                  style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
                >
                  {user.name || "Unknown User"}
                </h2>
                <div
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border backdrop-blur-sm ${getRoleBadgeColor(user.role || "attendee")}`}
                >
                  <Shield size={16} className="mr-2" />
                  {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Attendee"}
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">
                {/* User ID */}
                <div className="group hover:bg-gray-50 rounded-2xl p-6 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center text-gray-700 mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-gray-200 transition-colors duration-300">
                      <UserIcon size={22} className="text-gray-600" />
                    </div>
                    <span className="font-semibold text-lg">User ID</span>
                  </div>
                  <div className="ml-16">
                    <p className="text-gray-900 font-mono text-base bg-gray-100 px-4 py-3 rounded-xl border">
                      {user.user_id ? `...${user.user_id.slice(-8)}` : "N/A"}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="group hover:bg-blue-50 rounded-2xl p-6 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center text-gray-700 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors duration-300">
                      <Mail size={22} className="text-blue-600" />
                    </div>
                    <span className="font-semibold text-lg">Email Address</span>
                  </div>
                  <div className="ml-16">
                    <p className="text-gray-900 font-medium text-base">{user.email || "Not provided"}</p>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="group hover:bg-green-50 rounded-2xl p-6 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center text-gray-700 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-green-200 transition-colors duration-300">
                      <Phone size={22} className="text-green-600" />
                    </div>
                    <span className="font-semibold text-lg">Phone Number</span>
                  </div>
                  <div className="ml-16">
                    <p className="text-gray-900 font-medium text-base">{user.phone_number || "Not provided"}</p>
                  </div>
                </div>

                {/* Joined Date */}
                <div className="group hover:bg-purple-50 rounded-2xl p-6 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center text-gray-700 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-purple-200 transition-colors duration-300">
                      <Calendar size={22} className="text-purple-600" />
                    </div>
                    <span className="font-semibold text-lg">Member Since</span>
                  </div>
                  <div className="ml-16">
                    <p className="text-gray-900 font-medium text-base">{formatDate(user.joined_date)}</p>
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
