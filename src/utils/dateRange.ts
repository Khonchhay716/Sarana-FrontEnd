// Shared helpers for building unambiguous date-range query params.
//
// Sending a bare "YYYY-MM-DD" string to the backend is ambiguous: the backend has to guess
// a timezone offset when parsing it, and it guesses based on the SERVER's own machine
// timezone - not the user's. That makes "Today" (and any other date-range filter) wrong
// whenever the server's timezone differs from the user's (e.g. server on UTC, user in
// Cambodia +07:00).
//
// The fix: always build the Date from LOCAL wall-clock components (never toISOString() to
// derive a calendar day - that reads the UTC date, which can be a different day entirely
// near local midnight), then serialize with toISOString() to get an explicit UTC-instant
// ISO string. That's safe specifically because the Date was constructed from local getters.

// "YYYY-MM-DD" for the given local calendar day - safe to use as an <input type="date">
// value or for building preset ranges, but never send this directly to the backend.
export const toLocalDate = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
};

// Parses a "YYYY-MM-DD" string (from toLocalDate, or a native <input type="date">) into a
// Date at LOCAL midnight of that day. Never pass such a string to `new Date(str)` directly -
// the single-arg string constructor parses date-only strings as UTC midnight, which is the
// exact bug this avoids.
export const parseLocalDateString = (s: string): Date => {
    const [y, m, day] = s.split("-").map(Number);
    return new Date(y, m - 1, day, 0, 0, 0, 0);
};

// Start of the given local day, serialized as the UTC instant it represents.
export const toLocalDayStart = (d: Date): string => {
    const local = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    return local.toISOString();
};

// End of the given local day (23:59:59.999), serialized as the UTC instant it represents.
// Use this for an inclusive upper bound (e.g. `EndDate >= now` on the backend) instead of
// start-of-day, which would make the range expire at midnight on its last valid day instead
// of at the end of it.
export const toLocalDayEnd = (d: Date): string => {
    const local = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
    return local.toISOString();
};
