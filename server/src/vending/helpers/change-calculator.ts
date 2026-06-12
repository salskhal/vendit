const DENOMINATIONS = [100, 50, 20, 10, 5] as const;

export function calculateChange(remainingCents: number): number[] {
  const change: number[] = [];
  for (const coin of DENOMINATIONS) {
    while (remainingCents >= coin) {
      change.push(coin);
      remainingCents -= coin;
    }
  }
  return change;
}
