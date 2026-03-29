export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function calculateStreak(
  completedDays: { dayNumber: number; completedAt: number }[]
): number {
  if (completedDays.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sortedByDate = [...completedDays].sort(
    (a, b) => b.completedAt - a.completedAt
  );

  let streak = 0;
  const checkDate = new Date(today);

  for (let i = 0; i < 365; i++) {
    const dayStart = new Date(checkDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(checkDate);
    dayEnd.setHours(23, 59, 59, 999);

    const completedThisDay = sortedByDate.some(
      (d) => d.completedAt >= dayStart.getTime() && d.completedAt <= dayEnd.getTime()
    );

    if (completedThisDay) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (i === 0) {
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export const ADMIN_EMAILS = ["devland0831@gmail.com"];
