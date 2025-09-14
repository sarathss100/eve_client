import type React from "react"
import { AlertTriangle, X, Loader2 } from "lucide-react"

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText: string
  confirmButtonClass: string
  isLoading?: boolean
  isDeleting?: boolean
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isDeleting = false,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-all duration-300 ease-out"
          onClick={onClose}
        ></div>

        <div className="inline-block w-full max-w-md p-8 my-8 overflow-hidden text-left align-middle transition-all duration-300 ease-out transform bg-white shadow-2xl rounded-3xl border border-gray-100 animate-in fade-in-0 zoom-in-95">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-14 h-14 bg-red-50 rounded-2xl ring-8 ring-red-50/50">
                <AlertTriangle className="w-7 h-7 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 leading-tight">{title}</h3>
                <div className="w-12 h-1 bg-red-600 rounded-full mt-2"></div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 text-gray-400 hover:text-gray-600 transition-all duration-200 rounded-xl hover:bg-gray-50 hover:scale-105 active:scale-95"
            >
              <X size={22} />
            </button>
          </div>

          <div className="mb-8">
            <p className="text-gray-600 leading-relaxed text-base">{message}</p>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border border-gray-200 hover:border-gray-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-red-600/25 hover:shadow-xl hover:shadow-red-600/30 flex items-center justify-center space-x-2"
            >
              {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isDeleting ? "Deleting..." : "Delete"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}