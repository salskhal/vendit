interface ChangeDisplayProps {
  change: number[];
  totalSpent: number;
}

export default function ChangeDisplay({ change, totalSpent }: ChangeDisplayProps) {
  const totalChange = change.reduce((a, b) => a + b, 0);

  const coinCounts = change.reduce<Record<number, number>>((acc, coin) => {
    acc[coin] = (acc[coin] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="change-display">
      <h3>Purchase complete!</h3>
      <div className="change-row">
        <span className="change-label">Spent:</span>
        <span className="change-value">{totalSpent}¢</span>
      </div>
      <div className="change-row">
        <span className="change-label">Change returned:</span>
        <span className="change-value">{totalChange}¢</span>
      </div>
      {change.length > 0 ? (
        <div className="change-coins">
          {Object.entries(coinCounts)
            .sort(([a], [b]) => Number(b) - Number(a))
            .map(([coin, count]) => (
              <span key={coin} className="change-coin">
                {count} × {coin}¢
              </span>
            ))}
        </div>
      ) : (
        <p className="change-exact">Exact amount — no change needed!</p>
      )}
    </div>
  );
}
