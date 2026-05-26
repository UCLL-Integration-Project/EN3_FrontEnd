"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { ChevronDown, Sliders } from "lucide-react";

import statusService from "@services/StatusService";
import statusTypeService from "@services/StatusTypeService";
import StatusForm from "./StatusForm";
import SharedPanel from "@components/util/SharedPanel";
import PanelActionRow from "@components/util/PanelActionRow";
import DeleteConfirmationModal from "@components/util/DeleteConfirmationModel";

import { StatusResponse, StatusTypeResponse } from "@types";
import StatusRow from "@components/util/status/StatusRow";

type Props = {
  onStatusSelected?: (message: string) => void;
};

export default function MultiStatus({ onStatusSelected }: Props) {
  const [statuses, setStatuses] = useState<StatusResponse[]>([]);
  const [statusTypes, setStatusTypes] = useState<StatusTypeResponse[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<StatusResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isManaging, setIsManaging] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingStatus, setEditingStatus] = useState<StatusResponse | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const t = useTranslations("status");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statusesData, typesData] = await Promise.all([
        statusService.getAllStatuses(),
        statusTypeService.getStatusTypes(),
      ]);

      setStatuses(statusesData);
      setStatusTypes(typesData);

      if (statusesData.length > 0 && !selectedStatus) {
        setSelectedStatus(statusesData[0]);
        onStatusSelected?.(statusesData[0].message);
      }
      setError(null);
    } catch (err) {
      const code = err instanceof Error ? err.message : "UNKNOWN_ERROR";
      const knownCodes = ["USER_NOT_FOUND", "USER_HAS_NO_STATUSES", "NETWORK_ERROR", "UNKNOWN_ERROR"];
      setError(t(`errors.${knownCodes.includes(code) ? code : "UNKNOWN_ERROR"}`));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStatus = (status: StatusResponse) => {
    setSelectedStatus(status);
    onStatusSelected?.(status.message);
  };

  const handleCreated = (status: StatusResponse) => {
    setStatuses((prev) => [status, ...prev]);
    setSelectedStatus(status);
    setShowForm(false);
    onStatusSelected?.(status.message);
  };

  const handleUpdate = (updated: StatusResponse) => {
    setStatuses((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    if (selectedStatus?.id === updated.id) {
      setSelectedStatus(updated);
      onStatusSelected?.(updated.message);
    }
    setEditingStatus(null);
  };

  const handleDelete = async (id: number) => {
    try {
      await statusService.deleteStatus(id);
      setStatuses((prev) => prev.filter((s) => s.id !== id));
      if (selectedStatus?.id === id) {
        setSelectedStatus(null);
        onStatusSelected?.("");
      }
      setDeletingId(null);
    } catch (err) {
      const code = err instanceof Error ? err.message : "UNKNOWN_ERROR";
      setError(code);
    }
  };

  return (
    <SharedPanel
      title={t("select")}
      loading={loading}
      loadingText={t("loading")}
      error={error}
      showErrorAsCard={statuses.length === 0}
    >
      <PanelActionRow
        actionLabel={t("create")}
        onActionClick={() => setShowForm((prev) => !prev)}
      >
        <div className="flex items-center gap-2">
          {/* Main Dropdown view when not looking at raw list */}
          {!isManaging ? (
            <div className="flex-1">
              <Listbox value={selectedStatus} onChange={handleSelectStatus}>
                <div className="relative">
                  <ListboxButton className="flex w-full items-center justify-between gap-2 rounded-xl bg-white px-4 py-3 text-left text-[14px] font-medium text-ink-900 shadow-card ring-1 ring-ink-100 transition-all duration-100 active:scale-[0.98]">
                    <span className="flex-1 truncate">
                      {selectedStatus ? (
                        <span className="flex flex-col gap-0.5">
                          <span className="text-[11px] font-medium uppercase tracking-wide text-ink-400">
                            {selectedStatus.statusType?.statusType ?? ""}
                          </span>
                          <span className="text-[14px] text-ink-900">
                            {selectedStatus.message}
                          </span>
                        </span>
                      ) : (
                        <span className="text-ink-400">{t("empty")}</span>
                      )}
                    </span>
                    <ChevronDown size={16} className="shrink-0 text-ink-300" strokeWidth={2.5} aria-hidden />
                  </ListboxButton>

                  <ListboxOptions className="absolute z-40 mt-2 max-h-60 w-full overflow-auto rounded-xl bg-white shadow-lg ring-1 ring-ink-200 animate-sheet-in">
                    {statuses.length === 0 ? (
                      <div className="px-4 py-3 text-[13px] text-ink-400">{t("empty")}</div>
                    ) : (
                      statuses.map((status) => (
                        <ListboxOption
                          key={status.id}
                          value={status}
                          className={({ active }) =>
                            `cursor-pointer select-none border-b border-ink-50 px-4 py-3 last:border-none ${
                              active ? "bg-brand-50" : ""
                            }`
                          }
                        >
                          {({ selected }) => (
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-medium uppercase tracking-wide text-ink-400">
                                  {status.statusType?.statusType ?? ""}
                                </span>
                                {selected && (
                                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] text-white">✓</span>
                                )}
                              </div>
                              <span className="text-[13px] text-ink-800">{status.message}</span>
                            </div>
                          )}
                        </ListboxOption>
                      ))
                    )}
                  </ListboxOptions>
                </div>
              </Listbox>
            </div>
          ) : (
            <div className="flex-1 h-[52px] items-center px-1">
              <p className="text-[13px] font-medium text-ink-500">{t("manageSubtitle")}</p>
            </div>
          )}

          {/* Manage Switch Toggle */}
          <button
            type="button"
            onClick={() => setIsManaging(!isManaging)}
            className={`tap flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl shadow-card ring-1 transition-all duration-100 active:scale-[0.95] ${
              isManaging ? "bg-ink-900 text-white ring-ink-900" : "bg-white text-ink-500 ring-ink-100"
            }`}
            aria-label="Toggle Custom Management Workspace"
          >
            <Sliders size={18} strokeWidth={2.25} />
          </button>
        </div>
      </PanelActionRow>

      {/* Structured Create Space */}
      {showForm && (
        <div className="mt-3 animate-sheet-in">
          <StatusForm statusTypes={statusTypes} onSubmit={handleCreated} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {/* Structured Status Feed (Parity with Type workspace) */}
      {isManaging && (
        <div className="mt-4 flex flex-col gap-2">
          {statuses.length === 0 ? (
            <div className="card text-center">
              <p className="text-[13px] text-ink-400">{t("empty")}</p>
            </div>
          ) : (
            statuses.map((status) => (
              <div key={status.id}>
                {editingStatus?.id === status.id ? (
                  <div className="animate-sheet-in">
                    <StatusForm
                      status={editingStatus}
                      statusTypes={statusTypes}
                      onSubmit={handleUpdate}
                      onCancel={() => setEditingStatus(null)}
                    />
                  </div>
                ) : (
                  <StatusRow
                    status={status}
                    onEditClick={setEditingStatus}
                    onDeleteClick={setDeletingId}
                  />
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Clean Global Overlay Confirmation Modals */}
      {deletingId !== null && (
        <DeleteConfirmationModal
          title={t("deleteModal.title") ?? "Delete Status"}
          message={`${t("deleteModal.confirm") ?? "Are you sure you want to delete"} "${statuses.find((s) => s.id === deletingId)?.message}"?`}
          confirmText={t("deleteModal.delete") ?? "Delete"}
          cancelText={t("deleteModal.cancel") ?? "Cancel"}
          onConfirm={() => handleDelete(deletingId)}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </SharedPanel>
  );
}