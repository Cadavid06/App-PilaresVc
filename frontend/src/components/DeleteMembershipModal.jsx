export default function ConfirmModal({ isOpen, onClose, onConfirm, message }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
      <div className="bg-zinc-800/90 backdrop-blur-xl border border-zinc-700/50 text-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Confirmar Acción</h2>
              <p className="text-red-400 text-sm">Esta acción no se puede deshacer</p>
            </div>
            <div className="bg-red-500/20 rounded-full p-2">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>

          <div className="bg-zinc-700/30 rounded-xl p-4 border border-zinc-600/30 mb-6">
            <p className="text-gray-300">{message}</p>
          </div>

          <div className="flex gap-3">
            <button
              className="flex-1 bg-zinc-600/50 hover:bg-zinc-600 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-200 border border-zinc-500/50"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-200 shadow-lg shadow-red-500/25"
              onClick={() => {
                onConfirm()
                onClose()
              }}
            >
              Sí, eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
