import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useCurrentUser } from '../hooks/useAuth';
import { useDeposit, useReset } from '../hooks/useVending';
import CoinSelector from '../components/CoinSelector';
import { useToast } from '../contexts/toast';

function toCoins(amount: number): [number, number][] {
  const denoms = [100, 50, 20, 10, 5];
  const out: [number, number][] = [];
  let rem = amount;
  for (const d of denoms) {
    const c = Math.floor(rem / d);
    if (c) out.push([d, c]);
    rem -= c * d;
  }
  return out;
}

export default function DepositPage() {
  const { data: user } = useCurrentUser();
  const deposit = useDeposit();
  const reset = useReset();
  const { add: toast } = useToast();
  const [sessionCoins, setSessionCoins] = useState(0);

  const handleCoin = async (coin: number) => {
    try {
      await deposit.mutateAsync(coin);
      setSessionCoins((n) => n + 1);
      toast({ kind: 'ok', title: `+${coin}¢ deposited` });
    } catch (err: any) {
      toast({ kind: 'err', title: 'Deposit failed', body: err?.response?.data?.message });
    }
  };

  const handleReset = async () => {
    try {
      await reset.mutateAsync();
      setSessionCoins(0);
      toast({ kind: 'ok', title: 'Balance reset to 0¢' });
    } catch (err: any) {
      toast({ kind: 'err', title: 'Reset failed', body: err?.response?.data?.message });
    }
  };

  const balance = user?.deposit ?? 0;
  const breakdown = toCoins(balance);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">Buyer</div>
          <h1>Deposit coins</h1>
          <p className="page-subtitle">
            Tap a coin to insert it. The machine only takes 5, 10, 20, 50 and 100¢.
          </p>
        </div>
      </div>

      <div className="deposit-layout">
        {/* left — coin tray */}
        <div className="deposit-card">
          <h2>Insert coins</h2>
          <p className="deposit-session-meta">
            This session: {sessionCoins} coin{sessionCoins === 1 ? '' : 's'}
          </p>
          <CoinSelector onSelect={handleCoin} disabled={deposit.isPending} />
        </div>

        {/* right — running total */}
        <div>
          <div className="vd-total">
            <span className="vd-total__lbl">Current deposit</span>
            <span className="vd-total__num">
              {balance}<small>¢</small>
            </span>
            {breakdown.length > 0 && (
              <div className="coin-breakdown">
                {breakdown.map(([d, c]) => (
                  <span key={d} className="coin-breakdown__chip">{c} × {d}¢</span>
                ))}
              </div>
            )}
          </div>

          <div className="deposit-actions">
            {balance > 0 && (
              <button
                onClick={handleReset}
                className="btn btn-ghost"
                disabled={reset.isPending}
                type="button"
              >
                {reset.isPending ? 'Resetting…' : 'Clear'}
              </button>
            )}
            <Link to="/products" className="btn btn-primary">
              Shop now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
