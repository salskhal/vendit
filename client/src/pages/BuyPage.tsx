import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useProduct } from '../hooks/useProducts';
import { useCurrentUser } from '../hooks/useAuth';
import { useBuy } from '../hooks/useVending';
import ChangeDisplay from '../components/ChangeDisplay';
import { useToast } from '../contexts/toast';
import type { BuyResult } from '../types';

interface BuyPageProps {
  readonly productId: string;
}

export default function BuyPage({ productId }: BuyPageProps) {
  const { data: product, isLoading } = useProduct(productId);
  const { data: user } = useCurrentUser();
  const buy = useBuy();
  const { add: toast } = useToast();
  const [amount, setAmount] = useState(1);
  const [result, setResult] = useState<BuyResult | null>(null);

  if (isLoading) return <div className="loading">Loading product…</div>;
  if (!product) {
    return (
      <div className="page">
        <div className="alert alert--error">Product not found.</div>
      </div>
    );
  }

  const total = product.cost * amount;
  const canAfford = (user?.deposit ?? 0) >= total;
  const hasStock = product.amountAvailable >= amount;

  const handleBuy = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    try {
      const res = await buy.mutateAsync({ productId, amount });
      setResult(res);
      toast({
        kind: 'ok',
        title: 'Purchase complete',
        body: `${amount} × ${product.productName}`,
      });
    } catch (err: any) {
      toast({
        kind: 'err',
        title: 'Purchase failed',
        body: err?.response?.data?.message,
      });
    }
  };

  if (result) {
    return (
      <div className="page page--centered">
        <div className="buy-card">
          <ChangeDisplay change={result.change} totalSpent={result.totalSpent} />
          <div className="buy-success-actions" style={{ marginTop: 4 }}>
            <Link to="/products" className="btn btn-primary">Continue shopping</Link>
            <Link to="/deposit" className="btn btn-ghost">Add more coins</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page page--centered">
      <div className="buy-card">
        <Link to="/products" className="back-link">← Back to products</Link>
        <div className="eyebrow">Purchase</div>
        <h1 style={{ fontSize: 22 }}>{product.productName}</h1>

        <div className="product-details">
          <div className="detail-row">
            <span>Price per unit</span>
            <strong>{product.cost}¢</strong>
          </div>
          <div className="detail-row">
            <span>In stock</span>
            <strong>{product.amountAvailable}</strong>
          </div>
          <div className="detail-row">
            <span>Your balance</span>
            <strong>{user?.deposit ?? 0}¢</strong>
          </div>
        </div>

        <form onSubmit={handleBuy} className="form">
          <div className="form-group">
            <label className="vd-label" htmlFor="amount">Quantity</label>
            <div className="quantity-control">
              <button
                type="button"
                className="qty-btn"
                onClick={() => setAmount((n) => Math.max(1, n - 1))}
                disabled={amount <= 1}
              >
                −
              </button>
              <input
                id="amount"
                type="number"
                min={1}
                max={product.amountAvailable}
                value={amount}
                onChange={(e) => setAmount(Math.max(1, Number.parseInt(e.target.value) || 1))}
                className="input input--center"
              />
              <button
                type="button"
                className="qty-btn"
                onClick={() => setAmount((n) => Math.min(product.amountAvailable, n + 1))}
                disabled={amount >= product.amountAvailable}
              >
                +
              </button>
            </div>
          </div>

          <div className="total-row">
            <span>Total</span>
            <strong className={canAfford ? 'text-ok' : 'text-err'}>{total}¢</strong>
          </div>

          {!canAfford && (
            <div className="alert alert--warning">
              Need {total - (user?.deposit ?? 0)}¢ more.{' '}
              <Link to="/deposit" style={{ color: 'inherit' }}>Add coins →</Link>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={buy.isPending || !canAfford || !hasStock}
          >
            {buy.isPending ? 'Processing…' : `Buy for ${total}¢`}
          </button>
        </form>
      </div>
    </div>
  );
}
