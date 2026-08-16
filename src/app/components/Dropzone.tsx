import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

type DropzoneProps = {
  onFilesSelected: (files: File[]) => void;
  compact?: boolean;
  disabled?: boolean;
};

function filesFromList(fileList: FileList | null | undefined): File[] {
  if (!fileList || fileList.length === 0) {
    return [];
  }

  return Array.from(fileList);
}

export function Dropzone({
  onFilesSelected,
  compact = false,
  disabled = false,
}: DropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (files: File[]) => {
    if (disabled || files.length === 0) {
      return;
    }

    onFilesSelected(files);
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    handleFiles(filesFromList(event.dataTransfer.files));
  };

  return (
    <>
      <div
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed text-center transition-colors",
          compact ? "min-h-24 px-4 py-5" : "min-h-40 px-6 py-10",
          dragOver
            ? "border-primary bg-accent/40"
            : "border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40",
          disabled && "pointer-events-none opacity-60",
        )}
        onClick={() => {
          if (!disabled) {
            fileInputRef.current?.click();
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) {
            setDragOver(true);
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) {
            setDragOver(true);
          }
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragOver(false);
        }}
        onDrop={onDrop}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onKeyDown={(event) => {
          if (disabled) {
            return;
          }

          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            fileInputRef.current?.click();
          }
        }}
      >
        <span className={cn("font-medium", compact ? "text-sm" : "text-lg")}>
          Drop files here
        </span>
        <span className="mt-1 text-sm text-muted-foreground">
          {compact
            ? "or click to browse — multiple files supported"
            : "or click to browse your local files — multiple files supported"}
        </span>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        hidden
        disabled={disabled}
        onChange={() => {
          handleFiles(filesFromList(fileInputRef.current?.files));
          fileInputRef.current!.value = "";
        }}
      />
    </>
  );
}
