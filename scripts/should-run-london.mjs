const targetHour = Number(process.env.TARGET_LONDON_HOUR || 7);
const parts = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
}).formatToParts(new Date()).reduce((acc, p) => {
  if (p.type !== "literal") acc[p.type] = p.value;
  return acc;
}, {});
const currentHour = Number(parts.hour);
const ok = currentHour === targetHour;
console.log(`Europe/London time: ${parts.hour}:${parts.minute}. Target hour: ${String(targetHour).padStart(2,"0")}:xx. should_run=${ok}`);
process.exit(ok ? 0 : 78);
