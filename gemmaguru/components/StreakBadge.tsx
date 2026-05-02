export default function StreakBadge({ streak }: { streak: number }) {
  return (
    <div className="flex items-center gap-1 text-orange-500 font-bold">
      🔥 {streak} Day Streak
    </div>
  );
}
