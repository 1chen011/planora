"use client";

import { Download } from "lucide-react";
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

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 px-1 text-[11px] text-muted-foreground">
        <Download className="size-3.5" />

        <span>
          {t.sidebar.localData}
        </span>
      </div>

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
    </div>
  );
}