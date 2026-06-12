import { Link } from '@tanstack/react-router';
import { useProducts } from '../hooks/useProducts';
import { useCurrentUser } from '../hooks/useAuth';
import { getToken } from '../lib/auth';

function BoxIcon() {
  return (
    <svg width={28} height={28} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8 12 3 3 8v8l9 5 9-5z" /><path d="M3 8l9 5 9-5M12 13v8" />
    </svg>
  );
}

function stockChip(stock: number) {
  if (stock === 0) return { cls: 'out', label: 'Out of stock' };
  if (stock <= 5)  return { cls: 'low', label: `Low · ${stock} left` };
  return { cls: 'in', label: `In stock · ${stock}` };
}

export default function ProductsPage() {
  const { data: products, isLoading, error } = useProducts();
  const { data: user } = useCurrentUser();
  const isAuthenticated = !!getToken();

  if (isLoading) return <div className="loading">Loading products…</div>;
  if (error) {
    return (
      <div className="page">
        <div className="alert alert--error">Failed to load products.</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">Public catalogue</div>
          <h1>Everything in the machine</h1>
          <p className="page-subtitle">
            {products?.length ?? 0} products available.
            {!isAuthenticated && ' Log in as a buyer to deposit and purchase.'}
          </p>
        </div>
        {user?.role === 'buyer' && (
          <div className="balance-info">
            <span className="balance-label">Balance</span>
            <span className="balance-amount">{user.deposit}<span style={{ fontSize: 12, marginLeft: 1 }}>¢</span></span>
            <Link to="/deposit" className="btn btn-primary btn-sm">Add coins</Link>
          </div>
        )}
      </div>

      {!products || products.length === 0 ? (
        <div className="empty-state">
          <p>No products available yet.</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => {
            const chip = stockChip(product.amountAvailable);
            return (
              <div key={product.id} className="product-card">
                <div className="product-thumb" aria-hidden="true">
                  <BoxIcon />
                </div>
                <div>
                  <div className="product-name">{product.productName}</div>
                </div>
                <div className="product-meta">
                  <span className="price-tag">
                    {product.cost}<span className="price-unit">¢</span>
                  </span>
                  <span className={`vd-chip vd-chip--${chip.cls}`}>
                    <i />{chip.label}
                  </span>
                </div>
                {isAuthenticated && user?.role === 'buyer' && product.amountAvailable > 0 && (
                  <div className="product-card__footer">
                    <Link
                      to="/buy/$productId"
                      params={{ productId: product.id }}
                      className="btn btn-ghost btn-full"
                    >
                      Buy
                    </Link>
                  </div>
                )}
                {!isAuthenticated && product.amountAvailable > 0 && (
                  <div className="product-card__footer">
                    <Link to="/login" className="btn btn-ghost btn-full">
                      Log in to buy
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
