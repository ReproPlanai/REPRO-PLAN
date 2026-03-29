import React from 'react';
import { X, Printer, Download, CheckCircle } from 'lucide-react';

interface ReceiptItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface ReceiptData {
  orderNumber: string;
  orderDate: string;
  status: string;
  items: ReceiptItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryType: string;
  deliveryAddress?: string;
  notes?: string;
}

interface ReceiptProps {
  receipt: ReceiptData | null;
  isOpen: boolean;
  onClose: () => void;
}

const Receipt: React.FC<ReceiptProps> = ({ receipt, isOpen, onClose }) => {
  if (!isOpen || !receipt) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const receiptText = `
REPRO PLAN - ORDER RECEIPT
============================

Order Number: ${receipt.orderNumber}
Date: ${formatDate(receipt.orderDate)}
Status: ${receipt.status.toUpperCase()}

ITEMS:
${receipt.items.map(item => 
  `- ${item.product_name} x${item.quantity} @ $${item.price.toFixed(2)} = $${item.subtotal.toFixed(2)}`
).join('\n')}

Subtotal: $${receipt.subtotal.toFixed(2)}
Delivery Fee: $${receipt.deliveryFee.toFixed(2)}
TOTAL: $${receipt.total.toFixed(2)}

Delivery Type: ${receipt.deliveryType}
${receipt.deliveryAddress ? `Address: ${receipt.deliveryAddress}` : ''}
${receipt.notes ? `Notes: ${receipt.notes}` : ''}

Thank you for your order!
    `.trim();

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${receipt.orderNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Order Receipt</h2>
              <p className="text-sm text-white/80">{receipt.orderNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Order Info */}
          <div className="flex justify-between items-start pb-4 border-b border-gray-100">
            <div>
              <p className="text-sm text-gray-500">Order Date</p>
              <p className="font-medium text-gray-900">{formatDate(receipt.orderDate)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Status</p>
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                receipt.status === 'delivered' ? 'bg-green-100 text-green-700' :
                receipt.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                receipt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {receipt.status}
              </span>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Items</h3>
            <div className="space-y-2">
              {receipt.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.product_name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                  </div>
                  <p className="font-semibold text-gray-900">${item.subtotal.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-100 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${receipt.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="font-medium">${receipt.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-100">
              <span className="text-gray-900">Total</span>
              <span className="text-primary-600">${receipt.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-1">Delivery Type</p>
            <p className="font-medium text-gray-900 capitalize">{receipt.deliveryType}</p>
            {receipt.deliveryAddress && (
              <>
                <p className="text-sm text-gray-500 mt-2 mb-1">Delivery Address</p>
                <p className="font-medium text-gray-900">{receipt.deliveryAddress}</p>
              </>
            )}
            {receipt.notes && (
              <>
                <p className="text-sm text-gray-500 mt-2 mb-1">Notes</p>
                <p className="text-sm text-gray-700">{receipt.notes}</p>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-100 p-4 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-medium hover:from-primary-600 hover:to-purple-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
