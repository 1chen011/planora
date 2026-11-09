"use client";

import {
  useRef,
} from "react";

import {
  ChevronRight,
  DatabaseBackup,
  Download,
  Trash2,
  Upload,
} from "lucide-react";

import { toast } from "sonner";

import {
  Button,
} from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  useLanguage,
} from "@/i18n/language-context";

import {
  planoraDataStorage,
} from "@/lib/storage";

function getLocalDateKey(
  date = new Date(),
) {
  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(
    2,
    "0",
  );

  const day = String(
    date.getDate(),
  ).padStart(
    2,
    "0",
  );

  return `${year}-${month}-${day}`;
}

export function DataControls() {
  const {
    t,
  } = useLanguage();

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
          [
            content,
          ],
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

      anchor.href =
        url;

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

      window.setTimeout(
        () => {
          window.location.reload();
        },
        700,
      );
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

      window.setTimeout(
        () => {
          window.location.reload();
        },
        700,
      );
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
    <Dialog>
      <DialogTrigger
        asChild
      >
        <button
          type="button"
          className="flex h-9 w-full items-center justify-between rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <span className="flex items-center gap-2">
            <DatabaseBackup className="size-3.5" />

            {
              t.sidebar
                .dataBackup
            }
          </span>

          <ChevronRight className="size-3.5 opacity-60" />
        </button>
      </DialogTrigger>

      <DialogContent className="w-[calc(100%-2rem)] max-w-md overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {
              t.sidebar
                .dataBackup
            }
          </DialogTitle>

          <DialogDescription className="leading-relaxed">
            {
              t.sidebar
                .dataBackupDescription
            }
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-w-0 gap-2 pt-2">
          {/* Export */}
          <Button
            type="button"
            variant="outline"
            onClick={
              handleExport
            }
            className="h-auto w-full min-w-0 justify-start gap-3 whitespace-normal px-3 py-3 text-left font-normal"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary">
              <Download className="size-4" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">
                {
                  t.sidebar
                    .exportData
                }
              </p>

              <p className="mt-0.5 whitespace-normal break-words text-xs leading-relaxed text-muted-foreground">
                {
                  t.sidebar
                    .exportDataDescription
                }
              </p>
            </div>
          </Button>

          {/* Import */}
          <Button
            type="button"
            variant="outline"
            onClick={
              handleImportClick
            }
            className="h-auto w-full min-w-0 justify-start gap-3 whitespace-normal px-3 py-3 text-left font-normal"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary">
              <Upload className="size-4" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">
                {
                  t.sidebar
                    .importData
                }
              </p>

              <p className="mt-0.5 whitespace-normal break-words text-xs leading-relaxed text-muted-foreground">
                {
                  t.sidebar
                    .importDataDescription
                }
              </p>
            </div>
          </Button>

          {/* Reset */}
          <Button
            type="button"
            variant="outline"
            onClick={
              handleReset
            }
            className="h-auto w-full min-w-0 justify-start gap-3 whitespace-normal px-3 py-3 text-left font-normal text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-destructive/10">
              <Trash2 className="size-4" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">
                {
                  t.sidebar
                    .resetData
                }
              </p>

              <p className="mt-0.5 whitespace-normal break-words text-xs leading-relaxed text-muted-foreground">
                {
                  t.sidebar
                    .resetDataDescription
                }
              </p>
            </div>
          </Button>
        </div>

        <input
          ref={
            fileInputRef
          }
          type="file"
          accept=".json,application/json"
          onChange={
            handleImportFile
          }
          className="hidden"
        />
      </DialogContent>
    </Dialog>
  );
}