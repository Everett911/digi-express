const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function formatShortDate(date: Date) {
  return DATE_FORMATTER.format(date);
}
