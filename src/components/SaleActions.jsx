import { useState } from 'react';
import { FiEye, FiMoreVertical } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import SaleRefundButton from './SaleRefundButton';
import CreateDisputeButton from './CreateDisputeButton';

export default function SaleActions({ sale }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative">
      <div className="flex space-x-2">
        <Link to={`/sales/${sale.id}`} className="text-gray-500 hover:text-primary-600">
          <FiEye />
        </Link>
        
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="text-gray-500 hover:text-primary-600"
        >
          <FiMoreVertical />
        </button>
      </div>
      
      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
          <div className="py-1">
            <SaleRefundButton sale={sale} />
            
            <CreateDisputeButton 
              sale={sale} 
              customer={sale.customer} 
            />
            
            <Link 
              to={`/customers/${sale.customer?.id}`}
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              View Customer
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
