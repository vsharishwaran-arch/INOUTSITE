import { useEffect, useState } from 'react';
import { fetchAllOrders, fetchOrderById, updateOrderStatus, updatePaymentStatus, bulkUpdateOrderStatus, type OrderSummary, type OrderDetail } from '../../lib/api';
import { StatusBadge } from '../../components/StatusBadge';
import { X, ChevronDown, Loader2, Printer, CheckSquare, Square, IndianRupee } from 'lucide-react';

const STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export function AdminOrders() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [paymentUpdatingId, setPaymentUpdatingId] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setError('');
      const result = await fetchAllOrders();
      setOrders(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleViewDetails = async (id: string) => {
    setDetailLoading(true);
    try {
      const detail = await fetchOrderById(id);
      setSelectedOrder(detail);
    } catch {
      setError('Failed to load order details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMarkAsPaid = async (orderId: string) => {
    setPaymentUpdatingId(orderId);
    try {
      await updatePaymentStatus(orderId, 'paid');
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: 'paid' } : o)),
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, paymentStatus: 'paid' } : prev));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payment status');
    } finally {
      setPaymentUpdatingId(null);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === orders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(orders.map((o) => o.id)));
    }
  };

  const handleBulkUpdate = async () => {
    if (!bulkStatus || selectedIds.size === 0) return;
    setBulkUpdating(true);
    try {
      await bulkUpdateOrderStatus(Array.from(selectedIds), bulkStatus);
      setSelectedIds(new Set());
      setBulkStatus('');
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk update failed');
    } finally {
      setBulkUpdating(false);
    }
  };

  const handlePrintInvoice = () => {
    if (!selectedOrder) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html><head><title>Invoice #${selectedOrder.id}</title>
      <style>
        body { font-family: system-ui, sans-serif; max-width: 600px; margin: 40px auto; color: #333; }
        h1 { font-size: 20px; margin-bottom: 4px; }
        .meta { color: #666; font-size: 13px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th, td { text-align: left; padding: 8px; border-bottom: 1px solid #eee; font-size: 13px; }
        th { font-weight: 600; background: #fafafa; }
        .totals { text-align: right; margin-top: 16px; }
        .totals div { margin: 4px 0; font-size: 14px; }
        .totals .grand { font-size: 18px; font-weight: 700; border-top: 2px solid #333; padding-top: 8px; }
        @media print { body { margin: 0; } }
      </style></head><body>
      <h1>INOUT Fashion — Invoice</h1>
      <div class="meta">
        Order #${selectedOrder.id} · ${new Date(selectedOrder.createdAt).toLocaleDateString()}<br/>
        ${selectedOrder.shipping.firstName} ${selectedOrder.shipping.lastName} · ${selectedOrder.shipping.email}<br/>
        ${selectedOrder.shipping.address}, ${selectedOrder.shipping.city}, ${selectedOrder.shipping.state} ${selectedOrder.shipping.zipCode}
      </div>
      <table>
        <thead><tr><th>Item</th><th>Size</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
        <tbody>
          ${selectedOrder.items.map((item) => `
            <tr>
              <td>${item.productName}</td>
              <td>${item.size}</td>
              <td>${item.quantity}</td>
              <td>₹{item.unitPrice.toFixed(2)}</td>
              <td>₹{item.lineTotal.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="totals">
        <div>Subtotal: ₹${selectedOrder.subtotal.toFixed(2)}</div>
        <div>Shipping: ${selectedOrder.shippingAmount === 0 ? 'Free' : `₹${selectedOrder.shippingAmount.toFixed(2)}`}</div>
        ${(selectedOrder as any).discountAmount ? `<div>Discount: -₹${((selectedOrder as any).discountAmount).toFixed(2)}</div>` : ''}
        <div class="grand">Total: ₹${selectedOrder.totalAmount.toFixed(2)}</div>
      </div>
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-white rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Orders</h1>
        <span className="text-sm text-muted-foreground">{orders.length} orders</span>
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
          <span className="text-sm font-medium text-blue-800">{selectedIds.size} selected</span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            className="px-3 py-1.5 border border-blue-200 rounded text-xs bg-white"
          >
            <option value="">Change status to...</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <button
            onClick={handleBulkUpdate}
            disabled={!bulkStatus || bulkUpdating}
            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
          >
            {bulkUpdating && <Loader2 size={12} className="animate-spin" />}
            Apply
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-xs text-blue-600 hover:text-blue-800 ml-auto"
          >
            Clear selection
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-[#fafafa]">
                <th className="px-4 py-3 w-10">
                  <button onClick={toggleSelectAll} className="text-muted-foreground hover:text-foreground">
                    {selectedIds.size === orders.length && orders.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Order</th>
                <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Date</th>
                <th className="text-right px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Total</th>
                <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Payment</th>
                <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-[#fafafa] transition-colors">
                  <td className="px-4 py-3">
                    <button onClick={() => toggleSelect(order.id)} className="text-muted-foreground hover:text-foreground">
                      {selectedIds.has(order.id) ? <CheckSquare size={16} className="text-blue-600" /> : <Square size={16} />}
                    </button>
                  </td>
                  <td className="px-4 py-3 font-medium">#{order.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">{order.email}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">₹{order.totalAmount.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={order.paymentStatus} />
                      {order.paymentMethod === 'cod' && order.paymentStatus === 'pending' && (
                        <button
                          onClick={() => handleMarkAsPaid(order.id)}
                          disabled={paymentUpdatingId === order.id}
                          className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 transition-colors disabled:opacity-50"
                        >
                          {paymentUpdatingId === order.id ? (
                            <Loader2 size={11} className="animate-spin" />
                          ) : (
                            <IndianRupee size={11} />
                          )}
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative inline-block">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updatingId === order.id}
                        className="appearance-none bg-transparent border border-border rounded px-2.5 py-1 pr-7 text-xs font-medium cursor-pointer focus:outline-none focus:border-foreground disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                      {updatingId === order.id && (
                        <Loader2 size={14} className="absolute -right-5 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleViewDetails(order.id)}
                      className="text-xs font-medium text-foreground underline underline-offset-2 hover:opacity-70"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order detail modal */}
      {(selectedOrder || detailLoading) && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => !detailLoading && setSelectedOrder(null)}>
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {detailLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-muted-foreground" size={24} />
              </div>
            ) : selectedOrder && (
              <>
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <h2 className="font-semibold">Order #{selectedOrder.id}</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrintInvoice}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded hover:bg-gray-50 transition-colors"
                    >
                      <Printer size={14} /> Invoice
                    </button>
                    <button onClick={() => setSelectedOrder(null)} className="p-1 hover:bg-gray-100 rounded">
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className="px-6 py-5 space-y-5">
                  {/* Status row */}
                  <div className="flex gap-3 items-center">
                    <StatusBadge status={selectedOrder.status} />
                    <StatusBadge status={selectedOrder.paymentStatus} />
                    {selectedOrder.paymentMethod === 'cod' && selectedOrder.paymentStatus === 'pending' && (
                      <button
                        onClick={() => handleMarkAsPaid(selectedOrder.id)}
                        disabled={paymentUpdatingId === selectedOrder.id}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 transition-colors disabled:opacity-50"
                      >
                        {paymentUpdatingId === selectedOrder.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <IndianRupee size={12} />
                        )}
                        Mark as Paid
                      </button>
                    )}
                  </div>

                  {/* Customer info */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Customer</h3>
                      <p className="text-sm font-medium">{selectedOrder.shipping.firstName} {selectedOrder.shipping.lastName}</p>
                      <p className="text-sm text-muted-foreground">{selectedOrder.shipping.email}</p>
                      <p className="text-sm text-muted-foreground">{selectedOrder.shipping.phone}</p>
                    </div>
                    <div>
                      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Shipping Address</h3>
                      <p className="text-sm">{selectedOrder.shipping.address}</p>
                      <p className="text-sm">{selectedOrder.shipping.city}, {selectedOrder.shipping.state} {selectedOrder.shipping.zipCode}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Items</h3>
                    <div className="border border-border rounded-lg divide-y divide-border">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-3">
                          {item.image && (
                            <img src={item.image} alt="" className="w-12 h-12 rounded object-cover" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.productName}</p>
                            <p className="text-xs text-muted-foreground">Size: {item.size} · Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-medium">₹{item.lineTotal.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="border-t border-border pt-4 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{selectedOrder.shippingAmount === 0 ? 'Free' : `₹${selectedOrder.shippingAmount.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-base pt-1">
                      <span>Total</span>
                      <span>₹{selectedOrder.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
