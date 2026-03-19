export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;

  return d.toLocaleString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};