/**
 * Financial Year & Inspection Batch ID Generation Utilities
 *
 * Financial Year (April 1 to March 31):
 * - Example: October 2026 -> FY26-27
 * - Sequential number resets to '01' on April 1 of each new FY.
 */

export function getFinancialYear(date: Date = new Date(), prefix: string = 'FY'): string {
  const month = date.getMonth(); // 0 = Jan, 3 = Apr
  const year = date.getFullYear();

  const startYear = month >= 3 ? year : year - 1;
  const endYear = startYear + 1;

  const startYY = String(startYear).slice(-2);
  const endYY = String(endYear).slice(-2);

  return `${prefix}${startYY}-${endYY}`;
}

export function generateInspectionBatchNumber(
  existingBatches: string[],
  date: Date = new Date(),
  prefix: string = 'BATCH'
): string {
  const fy = getFinancialYear(date, 'FY');
  const regex = new RegExp(`^${prefix}-${fy}-(\\d+)`, 'i');

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
  return `${prefix}-${fy}-${nextSeq}`;
}

export function generateQCInspectionId(
  existingQcIds: string[],
  date: Date = new Date()
): string {
  const fy = getFinancialYear(date, 'FY');
  const regex = new RegExp(`^QC-${fy}-(\\d+)`, 'i');

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
  return `QC-${fy}-${nextSeq}`;
}
