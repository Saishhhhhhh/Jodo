/**
 * Warehouse Year-Wise Batch & QC Inspection Generation Utilities
 *
 * Year-wise Generation:
 * - Generates batch numbers based on the calendar year (e.g. 2026).
 * - Sequence starts from '01' for the first batch of the year (e.g. BATCH-2026-01).
 * - Increments sequentially: 01, 02, 03... 10... 99...
 * - Automatically resets to '01' when a new year begins (e.g. BATCH-2027-01).
 */

/**
 * Returns the current year string (e.g. "2026").
 * @param date Reference date (defaults to current date)
 */
export function getBatchYear(date: Date = new Date()): string {
  return String(date.getFullYear());
}

/**
 * Backward compatibility helper for financial year if needed
 */
export function getFinancialYear(date: Date = new Date(), prefix: string = 'FY'): string {
  const month = date.getMonth();
  const year = date.getFullYear();
  const startYear = month >= 3 ? year : year - 1;
  const endYear = startYear + 1;
  return `${prefix}${String(startYear).slice(-2)}-${String(endYear).slice(-2)}`;
}

/**
 * Generates the next sequential Batch ID for the year, starting from '01'.
 * Example format: BATCH-2026-01
 *
 * @param existingBatches Array of existing batch numbers across the system
 * @param date Reference date
 * @param prefix Prefix for the batch tag (default: 'BATCH')
 */
export function generateInspectionBatchNumber(
  existingBatches: string[],
  date: Date = new Date(),
  prefix: string = 'BATCH'
): string {
  const yearFull = String(date.getFullYear()); // "2026"
  const yearShort = yearFull.slice(-2);         // "26"

  // Matches BATCH-2026-01, BATCH-26-01, or BATCH-FY26-27-01
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
  return `${prefix}-${yearFull}-${nextSeq}`; // e.g. BATCH-2026-01
}

/**
 * Generates the next sequential QC Inspection ID for the year, starting from '01'.
 * Example format: QC-2026-01
 *
 * @param existingQcIds Array of existing QC inspection IDs across the system
 * @param date Reference date
 */
export function generateQCInspectionId(
  existingQcIds: string[],
  date: Date = new Date()
): string {
  const yearFull = String(date.getFullYear()); // "2026"
  const yearShort = yearFull.slice(-2);         // "26"
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
  return `QC-${yearFull}-${nextSeq}`; // e.g. QC-2026-01
}
