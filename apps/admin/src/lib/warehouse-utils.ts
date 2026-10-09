/**
 * Warehouse Financial Year & Batch Generation Utilities
 *
 * Financial Year standard in India and commercial accounting:
 * - Runs from 1st April to 31st March of the following year.
 * - Months April (03) to December (11): Current Year to Next Year (e.g., Oct 2026 -> FY26-27)
 * - Months January (00) to March (02): Previous Year to Current Year (e.g., Feb 2027 -> FY26-27)
 *
 * Sequence Number:
 * - Starts from 01 for the first batch in that financial year (e.g. BATCH-FY26-27-01)
 * - Increments sequentially (01, 02, 03... 10... 99... 100...)
 * - Automatically resets to 01 on the 1st of April when the new financial year begins!
 */

/**
 * Returns the Financial Year string (e.g. "FY26-27" or "26-27").
 * @param date Reference date (defaults to current date)
 * @param prefix Optional prefix like "FY" (default: "FY")
 */
export function getFinancialYear(date: Date = new Date(), prefix: string = 'FY'): string {
  const month = date.getMonth(); // 0 = Jan, 1 = Feb, 2 = Mar, 3 = Apr, ...
  const year = date.getFullYear();

  // If April (month >= 3) to December: current year to next year
  // If Jan to March: previous year to current year
  const startYear = month >= 3 ? year : year - 1;
  const endYear = startYear + 1;

  const startYY = String(startYear).slice(-2);
  const endYY = String(endYear).slice(-2);

  return `${prefix}${startYY}-${endYY}`;
}

/**
 * Generates the next sequential Batch ID for the financial year, starting from '01'.
 * Example format: BATCH-FY26-27-01
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
  const fy = getFinancialYear(date, 'FY'); // e.g. "FY26-27"
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

/**
 * Generates the next sequential QC Inspection ID for the financial year, starting from '01'.
 * Example format: QC-FY26-27-01
 *
 * @param existingQcIds Array of existing QC inspection IDs across the system
 * @param date Reference date
 */
export function generateQCInspectionId(
  existingQcIds: string[],
  date: Date = new Date()
): string {
  const fy = getFinancialYear(date, 'FY'); // e.g. "FY26-27"
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
