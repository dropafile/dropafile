import type { UploadMetadata } from "@/types/upload-ui";
import { formatBytes } from "@shared/utils/formatBytes";
import { formatKind } from "@shared/utils/formatKind";

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </>
  );
}

export function MetadataList({ data }: { data: UploadMetadata }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
      <MetadataRow label="Name" value={data.name} />
      <MetadataRow label="Declared type" value={data.declared_type || "—"} />
      <MetadataRow label="Detected type" value={data.detected_type || "—"} />
      <MetadataRow
        label="Detected extension"
        value={data.detected_ext || "—"}
      />
      <MetadataRow label="Size" value={formatBytes(data.size)} />
      <MetadataRow label="Kind" value={formatKind(data.kind)} />
      {Object.entries(data.metadata ?? {}).map(([key, value]) => (
        <MetadataRow
          key={key}
          label={key.replaceAll("_", " ")}
          value={String(value ?? "—")}
        />
      ))}
    </dl>
  );
}
