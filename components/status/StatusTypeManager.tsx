"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Edit2, Trash2 } from "lucide-react";

import { StatusTypeResponse } from "@types";
import StatusTypeForm from "./StatusTypeForm";
import statusTypeService from "@services/StatusTypeService";
import SharedPanel from "@components/util/SharedPanel";
import PanelActionRow from "@components/util/PanelActionRow";
import DeleteConfirmationModal from "@components/util/DeleteConfirmationModel"; // Connected clean modal component

export default function StatusTypeManager() {
  const [statusTypes, setStatusTypes] = useState<StatusTypeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingType, setEditingType] = useState<StatusTypeResponse | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const t = useTranslations("admin.statusTypes");

  useEffect(() => {
    fetchStatusTypes();
  }, []);

  const fetchStatusTypes = async () => {
    try {
      setLoading(true);
      const data = await statusTypeService.getStatusTypes();
      setStatusTypes(data);
      setError(null);
    } catch (err) {
      const code = err instanceof Error ? err.message : "UNKNOWN_ERROR";
      setError(code);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = (created: StatusTypeResponse) => {
    setStatusTypes((prev) => [...prev, created]);
    setShowCreateForm(false);
  };

  const handleUpdate = (updated: StatusTypeResponse) => {
    setStatusTypes((prev) =>
      prev.map((type) => (type.id === updated.id ? updated : type)),
    );
    setEditingType(null);
  };

  const handleDelete = async (id: number) => {
    try {
      await statusTypeService.deleteStatusType(id);
      setStatusTypes((prev) => prev.filter((type) => type.id !== id));
      setDeletingId(null);
    } catch (err) {
      const code = err instanceof Error ? err.message : "UNKNOWN_ERROR";
      setError(code);
    }
  };

  return (
    <SharedPanel
      title={t("title")}
      loading={loading}
      loadingText={t("loading")}
      error={error}
      showErrorAsCard={statusTypes.length === 0}
    >
      <PanelActionRow
        actionLabel={t("create")}
        onActionClick={() => setShowCreateForm((prev) => !prev)}
      >
        <div className="flex flex-col justify-center min-h-[52px] px-1">
          <p className="text-[13px] font-medium text-ink-500">{t("subtitle")}</p>
        </div>
      </PanelActionRow>

      {showCreateForm && (
        <div className="mt-3 animate-sheet-in">
          <StatusTypeForm onSubmit={handleCreate} onCancel={() => setShowCreateForm(false)} />
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2">
        {statusTypes.length === 0 ? (
          <div className="card text-center">
            <p className="text-[13px] text-ink-400">{t("empty")}</p>
          </div>
        ) : (
          statusTypes.map((type) => (
            <div key={type.id}>
              {editingType?.id === type.id ? (
                <div className="animate-sheet-in">
                  <StatusTypeForm
                    statusType={editingType}
                    onSubmit={handleUpdate}
                    onCancel={() => setEditingType(null)}
                  />
                </div>
              ) : (
                <div className="card flex items-center justify-between gap-3 bg-white p-4 shadow-card ring-1 ring-ink-100 rounded-xl">
                  <div className="flex-1">
                    <p className="text-[14px] font-medium text-ink-900">{type.statusType}</p>
                    <p className="text-[11px] uppercase tracking-wide text-ink-400 mt-0.5">ID: {type.id}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingType(type)}
                      className="tap flex h-9 w-9 items-center justify-center rounded-lg text-brand-600 transition-colors duration-100 active:bg-brand-50"
                    >
                      <Edit2 size={16} strokeWidth={2.25} aria-hidden />
                    </button>

                    <button
                      onClick={() => setDeletingId(type.id)}
                      className="tap flex h-9 w-9 items-center justify-center rounded-lg text-red-600 transition-colors duration-100 active:bg-red-50"
                    >
                      <Trash2 size={16} strokeWidth={2.25} aria-hidden />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {deletingId !== null && (
        <DeleteConfirmationModal
          title={t("deleteModal.title")}
          message={`${t("deleteModal.confirm")} "${statusTypes.find((t) => t.id === deletingId)?.statusType}"`}
          confirmText={t("deleteModal.delete")}
          cancelText={t("deleteModal.cancel")}
          onConfirm={() => handleDelete(deletingId)}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </SharedPanel>
  );
}