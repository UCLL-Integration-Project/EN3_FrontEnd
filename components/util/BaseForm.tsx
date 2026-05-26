import { ReactNode, FormEvent } from "react";
import { X } from "lucide-react";

type Props = {
  title: string;
  onSubmit: (e: FormEvent) => void;
  onCancel?: () => void;
  error?: string | null;
  submitting?: boolean;
  submitDisabled?: boolean;
  submitText: string;
  children: ReactNode;
};

export default function BaseForm({
  title,
  onSubmit,
  onCancel,
  error,
  submitting = false,
  submitDisabled = false,
  submitText,
  children,
}: Props) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl bg-white p-4 shadow-card ring-1 ring-ink-100"
    >
      {/* Form header */}
      <div className="mb-3 flex items-center justify-between">
        <h6 className="text-[13px] font-semibold text-ink-900">{title}</h6>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="tap flex h-7 w-7 items-center justify-center rounded-lg text-ink-400 transition-colors duration-100 active:bg-ink-50"
            aria-label="Close"
          >
            <X size={16} strokeWidth={2.5} aria-hidden />
          </button>
        )}
      </div>

      {/* Form fields */}
      {children}

      {/* Error message */}
      {error && (
        <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-700">
          {error}
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={submitting || submitDisabled}
        className="btn-primary w-full disabled:opacity-40"
      >
        {submitText}
      </button>
    </form>
  );
}
