import { useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { useRefunds } from '../hooks/useRefunds';

export default function SaleRefundButton({ sale }) {
  const { addRefund } = useRefunds();
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState(sale?.amount || 0);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      setError('Please provide a reason for the refund');
      return;
    }
    
    if (Number(amount) <= 0 || Number(amount) > Number(sale.amount)) {
      setError(`Refund amount must be between $0.01 and $${Number(sale.amount).toFixed(2)}`);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const refundData = {
        sale_id: sale.id,
        amount: Number(amount),
        reason: reason.trim(),
        status: 'pending'
      };
      
      const result = await addRefund(refundData);
      
      if (result.success) {
        setSuccess(true);
        setReason('');
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(false);
        }, 2000);
      } else {
        setError(result.error?.message || 'Failed to create refund');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Don't show the button if the sale is already refunded
  if (sale?.status === 'refunded') {
    return (
      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
        <FiRefreshCw className="mr-1" />
        Refunded
      </span>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center text-sm px-2 py-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
      >
        <FiRefreshCw className="mr-1" />
        Refund
      </button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Process Refund</h3>
            
            {success ? (
              <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 p-4 rounded-md mb-4">
                Refund has been submitted successfully!
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-md mb-4">
                    {error}
                  </div>
                )}
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sale Details
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <p><span className="font-medium">Customer:</span> {sale?.customer?.name || 'Unknown'}</p>
                    <p><span className="font-medium">Product:</span> {sale?.product?.name || sale?.membership?.name || 'Unknown'}</p>
                    <p><span className="font-medium">Original Amount:</span> ${Number(sale?.amount || 0).toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Refund Amount
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">$</span>
                    </div>
                    <input
                      type="number"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="0.01"
                      max={sale?.amount}
                      step="0.01"
                      className="pl-7 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reason for Refund
                  </label>
                  <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    rows={3}
                    placeholder="Explain why you're processing this refund..."
                    required
                  ></textarea>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Process Refund'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
