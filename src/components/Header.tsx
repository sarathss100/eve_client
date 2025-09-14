import type React from "react"
import { useState, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { User, LogOut, Settings, Ticket, Menu, X } from "lucide-react"
import { useAuthStore } from "../stores/authStore"

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsDropdownOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false)
    }, 300) 
  }

  const handleLogout = async () => {
    await logout()
    setIsDropdownOpen(false)
    navigate("/")
  }

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-xl border-b border-gray-100/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 text-white px-4 py-2.5 rounded-xl font-bold text-xl shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 ring-2 ring-blue-100">
              Eve
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-all duration-300 p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg ring-2 ring-white group-hover:ring-blue-100 transition-all duration-300">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-gray-900 block">{user?.name}</span>
                    <span className="text-xs text-blue-600 font-medium capitalize">{user?.role}</span>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div
                    className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100/50 py-3 z-50 animate-in slide-in-from-top-2 duration-200"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="px-5 py-3 border-b border-gray-100/70">
                      <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                      <div className="inline-flex items-center px-2 py-1 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-xs font-semibold mt-2 capitalize">
                        {user?.role}
                      </div>
                    </div>

                    <div className="py-2">
                      <Link
                        to="/tickets"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center space-x-3 px-5 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 transition-all duration-200 group"
                      >
                        <Ticket size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                        <span className="font-medium">My Tickets</span>
                      </Link>

                      {user?.role === "organizer" && (
                        <Link
                          to="/dashboard"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center space-x-3 px-5 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 transition-all duration-200 group"
                        >
                          <Settings size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                          <span className="font-medium">Dashboard</span>
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center space-x-3 px-5 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 transition-all duration-200 group"
                      >
                        <User size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                        <span className="font-medium">Profile Settings</span>
                      </Link>

                      <div className="border-t border-gray-100/70 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 w-full px-5 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 group"
                        >
                          <LogOut size={18} className="text-red-400 group-hover:text-red-600 transition-colors" />
                          <span className="font-medium">Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-5">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-semibold px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 text-white px-6 py-2.5 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105 ring-2 ring-blue-100"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 transition-all duration-300"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-5 border-t border-gray-100/70 animate-in slide-in-from-top-2 duration-200">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-3 py-4 border-b border-gray-100/70 mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <div className="inline-flex items-center px-2 py-1 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-xs font-semibold mt-1 capitalize">
                        {user?.role}
                      </div>
                    </div>
                  </div>
                </div>

                <Link
                  to="/tickets"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 rounded-xl transition-all duration-200 group"
                >
                  <Ticket size={20} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <span className="font-medium">My Tickets</span>
                </Link>

                {user?.role === "organizer" && (
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 rounded-xl transition-all duration-200 group"
                  >
                    <Settings size={20} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                )}

                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 rounded-xl transition-all duration-200 group"
                >
                  <User size={20} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <span className="font-medium">Profile Settings</span>
                </Link>

                <div className="border-t border-gray-100/70 mt-3 pt-3">
                  <button
                    onClick={async () => {
                      await logout()
                      setIsMobileMenuOpen(false)
                      navigate("/")
                    }}
                    className="flex items-center space-x-3 w-full px-3 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all duration-200 group"
                  >
                    <LogOut size={20} className="text-red-400 group-hover:text-red-600 transition-colors" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl transition-all duration-300 font-semibold"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold text-center shadow-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/5"
          onClick={() => {
            setIsMobileMenuOpen(false)
          }}
        />
      )}
    </header>
  )
}