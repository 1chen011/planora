"use client";

import { useRef } from "react";

import {
  Download,
  Trash2,
  Upload,
} from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { useLanguage } from "@/i18n/language-context";

import { planoraDataStorage } from "@/lib/storage";

function getLocalDateKey(
  date = new Date(),
) {
  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function DataControls() {
  const { t } =
    useLanguage();

  const fileInputRef =
    useRef<HTMLInputElement>(
      null,
    );

  function handleExport() {
    try {
      const content =
        planoraDataStorage.stringifyExport();

      const blob =
        new Blob(
          [content],
          {
            type: "application/json;charset=utf-8",
          },
        );

      const url =
        URL.createObjectURL(
          blob,
        );

      const anchor =
        document.createElement(
          "a",
        );

      anchor.href = url;

      anchor.download =
        `planora-backup-${getLocalDateKey()}.json`;

      document.body.appendChild(
        anchor,
      );

      anchor.click();

      anchor.remove();

      URL.revokeObjectURL(
        url,
      );

      toast.success(
        t.toast.dataExported,
      );
    } catch (error) {
      console.error(
        "Planora: failed to export data",
        error,
      );

      toast.error(
        t.toast.dataExportFailed,
      );
    }
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleImportFile(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    // Allow selecting the same file again later.
    event.target.value = "";

    if (!file) {
      return;
    }

    const confirmed =
      window.confirm(
        t.sidebar.importConfirm,
      );

    if (!confirmed) {
      return;
    }

    try {
      const rawData =
        await file.text();

      const result =
        planoraDataStorage.importData(
          rawData,
        );

      if (!result.success) {
        console.error(
          "Planora: import rejected",
          result.error,
        );

        toast.error(
          t.toast.dataImportFailed,
        );

        return;
      }

      toast.success(
        t.toast.dataImported,
      );

      window.setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch (error) {
      console.error(
        "Planora: failed to import data",
        error,
      );

      toast.error(
        t.toast.dataImportFailed,
      );
    }
  }

  function handleReset() {
    const confirmed =
      window.confirm(
        t.sidebar.resetConfirm,
      );

    if (!confirmed) {
      return;
    }

    try {
      planoraDataStorage.resetData();

      toast.success(
        t.toast.dataReset,
      );

      window.setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch (error) {
      console.error(
        "Planora: failed to reset local data",
        error,
      );

      toast.error(
        t.toast.dataResetFailed,
      );
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 px-1 text-[11px] text-muted-foreground">
        <Download className="size-3.5" />

        <span>
          {t.sidebar.localData}
        </span>
      </div>

      <div className="grid gap-1.5">
        {/* Export */}
        <Button
          type="button"
          variant="outline"
          onClick={
            handleExport
          }
          className="h-9 w-full justify-start px-2.5 text-xs font-normal"
        >
          <Download className="size-3.5" />

          {t.sidebar.exportData}
        </Button>

        {/* Import */}
        <Button
          type="button"
          variant="outline"
          onClick={
            handleImportClick
          }
          className="h-9 w-full justify-start px-2.5 text-xs font-normal"
        >
          <Upload className="size-3.5" />

          {t.sidebar.importData}
        </Button>

        {/* Reset */}
        <Button
          type="button"
          variant="outline"
          onClick={
            handleReset
          }
          className="h-9 w-full justify-start px-2.5 text-xs font-normal text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-3.5" />

          {t.sidebar.resetData}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={
          handleImportFile
        }
        className="hidden"
      />
    </div>
  );
}