import { useState, useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useProduct, useUpdateProduct } from '../hooks/useProducts';
import { useToast } from '../contexts/toast';

interface EditProductPageProps {
  readonly id: string;
}

export default function EditProductPage({ id }: EditProductPageProps) {
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(id);
  const update = useUpdateProduct();
  const { add: toast } = useToast();
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [stock, setStock] = useState('');

  useEffect(() => {
    if (product) {
      setName(product.productName);
      setCost(String(product.cost));
      setStock(String(product.amountAvailable));
    }
  }, [product]);

  if (isLoading) return <div className="loading">Loading product…</div>;
  if (!product) {
    return (
      <div className="page">
        <div className="alert alert--error">Product not found.</div>
      </div>
    );
  }

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    const costNum = Number.parseInt(cost);
    const stockNum = Number.parseInt(stock);
    if (costNum % 5 !== 0) {
      toast({ kind: 'err', title: 'Invalid price', body: 'Price must be a multiple of 5¢.' });
      return;
    }
    try {
      await update.mutateAsync({ id, data: { productName: name, cost: costNum, amountAvailable: stockNum } });
      toast({ kind: 'ok', title: 'Product updated', body: name });
      navigate({ to: '/seller' });
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast({
        kind: 'err',
        title: 'Update failed',
        body: Array.isArray(msg) ? msg.join(', ') : msg,
      });
    }
  };

  return (
    <div className="page page--narrow">
      <Link to="/seller" className="back-link">← Back to dashboard</Link>
      <div className="eyebrow">Seller</div>
      <h1>Edit product</h1>

      <div style={{
        marginTop: 24,
        background: 'var(--crux-surface)',
        border: '1px solid var(--crux-border)',
        borderRadius: 'var(--crux-radius-lg)',
        padding: 28,
      }}>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label className="vd-label" htmlFor="name">Product name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input"
            />
          </div>
          <div className="form-group">
            <label className="vd-label" htmlFor="cost">Price</label>
            <div className="input-with-suffix">
              <input
                id="cost"
                type="number"
                min={5}
                step={5}
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                required
                className="input"
              />
              <span className="input-suffix">¢</span>
            </div>
            <span className="vd-hint">Must be a multiple of 5.</span>
          </div>
          <div className="form-group">
            <label className="vd-label" htmlFor="stock">Stock</label>
            <input
              id="stock"
              type="number"
              min={0}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
              className="input"
            />
          </div>
          <div className="form-actions">
            <Link to="/seller" className="btn btn-ghost">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={update.isPending}>
              {update.isPending ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
