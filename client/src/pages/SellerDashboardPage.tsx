import { Link } from '@tanstack/react-router';
import { useProducts, useDeleteProduct } from '../hooks/useProducts';
import { useCurrentUser } from '../hooks/useAuth';
import { useToast } from '../contexts/toast';
import type { Product } from '../types';

function EditIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" />
    </svg>
  );
}

export default function SellerDashboardPage() {
  const { data: allProducts, isLoading } = useProducts();
  const { data: user } = useCurrentUser();
  const deleteProduct = useDeleteProduct();
  const { add: toast } = useToast();

  const myProducts = allProducts?.filter((p: Product) => p.sellerId === user?.id) ?? [];

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete "${product.productName}"? This cannot be undone.`)) return;
    try {
      await deleteProduct.mutateAsync(product.id);
      toast({ kind: 'ok', title: 'Product deleted', body: product.productName });
    } catch (err: any) {
      toast({ kind: 'err', title: 'Delete failed', body: err?.response?.data?.message });
    }
  };

  if (isLoading) return <div className="loading">Loading dashboard…</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">Seller</div>
          <h1>My products</h1>
          <p className="page-subtitle">{myProducts.length} listing{myProducts.length === 1 ? '' : 's'}</p>
        </div>
        <Link to="/seller/new" className="btn btn-primary">+ New product</Link>
      </div>

      {myProducts.length === 0 ? (
        <div className="empty-state">
          <p>You haven&apos;t listed any products yet.</p>
          <Link to="/seller/new" className="btn btn-primary">Create your first product</Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {myProducts.map((product: Product) => (
                <tr key={product.id}>
                  <td className="table__name">{product.productName}</td>
                  <td className="table__num">{product.cost}¢</td>
                  <td className={product.amountAvailable === 0 ? 'text-err' : ''}>
                    {product.amountAvailable}
                  </td>
                  <td>
                    <div className="row-actions">
                      <Link
                        to="/seller/edit/$id"
                        params={{ id: product.id }}
                        className="vd-iconbtn"
                        title="Edit"
                        aria-label="Edit product"
                      >
                        <EditIcon />
                      </Link>
                      <button
                        onClick={() => handleDelete(product)}
                        className="vd-iconbtn vd-iconbtn--danger"
                        disabled={deleteProduct.isPending}
                        title="Delete"
                        aria-label="Delete product"
                        type="button"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
