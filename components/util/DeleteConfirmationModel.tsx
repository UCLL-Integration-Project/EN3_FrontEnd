"use client";

type DeleteConfirmationModalProps = {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function DeleteConfirmationModal({
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/40 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] animate-in fade-in">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl animate-sheet-in">
        <h3 className="text-[16px] font-bold text-ink-900">{title}</h3>
        <p className="mt-2 text-[14px] text-ink-600">{message}</p>

        <div className="mt-4 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl bg-ink-50 py-2.5 text-[13px] font-medium text-ink-700 transition-colors hover:bg-ink-100"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-600 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-red-700"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
