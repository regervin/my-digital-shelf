import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiMessageSquare, FiCheck, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useDisputes } from '../hooks/useDisputes';
import { format } from 'date-fns';

export default function DisputeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { disputes, loading, updateDispute, deleteDispute } = useDisputes();
  
  const [dispute, setDispute] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [resolution, setResolution] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!loading && disputes.length > 0) {
      const foundDispute = disputes.find(d => d.id === id);
      if (foundDispute) {
        setDispute(foundDispute);
        setResolution(foundDispute.resolution || '');
      } else {
        // Dispute not found, redirect to disputes list
        navigate('/disputes');
      }
    }
  }, [id, disputes, loading, navigate]);

  const handleUpdateStatus = async (newStatus) => {
    if (!dispute || dispute.status === newStatus) return;
    
    const updates = { 
      status: newStatus,
      resolution: resolution.trim() || dispute.resolution
    };
    
    // If resolving, add resolved_at timestamp
    if (newStatus === 'resolved') {
      updates.resolved_at = new Date().toISOString();
    }
    
    const result = await updateDispute(dispute.id, updates);
    
    if (result.success) {
      setDispute(result.data);
      setIsEditing(false);
    } else {
      alert('Failed to update dispute status. Please try again.');
    }
  };

  const handleUpdateResolution = async () => {
    if (!dispute) return;
    
    const result = await updateDispute(dispute.id, {
      resolution: resolution.trim()
    });
    
    if (result.success) {
      setDispute(result.data);
      setIsEditing(false);
    } else {
      alert('Failed to update resolution. Please try again.');
    }
  };

  const handleDeleteDispute = async () => {
    if (!dispute) return;
    
    const result = await deleteDispute(dispute.id);
    
    if (result.success) {
      navigate('/disputes');
    } else {
      alert('Failed to delete dispute. Please try again.');
      setConfirmDelete(false);
    }
  };

  if (loading || !dispute) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link to="/disputes" className="mr-4 text-gray-500 hover:text-primary-600">
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Dispute Details</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Dispute Information</h2>
              <div className="flex space-x-2">
                {dispute.status === 'open' && (
                  <button 
                    onClick={() => handleUpdateStatus('in_progress')}
                    className="flex items-center text-sm px-3 py-1.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-md hover:bg-yellow-200 dark:hover:bg-yellow-800"
                  >
                    <FiMessageSquare className="mr-1" />
                    Mark In Progress
                  </button>
                )}
                
                {dispute.status === 'in_progress' && (
                  <button 
                    onClick={() => handleUpdateStatus('resolved')}
                    className="flex items-center text-sm px-3 py-1.5 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-md hover:bg-green-200 dark:hover:bg-green-800"
                  >
                    <FiCheck className="mr-1" />
                    Mark Resolved
                  </button>
                )}
                
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center text-sm px-3 py-1.5 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <FiEdit2 className="mr-1" />
                  {isEditing ? 'Cancel' : 'Edit Resolution'}
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
                <p className="text-sm text-gray-500 dark:text-gray-400">Dispute ID</p>
                <p className="font-medium">{dispute.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  dispute.status === 'resolved' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : dispute.status === 'in_progress'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {dispute.status.replace('_', ' ')}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Created Date</p>
                <p className="font-medium">{format(new Date(dispute.created_at), 'MMM dd, yyyy HH:mm')}</p>
              </div>
              {dispute.resolved_at && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Resolved Date</p>
                  <p className="font-medium">{format(new Date(dispute.resolved_at), 'MMM dd, yyyy HH:mm')}</p>
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Reason</p>
              <p className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">{dispute.reason}</p>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Description</p>
              <p className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md min-h-[80px]">
                {dispute.description || 'No detailed description provided.'}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Resolution</p>
              {isEditing ? (
                <div>
                  <textarea
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    rows={4}
                    placeholder="Add resolution details..."
                  ></textarea>
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleUpdateResolution}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                    >
                      Save Resolution
                    </button>
                  </div>
                </div>
              ) : (
                <p className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md min-h-[80px]">
                  {dispute.resolution || 'No resolution added yet.'}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3 text-lg font-bold">
                  {dispute.customer?.name?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="font-medium text-lg">{dispute.customer?.name || 'Unknown'}</p>
                  <p className="text-gray-500 dark:text-gray-400">{dispute.customer?.email || 'No email'}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Customer ID</p>
                <Link to={`/customers/${dispute.customer_id}`} className="font-medium text-primary-600 hover:underline">
                  {dispute.customer_id}
                </Link>
              </div>
              
              {dispute.customer?.phone && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="font-medium">{dispute.customer.phone}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Sale Details</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sale ID</p>
                <Link to={`/sales/${dispute.sale_id}`} className="font-medium text-primary-600 hover:underline">
                  {dispute.sale_id}
                </Link>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Product/Membership</p>
                <p className="font-medium">{dispute.sale?.product?.name || dispute.sale?.membership?.name || 'Unknown'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                <p className="font-medium">${Number(dispute.sale?.amount || 0).toFixed(2)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sale Date</p>
                <p className="font-medium">{format(new Date(dispute.sale?.created_at || dispute.created_at), 'MMM dd, yyyy')}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sale Status</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  dispute.sale?.status === 'completed' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {dispute.sale?.status || 'Unknown'}
                </span>
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
            <p className="mb-6">Are you sure you want to delete this dispute? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDispute}
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
