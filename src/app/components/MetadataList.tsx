import type { ReactNode } from "react";
import {
  FileText,
  HardDrive,
  Ruler,
  SlidersHorizontal,
  Tags,
  Users,
} from "lucide-react";
import type { UploadMetadata } from "@/types/upload-ui";
import { formatBytes } from "@shared/utils/formatBytes";
import { formatKind } from "@shared/utils/formatKind";
import type { SharedFileRecord } from "@shared/types/session";
import type { LucideIcon } from "lucide-react";

type MetadataListProps = {
  data: UploadMetadata | SharedFileRecord;
  clientId?: string;
};

const MEASUREMENT_KEYS = new Set([
  "width",
  "height",
  "thumbnail_width",
  "thumbnail_height",
  "characters",
  "lines",
  "format",
]);

function formatLabel(key: string): string {
  return key
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatValue(key: string, value: string | number | null): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (
    key === "width" ||
    key === "height" ||
    key === "thumbnail_width" ||
    key === "thumbnail_height"
  ) {
    return `${value}px`;
  }

  return String(value);
}

function formatUploadedAt(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

function formatOwnerLabel(ownerClientId: string, clientId?: string): string {
  if (clientId && ownerClientId === clientId) {
    return "You";
  }

  return `Peer ${ownerClientId.slice(0, 8)}`;
}

function isSharedFileRecord(
  data: UploadMetadata | SharedFileRecord,
): data is SharedFileRecord {
  return "fileId" in data && "ownerClientId" in data;
}

function MetadataField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right font-medium">{value}</dd>
    </div>
  );
}

function MetadataSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon
          className="size-3.5 shrink-0 text-muted-foreground"
          aria-hidden
        />
        <h3 className="shrink-0 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </h3>
        <span
          className="h-px min-w-4 flex-1 border-b border-dotted border-muted-foreground/45"
          aria-hidden
        />
      </div>
      <dl className="space-y-2.5">{children}</dl>
    </section>
  );
}

export function MetadataList({ data, clientId }: MetadataListProps) {
  const metadata = data.metadata ?? {};
  const measurementEntries = Object.entries(metadata).filter(([key]) =>
    MEASUREMENT_KEYS.has(key),
  );
  const otherMetadataEntries = Object.entries(metadata).filter(
    ([key]) => !MEASUREMENT_KEYS.has(key),
  );
  const isSessionFile = isSharedFileRecord(data);

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="space-y-6">
        <MetadataSection title="Details" icon={FileText}>
          <MetadataField label="Name" value={data.name} />
          {isSessionFile ? (
            <MetadataField label="File ID" value={data.fileId} />
          ) : null}
        </MetadataSection>

        <MetadataSection title="Type" icon={Tags}>
          <MetadataField label="Kind" value={formatKind(data.kind)} />
          <MetadataField label="Declared" value={data.declared_type || "—"} />
          <MetadataField label="Detected" value={data.detected_type || "—"} />
          <MetadataField label="Extension" value={data.detected_ext || "—"} />
        </MetadataSection>
      </div>

      <div className="space-y-6">
        <MetadataSection title="Size" icon={HardDrive}>
          <MetadataField label="File size" value={formatBytes(data.size)} />
        </MetadataSection>

        {measurementEntries.length > 0 ? (
          <MetadataSection title="Measurements" icon={Ruler}>
            {measurementEntries.map(([key, value]) => (
              <MetadataField
                key={key}
                label={formatLabel(key)}
                value={formatValue(key, value)}
              />
            ))}
          </MetadataSection>
        ) : null}

        {isSessionFile ? (
          <MetadataSection title="Session" icon={Users}>
            <MetadataField
              label="Shared"
              value={formatUploadedAt(data.uploadedAt)}
            />
            <MetadataField
              label="Owner"
              value={formatOwnerLabel(data.ownerClientId, clientId)}
            />
          </MetadataSection>
        ) : null}

        {otherMetadataEntries.length > 0 ? (
          <MetadataSection title="Properties" icon={SlidersHorizontal}>
            {otherMetadataEntries.map(([key, value]) => (
              <MetadataField
                key={key}
                label={formatLabel(key)}
                value={formatValue(key, value)}
              />
            ))}
          </MetadataSection>
        ) : null}
      </div>
    </div>
  );
}
