import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { ProductListing } from './pages/ProductListing';
import { CategoryPage } from './pages/CategoryPage';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Search } from './pages/Search';
import { Profile } from './pages/Profile';
import { NewArrivals } from './pages/NewArrivals';
import { BestSellers } from './pages/BestSellers';
import { NotFound } from './pages/NotFound';
import { Sale } from './pages/Sale';
import { MyOrders } from './pages/MyOrders';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminInventory } from './pages/admin/AdminInventory';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { AdminReviews } from './pages/admin/AdminReviews';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminHomepage } from './pages/admin/AdminHomepage';
import { AdminSaleProducts } from './pages/admin/AdminSaleProducts';
import { AdminVideos } from './pages/admin/AdminVideos';
import { AdminCarousel } from './pages/admin/AdminCarousel';
import { AllProducts } from './pages/AllProducts';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'shop', Component: ProductListing },
      { path: 'all-products', Component: AllProducts },
      // Legacy category paths
      { path: 'casual', Component: ProductListing },
      { path: 'formal', Component: ProductListing },
      { path: 'streetwear', Component: ProductListing },
      // Top Wear parent + sub-categories
      { path: 'topwear', Component: CategoryPage },
      { path: 'tshirt', Component: CategoryPage },
      { path: 'shirt', Component: CategoryPage },
      { path: 'coord', Component: CategoryPage },
      { path: 'hoodies', Component: CategoryPage },
      // Bottom Wear parent + sub-categories
      { path: 'bottomwear', Component: CategoryPage },
      { path: 'jeans', Component: CategoryPage },
      { path: 'trousers', Component: CategoryPage },
      { path: 'shorts', Component: CategoryPage },
      { path: 'trackpants', Component: CategoryPage },
      // Other pages
      { path: 'new-arrivals', Component: NewArrivals },
      { path: 'best-sellers', Component: BestSellers },
      { path: 'sale', Component: Sale },
      { path: 'product/:id', Component: ProductDetail },
      { path: 'cart', Component: Cart },
      { path: 'checkout', Component: Checkout },
      { path: 'search', Component: Search },
      { path: 'profile', Component: Profile },
      { path: 'my-orders', Component: MyOrders },
      { path: '*', Component: NotFound },
    ],
  },
  {
    path: '/admin/login',
    Component: Layout,
    children: [{ index: true, Component: AdminLogin }],
  },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: 'products', Component: AdminProducts },
      { path: 'inventory', Component: AdminInventory },
      { path: 'orders', Component: AdminOrders },
      { path: 'customers', Component: AdminCustomers },
      { path: 'analytics', Component: AdminAnalytics },
      { path: 'reviews', Component: AdminReviews },
      { path: 'settings', Component: AdminSettings },
      { path: 'homepage', Component: AdminHomepage },
      { path: 'sale-products', Component: AdminSaleProducts },
      { path: 'videos', Component: AdminVideos },
      { path: 'carousel', Component: AdminCarousel },
    ],
  },
]);