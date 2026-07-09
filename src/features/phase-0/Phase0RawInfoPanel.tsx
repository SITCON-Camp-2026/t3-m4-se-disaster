import { SourceLabel } from "../../components/SourceLabel";
import { StatusBadge } from "../../components/StatusBadge";
import { formatDateTime } from "../../lib/date";
import type { Phase0MessyRecord } from "./phase0-types";

export function Phase0RawInfoPanel({
  records,
  selectedRecordId,
  onSelect,
}: {
  records: Phase0MessyRecord[];
  selectedRecordId: string;
  onSelect: (recordId: string) => void;
}) {
  return (
    <div className="phase0-raw">
      <div className="grid">
        {records.map((record) => (
          <article
            className={`record-card ${record.id === selectedRecordId ? "record-card--selected" : ""}`}
            key={record.id}
          >
            <div className="record-card__header">
              <h3>{record.id}</h3>
              <StatusBadge status={record.verificationStatus} />
            </div>
            <p>{record.rawText}</p>
            <div className="record-card__meta">
              <SourceLabel sourceType={record.sourceType} />
              <span>更新：{formatDateTime(record.updatedAt)}</span>
            </div>
            <button type="button" onClick={() => onSelect(record.id)}>
              送到整理工作台
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
