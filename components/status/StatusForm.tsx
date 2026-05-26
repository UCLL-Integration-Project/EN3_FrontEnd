"use client";

import { useState } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";

import statusService from "@services/StatusService";
import { StatusTypeResponse, StatusResponse } from "@types";
import BaseForm from "@components/util/BaseForm";

type Props = {
  status?: StatusResponse | null; // Pass existing status data for updates
  statusTypes: StatusTypeResponse[];
  onSubmit?: (status: StatusResponse) => void;
  onCancel?: () => void;
};

export default function StatusForm({
  status,
  statusTypes,
  onSubmit,
  onCancel,
}: Props) {
  const t = useTranslations("status");
  const isEditing = !!status;

  const [message, setMessage] = useState(status?.message ?? "");
  const [selectedType, setSelectedType] = useState<StatusTypeResponse | null>(
    status?.statusType ?? statusTypes[0] ?? null,
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!message.trim() || !selectedType) {
      setError(t("form.messageError"));
      return;
    }

    setSubmitting(true);

    try {
      let result: StatusResponse;
      
      // Fixed: Conditionally route requests based on state configuration
      if (isEditing && status) {
        result = await statusService.updateStatus(status.id, {
          message: message.trim(),
          statusType: selectedType,
        });
      } else {
        result = await statusService.createStatus({
          message: message.trim(),
          statusType: selectedType,
        });
      }

      setMessage("");
      onSubmit?.(result);
    } catch (err) {
      const code = err instanceof Error ? err.message : "UNKNOWN_ERROR";
      const knownCodes = [
        "USER_NOT_FOUND",
        "INVALID_STATUS_TYPE",
        "NETWORK_ERROR",
        "UNKNOWN_ERROR",
      ];
      const messageKey = knownCodes.includes(code) ? code : "UNKNOWN_ERROR";
      setError(t(`errors.${messageKey}`));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BaseForm
      title={isEditing ? t("form.editTitle") : t("create")}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      error={error}
      submitting={submitting}
      submitDisabled={!message.trim() || !selectedType}
      submitText={submitting ? t("form.creating") : t("post")}
    >
      {/* Status type selector */}
      <Listbox value={selectedType} onChange={setSelectedType}>
        <div className="relative mb-3">
          <ListboxButton className="flex w-full items-center justify-between gap-2 rounded-xl bg-ink-50 px-3 py-2.5 text-left text-[13px] text-ink-900 outline-none ring-1 ring-ink-200 transition-all duration-100 focus:ring-brand-400 active:scale-[0.99]">
            <span className="flex-1">
              {selectedType?.statusType ?? t("form.selectType")}
            </span>
            <ChevronDown
              size={14}
              className="shrink-0 text-ink-400"
              strokeWidth={2.5}
              aria-hidden
            />
          </ListboxButton>

          <ListboxOptions className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-xl bg-white shadow-lg ring-1 ring-ink-200 animate-sheet-in">
            {statusTypes.length === 0 ? (
              <div className="px-3 py-2 text-[12px] text-ink-400">
                {t("empty")}
              </div>
            ) : (
              statusTypes.map((statusType) => (
                <ListboxOption
                  key={statusType.id}
                  value={statusType}
                  className={({ active }) =>
                    `cursor-pointer select-none border-b border-ink-50 px-3 py-2.5 last:border-none ${
                      active ? "bg-brand-50" : ""
                    }`
                  }
                >
                  {({ selected }) => (
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[13px] ${
                          selected
                            ? "font-semibold text-brand-700"
                            : "text-ink-800"
                        }`}
                      >
                        {statusType.statusType}
                      </span>
                      {selected && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[9px] text-white">
                          ✓
                        </span>
                      )}
                    </div>
                  )}
                </ListboxOption>
              ))
            )}
          </ListboxOptions>
        </div>
      </Listbox>

      {/* Message input */}
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={t("placeholder.message")}
        rows={3}
        className="mb-3 w-full resize-none rounded-xl bg-ink-50 px-3 py-2.5 text-[13px] text-ink-900 outline-none ring-1 ring-ink-200 placeholder:text-ink-400 focus:ring-brand-400"
      />
    </BaseForm>
  );
}