export const generatedDateTime = (date = new Date()): string => {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: process.env.TZ || "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};
