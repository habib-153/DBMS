interface IDate {
  calendar?: {
    identifier?: string;
  };
  day?: number | string;
  era?: string;
  month?: number | string;
  year?: number | string;
}

type DateInput = IDate | Date | string | undefined | null;

/**
 * Convert various date inputs to ISO string safely.
 * - If input is falsy, returns current time ISO.
 * - If input is a Date, returns its ISO if valid.
 * - If input is a string, tries to parse it as ISO or common date formats.
 * - If input matches IDate (month/day/year), builds a Date and returns ISO when valid.
 */
const dateToISO = (date: DateInput): string => {
  // fallback to now
  const nowISO = new Date().toISOString();

  if (!date) return nowISO;

  // If already a Date
  if (date instanceof Date) {
    if (!isNaN(date.getTime())) return date.toISOString();
    return nowISO;
  }

  // If string, try to parse
  if (typeof date === "string") {
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) return parsed.toISOString();

    // try replacing common separators (e.g., MM-DD-YYYY or DD-MM-YYYY)
    const alt = new Date(date.replace(/-/g, "/"));
    if (!isNaN(alt.getTime())) return alt.toISOString();

    return nowISO;
  }

  // Try IDate shape
  try {
    const month = Number((date as IDate)?.month ?? NaN);
    const day = Number((date as IDate)?.day ?? NaN);
    const year = Number((date as IDate)?.year ?? NaN);

    if (![month, day, year].some((v) => isNaN(v))) {
      // Note: JS Date months are 0-based when using Date(year, month-1, day)
      const dt = new Date(year, month - 1, day);
      if (!isNaN(dt.getTime())) return dt.toISOString();
    }
  } catch (e) {
    // swallow and fallback
  }

  return nowISO;
};

export default dateToISO;
