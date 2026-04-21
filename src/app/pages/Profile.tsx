import { useState, useEffect } from 'react';
import { User, MapPin, Package, Heart, LogOut, Lock, ChevronDown, ChevronUp, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { useWishlist } from '../context/WishlistContext';
import { fetchMyOrders, type MyOrderSummary } from '../lib/api';
import { Link } from 'react-router';

// ── Auth gate: shown when user is not logged in ──────────────────────────
function AccountGate() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!firstName.trim() || !lastName.trim()) {
          setError('Please enter your first and last name');
          return;
        }
        await register({ firstName, lastName, email, password });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-[420px]">
        <h1
          style={{ fontFamily: 'var(--font-display)' }}
          className="text-4xl mb-8 tracking-tight text-center"
        >
          My Account
        </h1>

        {/* Sign In / Create Account toggle */}
        <div className="flex border-b border-border mb-6">
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2.5 text-sm tracking-wide transition-colors ${
              mode === 'login' ? 'border-b-2 border-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-2.5 text-sm tracking-wide transition-colors ${
              mode === 'register' ? 'border-b-2 border-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        {/* Email / Password form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 border border-border bg-input-background focus:outline-none focus:border-foreground transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full px-4 py-3 border border-border bg-input-background focus:outline-none focus:border-foreground transition-colors text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-border bg-input-background focus:outline-none focus:border-foreground transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-11 border border-border bg-input-background focus:outline-none focus:border-foreground transition-colors text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-background py-3 text-sm tracking-widest uppercase hover:bg-foreground/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

export function Profile() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses' | 'wishlist' | 'password'>('profile');
  const { profileData, updateProfile, isProfileComplete } = useProfile();
  const { items: wishlistItems, removeFromWishlist } = useWishlist();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [formData, setFormData] = useState(profileData);

  const [orders, setOrders] = useState<MyOrderSummary[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // When user logs in, sync their server-side data into ProfileContext so the form is pre-populated.
  useEffect(() => {
    if (user) {
      const synced = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        ...(user.address   && { address: user.address }),
        ...(user.city      && { city: user.city }),
        ...(user.state     && { state: user.state }),
        ...(user.zipCode   && { zipCode: user.zipCode }),
      };
      updateProfile(synced);
      setFormData(prev => ({ ...prev, ...synced }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // only re-sync when the logged-in user changes

  // Auto-fetch orders when orders tab is opened and email is available
  useEffect(() => {
    if (activeTab === 'orders' && profileData.email) {
      setOrdersLoading(true);
      setOrdersError('');
      fetchMyOrders(profileData.email.trim())
        .then(res => setOrders(res.items))
        .catch(() => setOrdersError('Could not load orders. Please check your email in your profile.'))
        .finally(() => setOrdersLoading(false));
    }
  }, [activeTab, profileData.email]);

  // Show login/register gate when no user is authenticated
  if (!user) return <AccountGate />;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateProfile(formData);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const profileComplete = isProfileComplete();
  const avatarLetter = profileData.firstName ? profileData.firstName[0].toUpperCase() : '?';

  const hasAddress = profileData.address && profileData.city && profileData.state;

  const statusColor: Record<string, string> = {
    pending: 'text-yellow-600',
    confirmed: 'text-blue-600',
    processing: 'text-blue-600',
    shipped: 'text-indigo-600',
    delivered: 'text-green-600',
    cancelled: 'text-red-600',
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'password', label: 'Change Password', icon: Lock },
  ];

  return (
    <div className="min-h-screen py-10 sm:py-16 px-4 sm:px-10 lg:px-14">
      <div className="max-w-[1400px] mx-auto">
        <h1
          style={{ fontFamily: 'var(--font-display)' }}
          className="text-4xl sm:text-[3.2rem] mb-14 tracking-tight"
        >
          My Account
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-10">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-muted/30 p-6 mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-foreground text-background flex items-center justify-center text-xl font-semibold shrink-0">
                  {avatarLetter}
                </div>
                <div>
                  <p className="font-medium">{profileData.firstName} {profileData.lastName}</p>
                  <p className="text-sm text-muted-foreground">{profileData.email}</p>
                </div>
              </div>
            </div>

            <nav className="space-y-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                      activeTab === tab.id
                        ? 'bg-foreground text-background'
                        : 'hover:bg-muted/30'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="tracking-wide">{tab.label}</span>
                  </button>
                );
              })}
              <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-destructive">
                <LogOut size={20} />
                <span className="tracking-wide">Logout</span>
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl mb-6 tracking-tight">Personal Information</h2>

                <div className="bg-muted/30 p-8 mb-6">
                  <form onSubmit={handleProfileSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-border bg-input-background focus:outline-none focus:border-foreground transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-border bg-input-background focus:outline-none focus:border-foreground transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-border bg-input-background focus:outline-none focus:border-foreground transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-border bg-input-background focus:outline-none focus:border-foreground transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">Address</label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-border bg-input-background focus:outline-none focus:border-foreground transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">City</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-border bg-input-background focus:outline-none focus:border-foreground transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">State</label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-border bg-input-background focus:outline-none focus:border-foreground transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">Zip Code</label>
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-border bg-input-background focus:outline-none focus:border-foreground transition-colors"
                        />
                      </div>
                    </div>
                    <button className="mt-6 bg-foreground text-background px-8 py-3 hover:bg-foreground/90 transition-colors tracking-wide">
                      SAVE CHANGES
                    </button>
                  </form>
                </div>

                {showSuccessMessage && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
                    <strong className="font-bold">Success!</strong> Your profile has been updated.
                    <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                      <svg className="fill-current h-6 w-6 text-green-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.03a1.2 1.2 0 0 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 0 1 1.697-1.697L10 8.183l2.651-3.03a1.2 1.2 0 0 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1-1.697 1.697z"/></svg>
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-2xl mb-6 tracking-tight">Order History</h2>

                {!profileData.email && (
                  <div className="bg-muted/30 p-8 text-center">
                    <Package size={40} className="mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground mb-3">Save your email in your profile to view orders.</p>
                    <button onClick={() => setActiveTab('profile')} className="text-sm underline hover:no-underline">
                      Go to Profile
                    </button>
                  </div>
                )}

                {profileData.email && ordersLoading && (
                  <div className="text-center py-12 text-muted-foreground text-sm">Loading orders...</div>
                )}

                {profileData.email && ordersError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">{ordersError}</div>
                )}

                {profileData.email && !ordersLoading && !ordersError && orders.length === 0 && (
                  <div className="bg-muted/30 p-8 text-center">
                    <Package size={40} className="mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground mb-3">No orders found for <strong>{profileData.email}</strong></p>
                    <Link to="/shop" className="text-sm underline hover:no-underline">Start shopping</Link>
                  </div>
                )}

                {orders.length > 0 && (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div key={order.id} className="bg-muted/30 overflow-hidden">
                        <button
                          onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                          className="w-full px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/50 transition-colors text-left"
                        >
                          <div>
                            <p className="font-medium tracking-wide mb-0.5">Order #{order.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              {' · '}{order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-medium">₹{order.totalAmount.toFixed(2)}</p>
                              <p className={`text-sm capitalize ${statusColor[order.status] ?? 'text-muted-foreground'}`}>{order.status}</p>
                            </div>
                            {expandedOrderId === order.id ? <ChevronUp size={16} className="text-muted-foreground shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground shrink-0" />}
                          </div>
                        </button>

                        {expandedOrderId === order.id && (
                          <div className="border-t border-border px-6 py-4 space-y-3">
                            {order.items.map(item => (
                              <div key={`${item.productId}-${item.size}`} className="flex justify-between items-center text-sm">
                                <div>
                                  <p className="font-medium">{item.productName}</p>
                                  <p className="text-muted-foreground">Size: {item.size} × {item.quantity}</p>
                                </div>
                                <p className="font-medium">₹{item.lineTotal.toFixed(2)}</p>
                              </div>
                            ))}
                            <div className="border-t border-border pt-3 text-sm space-y-1">
                              <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span><span>₹{order.subtotal.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-muted-foreground">
                                <span>Shipping</span><span>{order.shippingAmount === 0 ? 'FREE' : `₹${order.shippingAmount.toFixed(2)}`}</span>
                              </div>
                              <div className="flex justify-between font-semibold pt-1">
                                <span>Total</span><span>₹{order.totalAmount.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div>
                <h2 className="text-2xl mb-6 tracking-tight">Saved Addresses</h2>
                {hasAddress ? (
                  <div className="bg-muted/30 p-6 relative max-w-md">
                    <span className="absolute top-4 right-4 text-xs bg-foreground text-background px-3 py-1 tracking-wide">DEFAULT</span>
                    <h3 className="font-medium mb-3 tracking-wide">Home</h3>
                    <p className="text-sm text-muted-foreground mb-1">{profileData.firstName} {profileData.lastName}</p>
                    {profileData.phone && <p className="text-sm text-muted-foreground mb-1">{profileData.phone}</p>}
                    <p className="text-sm text-muted-foreground mb-1">{profileData.address}</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {profileData.city}, {profileData.state}{profileData.zipCode ? ` - ${profileData.zipCode}` : ''}
                    </p>
                    <button
                      onClick={() => setActiveTab('profile')}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors tracking-wide"
                    >
                      Edit
                    </button>
                  </div>
                ) : (
                  <div className="bg-muted/30 p-8 text-center">
                    <MapPin size={40} className="mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground mb-3">No address saved yet.</p>
                    <button onClick={() => setActiveTab('profile')} className="text-sm underline hover:no-underline">
                      Add your address in Profile
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div>
                <h2 className="text-2xl mb-6 tracking-tight">My Wishlist</h2>
                {wishlistItems.length === 0 ? (
                  <div className="text-center py-20 bg-muted/30">
                    <Heart size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground tracking-wide mb-4">
                      Your wishlist is empty
                    </p>
                    <Link to="/shop" className="text-sm underline hover:no-underline">
                      Start shopping
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistItems.map(item => (
                      <div key={item.id} className="group relative border border-border bg-background">
                        <Link to={`/product/${item.id}`} className="block">
                          <div className="aspect-[3/4] bg-[#f3f3f3] overflow-hidden">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                          <div className="p-4">
                            <h3 className="text-sm font-medium tracking-wide line-clamp-1 mb-1">{item.name}</h3>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{item.category}</p>
                            {item.discountPrice ? (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-red-600">₹{item.discountPrice.toFixed(2)}</span>
                                <span className="text-xs text-muted-foreground line-through">₹{item.price.toFixed(2)}</span>
                              </div>
                            ) : (
                              <span className="text-sm font-medium">₹{item.price.toFixed(2)}</span>
                            )}
                          </div>
                        </Link>
                        <button
                          onClick={() => removeFromWishlist(item.id)}
                          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors z-10"
                          aria-label="Remove from wishlist"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* Change Password Tab */}
            {activeTab === 'password' && (
              <div>
                <h2 className="text-2xl mb-6 tracking-tight">Change Password</h2>
                <div className="bg-muted/30 p-8">
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">Current Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border border-border bg-input-background focus:outline-none focus:border-foreground transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border border-border bg-input-background focus:outline-none focus:border-foreground transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border border-border bg-input-background focus:outline-none focus:border-foreground transition-colors"
                      />
                    </div>
                  </div>
                  <button className="mt-6 bg-foreground text-background px-8 py-3 hover:bg-foreground/90 transition-colors tracking-wide">
                    UPDATE PASSWORD
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}