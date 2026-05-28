"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { StatusTypeResponse } from "@types";
import BaseForm from "@components/util/BaseForm";
import statusTypeService from "@services/StatusTypeService";

type Props = {
  statusType?: StatusTypeResponse | null;
  onSubmit: (statusType: StatusTypeResponse) => void;
  onCancel: () => void;
};

export default function StatusTypeForm({
  statusType,
  onSubmit,
  onCancel,
}: Props) {
  const t = useTranslations("admin.statusTypes");

  const [type, setType] = useState(statusType?.statusType ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!statusType;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!type.trim()) {
      setError(t("form.typeError"));
      return;
    }

    setSubmitting(true);

    try {
      let result;
      if (isEditing && statusType) {
        result = await statusTypeService.updateStatusType(statusType.id, {
          statusType: type.trim(),
        });
      } else {
        result = await statusTypeService.createStatusType({
          statusType: type.trim(),
        });
      }

      setType("");
      onSubmit(result);
    } catch (err) {
      const code = err instanceof Error ? err.message : "UNKNOWN_ERROR";
      const knownCodes = [
        "USER_NOT_FOUND",
        "INVALID_STATUS_TYPE",
        "NETWORK_ERROR",
        "TYPE_TAKEN",
        "STATUS_TYPE_IN_USE",
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
      title={isEditing ? t("form.editTitle") : t("form.createTitle")}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      error={error}
      submitting={submitting}
      submitDisabled={!type.trim()}
      submitText={submitting ? t("form.saving") : t("form.save")}
    >
      <input
        type="text"
        value={type}
        onChange={(e) => setType(e.target.value)}
        placeholder={t("form.placeholder")}
        className="mb-3 w-full rounded-xl bg-ink-50 px-3 py-2.5 text-[13px] text-ink-900 outline-none ring-1 ring-ink-200 placeholder:text-ink-400 focus:ring-brand-400"
      />
    </BaseForm>
  );
}
