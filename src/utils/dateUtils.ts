/**
 * Safely converts various date formats to JavaScript Date objects
 * Handles Firestore Timestamps, JavaScript Dates, strings, and null values
 */
export const safeToDate = (dateValue: any): Date | undefined => {
  // Handle null/undefined
  if (dateValue === null || dateValue === undefined) {
    return undefined;
  }

  // Handle Firestore Timestamp objects (they have .toDate() method)
  if (dateValue && typeof dateValue.toDate === 'function') {
    try {
      return dateValue.toDate();
    } catch (error) {
      console.warn('Error converting Firestore Timestamp to Date:', error);
      return undefined;
    }
  }

  // Handle JavaScript Date objects
  if (dateValue instanceof Date) {
    return dateValue;
  }

  // Handle string dates
  if (typeof dateValue === 'string') {
    try {
      const parsedDate = new Date(dateValue);
      // Check if the date is valid
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    } catch (error) {
      console.warn('Error parsing string date:', dateValue, error);
    }
  }

  // Handle numeric timestamps (milliseconds since epoch)
  if (typeof dateValue === 'number') {
    try {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch (error) {
      console.warn('Error converting numeric timestamp to Date:', dateValue, error);
    }
  }

  // Handle objects with seconds/nanoseconds (Firestore Timestamp-like structure)
  if (typeof dateValue === 'object' && dateValue.seconds !== undefined) {
    try {
      const milliseconds = dateValue.seconds * 1000 + (dateValue.nanoseconds || 0) / 1000000;
      return new Date(milliseconds);
    } catch (error) {
      console.warn('Error converting timestamp object to Date:', dateValue, error);
    }
  }

  // Handle Firestore serverTimestamp placeholders
  if (typeof dateValue === 'object' && dateValue._methodName === 'serverTimestamp') {
    // ServerTimestamp is a placeholder that gets replaced with actual server time
    // When we encounter it during reading, it means the write is still pending
    // Return current time as a reasonable fallback
    return new Date();
  }

  console.warn('Unknown date format, cannot convert:', dateValue, typeof dateValue);
  return undefined;
};

/**
 * Safely converts a date value to a JavaScript Date, with fallback
 */
export const safeToDateWithFallback = (dateValue: any, fallback: Date = new Date()): Date => {
  const converted = safeToDate(dateValue);
  return converted || fallback;
};
