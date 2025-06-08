import React, { useState } from 'react';
import { useCustomerPaymentMethods } from '../../hooks/useCustomerPaymentMethods';
import { CreditCard, Trash2, Edit, CheckCircle, AlertCircle, Plus, Loader } from 'lucide-react';
import PaymentMethodForm from './PaymentMethodForm';

export default function PaymentMethodsList({ customerId }) {
  const { 
    paymentMethods, 
    loading, 
    error, 
    setDefaultPaymentMethod, 
    deletePaymentMethod 
  } = useCustomerPaymentMethods(customerId);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [actionStatus, setActionStatus] = useState({ type: '', message: '' });
  const [processingId, setProcessingId] = useState(null);
  
  const handleSetDefault = async (id) => {
    setProcessingId(id);
    setActionStatus({ type: '', message: '' });
    
    const result = await setDefaultPaymentMethod(id);
    
    if (result.success) {
      setActionStatus({ 
        type: 'success', 
        message: 'Default payment method updated successfully' 
      });
    } else {
      setActionStatus({ 
        type: 'error', 
        message: `Error: ${result.error.message || 'Failed to update default payment method'}` 
      });
    }
    
    setProcessingId(null);
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) {
      return;
    }
    
    setProcessingId(id);
    setActionStatus({ type: '', message: '' });
    
    const result = await deletePaymentMethod(id);
    
    if (result.success) {
      setActionStatus({ 
        type: 'success', 
        message: 'Payment method deleted successfully' 
      });
    } else {
      setActionStatus({ 
        type: 'error', 
        message: `Error: ${result.error.message || 'Failed to delete payment method'}` 
      });
    }
    
    setProcessingId(null);
  };
  
  const handleFormSuccess = () => {
    setShowAddForm(false);
    setEditingMethod(null);
    setActionStatus({ 
      type: 'success', 
      message: 'Payment method saved successfully' 
    });
  };
  
  const getCardIcon = (brand) => {
    // In a real app, you might use actual card brand icons
    return <CreditCard className="h-5 w-5" />;
  };
  
  const formatExpiryDate = (month, year) => {
    if (!month || !year) return 'N/A';
    return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
  };
  
  const getPaymentTypeLabel = (type) => {
    const types = {
      credit_card: 'Credit Card',
      debit_card: 'Debit Card',
      paypal: 'PayPal',
      bank_transfer: 'Bank Transfer',
      crypto: 'Cryptocurrency',
      other: 'Other'
    };
    
    return types[type] || type;
  };
  
  if (loading && paymentMethods.length === 0) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p>Error loading payment methods. Please try again.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Payment Methods</h3>
        
        {!showAddForm && !editingMethod && (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Method
          </button>
        )}
      </div>
      
      {/* Status Messages */}
      {actionStatus.message && (
        <div className={`px-6 py-3 ${
          actionStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          <div className="flex items-center">
            {actionStatus.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            {actionStatus.message}
          </div>
        </div>
      )}
      
      {/* Add/Edit Form */}
      {(showAddForm || editingMethod) && (
        <div className="p-6 border-b border-gray-200">
          <PaymentMethodForm
            customerId={customerId}
            existingMethod={editingMethod}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowAddForm(false);
              setEditingMethod(null);
            }}
          />
        </div>
      )}
      
      {/* Payment Methods List */}
      {!showAddForm && !editingMethod && (
        <>
          {paymentMethods.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="mb-2">No payment methods added yet</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 hover:text-blue-800 focus:outline-none"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add your first payment method
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {paymentMethods.map((method) => (
                <li key={method.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                        method.is_default ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        {getCardIcon(method.card_brand)}
                      </div>
                      
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">
                            {getPaymentTypeLabel(method.payment_type)}
                            {method.is_default && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Default
                              </span>
                            )}
                          </p>
                        </div>
                        
                        {(method.payment_type === 'credit_card' || method.payment_type === 'debit_card') && (
                          <div className="flex items-center text-sm text-gray-500">
                            <span className="capitalize">{method.card_brand}</span>
                            {method.last_four && (
                              <span className="ml-1">•••• {method.last_four}</span>
                            )}
                            {(method.expiry_month && method.expiry_year) && (
                              <span className="ml-2">
                                Exp: {formatExpiryDate(method.expiry_month, method.expiry_year)}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {method.cardholder_name && (
                          <p className="text-sm text-gray-500">
                            {method.cardholder_name}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!method.is_default && (
                        <button
                          onClick={() => handleSetDefault(method.id)}
                          disabled={processingId === method.id}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          {processingId === method.id ? (
                            <Loader className="h-4 w-4 animate-spin" />
                          ) : (
                            'Set Default'
                          )}
                        </button>
                      )}
                      
                      <button
                        onClick={() => setEditingMethod(method)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(method.id)}
                        disabled={processingId === method.id}
                        className="text-red-400 hover:text-red-500"
                      >
                        {processingId === method.id ? (
                          <Loader className="h-5 w-5 animate-spin" />
                        ) : (
                          <Trash2 className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
