import {
  createRouter,
  createRoute,
  createRootRoute,
  redirect,
  Outlet,
} from '@tanstack/react-router';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import DepositPage from './pages/DepositPage';
import BuyPage from './pages/BuyPage';
import SellerDashboardPage from './pages/SellerDashboardPage';
import NewProductPage from './pages/NewProductPage';
import EditProductPage from './pages/EditProductPage';
import { getToken } from './lib/auth';

function requireAuth() {
  if (!getToken()) throw redirect({ to: '/login' });
}

function requireRole(role: 'buyer' | 'seller') {
  requireAuth();
  try {
    const token = getToken()!;
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.role !== role) {
      throw redirect({ to: role === 'buyer' ? '/seller' : '/products' });
    }
  } catch (e) {
    if (e instanceof Response || (e as any)?.isRedirect) throw e;
    throw redirect({ to: '/login' });
  }
}

const rootRoute = createRootRoute({ component: Layout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    const token = getToken();
    if (!token) throw redirect({ to: '/login' });
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      throw redirect({ to: payload.role === 'seller' ? '/seller' : '/products' });
    } catch (e) {
      if (e instanceof Response || (e as any)?.isRedirect) throw e;
      throw redirect({ to: '/login' });
    }
  },
  component: () => <Outlet />,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
});

const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products',
  component: ProductsPage,
});

const depositRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/deposit',
  beforeLoad: () => requireRole('buyer'),
  component: DepositPage,
});

const buyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/buy/$productId',
  beforeLoad: () => requireRole('buyer'),
  component: function BuyRouteComponent() {
    const { productId } = buyRoute.useParams();
    return <BuyPage productId={productId} />;
  },
});

const sellerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/seller',
  beforeLoad: () => requireRole('seller'),
  component: SellerDashboardPage,
});

const sellerNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/seller/new',
  beforeLoad: () => requireRole('seller'),
  component: NewProductPage,
});

const sellerEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/seller/edit/$id',
  beforeLoad: () => requireRole('seller'),
  component: function EditRouteComponent() {
    const { id } = sellerEditRoute.useParams();
    return <EditProductPage id={id} />;
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  productsRoute,
  depositRoute,
  buyRoute,
  sellerRoute,
  sellerNewRoute,
  sellerEditRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
