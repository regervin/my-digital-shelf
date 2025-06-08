import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiX, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useRefunds } from '../hooks/useRefunds';
import { format } from 'date-fns';

export default function RefundDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refunds, loading, updateRefund, deleteRefund } = useRefunds();
  
  const [refund, setRefund] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!loading && refunds.length > 0) {
      const foundRefund = refunds.find(r => r.id === id);
      if (foundRefund) {
        setRefund(foundRefund);
        setNotes(foundRefund.notes || '');
      } else {
        // Refund not found, redirect to refunds list
        navigate('/refunds');
      }
    }
  }, [id, refunds, loading, navigate]);

  const handleApproveRefund = async () => {
    if (!refund || refund.status !== 'pending') return;
    
    const result = await updateRefund(refund.id, {
      status: 'approved',
      refund_date: new Date().toISOString(),
      notes: notes.trim() || refund.notes
    });
    
    if (result.success) {
      setRefund(result.data);
      setIsEditing(false);
    } else {
      alert('Failed to approve refund. Please try again.');
    }
  };

  const handleRejectRefund = async () => {
    if (!refund || refund.status !== 'pending') return;
    
    const result = await updateRefund(refund.id, {
      status: 'rejected',
      notes: notes.trim() || refund.notes
    });
    
    if (result.success) {
      setRefund(result.data);
      setIsEditing(false);
    } else {
      alert('Failed to reject refund. Please try again.');
    }
  };

  const handleUpdateNotes = async () => {
    if (!refund) return;
    
    const result = await updateRefund(refund.id, {
      notes: notes.trim()
    });
    
    if (result.success) {
      setRefund(result.data);
      setIsEditing(false);
    } else {
      alert('Failed to update notes. Please try again.');
    }
  };

  const handleDeleteRefund = async () => {
    if (!refund) return;
    
    const result = await deleteRefund(refund.id);
    
    if (result.success) {
      navigate('/refunds');
    } else {
      alert('Failed to delete refund. Please try again.');
      setConfirmDelete(false);
    }
  };

  if (loading || !refund) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link to="/refunds" className="mr-4 text-gray-500 hover:text-primary-600">
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Refund Details</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Refund Information</h2>
              <div className="flex space-x-2">
                {refund.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => handleApproveRefund()}
                      className="flex items-center text-sm px-3 py-1.5 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-md hover:bg-green-200 dark:hover:bg-green-800"
                    >
                      <FiCheck className="mr-1" />
                      Approve
                    </button>
                    <button 
                      onClick={() => handleRejectRefund()}
                      className="flex items-center text-sm px-3 py-1.5 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-md hover:bg-red-200 dark:hover:bg-red-800"
                    >
                      <FiX className="mr-1" />
                      Reject
                    </button>
                  </>
                )}
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center text-sm px-3 py-1.5 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <FiEdit2 className="mr-1" />
                  {isEditing ? 'Cancel' : 'Edit Notes'}
                </button>
                <button 
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center text-sm px-3 py-1.5 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <FiTrash2 className="mr-1" />
                  Delete
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Refund ID</p>
                <p className="font-medium">{refund.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                <p className="font-medium text-lg">${Number(refund.amount).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  refund.status === 'approved' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : refund.status === 'rejected'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {refund.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Created Date</p>
                <p className="font-medium">{format(new Date(refund.created_at), 'MMM dd, yyyy HH:mm')}</p>
              </div>
              {refund.refund_date && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Refund Date</p>
                  <p className="font-medium">{format(new Date(refund.refund_date), 'MMM dd, yyyy HH:mm')}</p>
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Reason</p>
              <p className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">{refund.reason}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Notes</p>
              {isEditing ? (
                <div>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    rows={4}
                    placeholder="Add notes about this refund..."
                  ></textarea>
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleUpdateNotes}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                    >
                      Save Notes
                    </button>
                  </div>
                </div>
              ) : (
                <p className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md min-h-[80px]">
                  {refund.notes || 'No notes added.'}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Sale Details</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sale ID</p>
                <Link to={`/sales/${refund.sale_id}`} className="font-medium text-primary-600 hover:underline">
                  {refund.sale_id}
                </Link>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Customer</p>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-2">
                    {refund.sale?.customer?.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-medium">{refund.sale?.customer?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{refund.sale?.customer?.email || 'No email'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Product/Membership</p>
                <p className="font-medium">{refund.sale?.product?.name || refund.sale?.membership?.name || 'Unknown'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Original Amount</p>
                <p className="font-medium">${Number(refund.sale?.amount || 0).toFixed(2)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sale Date</p>
                <p className="font-medium">{format(new Date(refund.sale?.created_at || refund.created_at), 'MMM dd, yyyy')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p className="mb-6">Are you sure you want to delete this refund? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRefund}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
