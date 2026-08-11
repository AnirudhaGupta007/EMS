const ConfirmationDialog = ({ onConfirm, onCancel, isOpen, message }) => {
  if (!isOpen) return null; // if not open, render nothing

  return (
    <div
      onClick={onCancel}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8"
    >
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
        onClick={onCancel}
      >
        <div
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Are you sure?
            </h2>
            <p className="text-gray-500 text-[14px] font-semibold leading-relaxed">
              {message}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3.5 bg-gray-100 text-gray-900 rounded-full font-medium text-sm hover:bg-gray-200 transition-all duration-200"
            >
              No, Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-3.5 bg-black text-white rounded-full font-medium text-sm hover:bg-gray-800 transition-all duration-200 shadow-lg"
            >
              Yes, Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
