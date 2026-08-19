const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
  minimumFractionDigits: 2,
});

export function formatCurrency(amount: number) {
  return CURRENCY_FORMATTER.format(amount);
}

const NUMBER_FORMATTER = new Intl.NumberFormat("en-US");

export function formatNumber(number: number) {
  return NUMBER_FORMATTER.format(number);
}

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  weekday: "short",
});

export function formatDate(date: Date | number | string): string {
  const dateObj =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;

  return DATE_FORMATTER.format(dateObj);
}

export function addDays(date: Date | number | string, days: number): Date {
  const result =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : new Date(date.getTime());

  result.setDate(result.getDate() + days);
  return result;
}
