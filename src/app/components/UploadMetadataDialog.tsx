import {
  File,
  FileArchive,
  FileImage,
  FileText,
} from "lucide-react";
import { MetadataList } from "@/components/MetadataList";
import { Badge } from "@/components/ui/badge";
import {
  AppModal,
  AppModalBody,
  AppModalHeader,
} from "@/components/ui/app-modal";
import type { UploadMetadata } from "@/types/upload-ui";
import { formatBytes } from "@shared/utils/formatBytes";
import { formatKind } from "@shared/utils/formatKind";
import type { SharedFileRecord } from "@shared/types/session";
import type { FileKind } from "@shared/types/upload";
import type { LucideIcon } from "lucide-react";

type UploadMetadataDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  data: UploadMetadata | SharedFileRecord | null;
  clientId?: string;
};

const FILE_KIND_ICONS: Record<FileKind, LucideIcon> = {
  text: FileText,
  image: FileImage,
  pdf: FileText,
  zip: FileArchive,
  unsupported: File,
};

export function UploadMetadataDialog({
  open,
  onClose,
  title,
  data,
  clientId,
}: UploadMetadataDialogProps) {
  if (!open || !data) {
    return null;
  }

  const Icon = FILE_KIND_ICONS[data.kind];

  return (
    <AppModal open={open} onClose={onClose} titleId="upload-metadata-title">
      <AppModalHeader
        icon={Icon}
        title={title}
        titleId="upload-metadata-title"
        description={formatBytes(data.size)}
        headerExtra={<Badge variant="secondary">{formatKind(data.kind)}</Badge>}
        onClose={onClose}
      />

      <AppModalBody>
        <MetadataList data={data} clientId={clientId} />
      </AppModalBody>
    </AppModal>
  );
}
