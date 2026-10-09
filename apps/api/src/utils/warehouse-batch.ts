/**
 * Warehouse Year-Wise Batch & QC Inspection Generation Utilities (API)
 *
 * Year-wise Generation:
 * - Generates batch numbers based on calendar year (e.g. 2026).
 * - Sequence starts from '01' for the first batch of the year (e.g. BATCH-2026-01).
 * - Resets to '01' on January 1st of each new year.
 */

export function getBatchYear(date: Date = new Date()): string {
  return String(date.getFullYear());
}

export function getFinancialYear(date: Date = new Date(), prefix: string = 'FY'): string {
  const month = date.getMonth();
  const year = date.getFullYear();
  const startYear = month >= 3 ? year : year - 1;
  const endYear = startYear + 1;
  return `${prefix}${String(startYear).slice(-2)}-${String(endYear).slice(-2)}`;
}

export function generateInspectionBatchNumber(
  existingBatches: string[],
  date: Date = new Date(),
  prefix: string = 'BATCH'
): string {
  const yearFull = String(date.getFullYear());
  const yearShort = yearFull.slice(-2);
  const regex = new RegExp(`^${prefix}-(?:${yearFull}|${yearShort}|FY\\d{2}-\\d{2})-(\\d+)`, 'i');

  let maxSeq = 0;
  for (const b of existingBatches) {
    if (!b) continue;
    const match = b.trim().match(regex);
    if (match) {
      const seq = parseInt(match[1], 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  }

  const nextSeq = String(maxSeq + 1).padStart(2, '0');
  return `${prefix}-${yearFull}-${nextSeq}`;
}

export function generateQCInspectionId(
  existingQcIds: string[],
  date: Date = new Date()
): string {
  const yearFull = String(date.getFullYear());
  const yearShort = yearFull.slice(-2);
  const regex = new RegExp(`^QC-(?:${yearFull}|${yearShort}|FY\\d{2}-\\d{2})-(\\d+)`, 'i');

  let maxSeq = 0;
  for (const id of existingQcIds) {
    if (!id) continue;
    const match = id.trim().match(regex);
    if (match) {
      const seq = parseInt(match[1], 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  }

  const nextSeq = String(maxSeq + 1).padStart(2, '0');
  return `QC-${yearFull}-${nextSeq}`;
}
