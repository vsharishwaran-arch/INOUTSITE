import { RouterProvider } from 'react-router';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ProductCatalogProvider } from './context/ProductCatalogContext';
import { ProfileProvider } from './context/ProfileContext';
import { HomepageContentProvider } from './context/HomepageContentContext';
import { SplashScreen } from './components/SplashScreen';
import { router } from './routes';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <SplashScreen />
      <AuthProvider>
        <ProfileProvider>
          <ProductCatalogProvider>
            <HomepageContentProvider>
              <WishlistProvider>
                <CartProvider>
                  <RouterProvider router={router} />
                </CartProvider>
              </WishlistProvider>
            </HomepageContentProvider>
          </ProductCatalogProvider>
        </ProfileProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}