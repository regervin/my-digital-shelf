import { useState } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import { useDisputes } from '../hooks/useDisputes';

export default function CreateDisputeButton({ sale, customer }) {
  const { addDispute } = useDisputes();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      setError('Please provide a reason for the dispute');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const disputeData = {
        sale_id: sale.id,
        customer_id: customer.id,
        reason: reason.trim(),
        description: description.trim(),
        status: 'open'
      };
      
      const result = await addDispute(disputeData);
      
      if (result.success) {
        setSuccess(true);
        setReason('');
        setDescription('');
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(false);
        }, 2000);
      } else {
        setError(result.error?.message || 'Failed to create dispute');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center text-sm px-2 py-1 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
      >
        <FiAlertTriangle className="mr-1" />
        Create Dispute
      </button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Create Dispute</h3>
            
            {success ? (
              <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 p-4 rounded-md mb-4">
                Dispute has been created successfully!
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
                    <p><span className="font-medium">Customer:</span> {customer?.name || 'Unknown'}</p>
                    <p><span className="font-medium">Product:</span> {sale?.product?.name || sale?.membership?.name || 'Unknown'}</p>
                    <p><span className="font-medium">Amount:</span> ${Number(sale?.amount || 0).toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reason for Dispute
                  </label>
                  <input
                    type="text"
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Brief reason for the dispute"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Detailed Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    rows={4}
                    placeholder="Provide more details about the dispute..."
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
                    className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Dispute'}
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
