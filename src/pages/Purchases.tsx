import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { FiPlus, FiEye, FiTrash2 } from 'react-icons/fi';
import { Database } from '../types/supabase';

type Purchase = Database['public']['Tables']['purchases']['Row'] & {
  products: Database['public']['Tables']['products']['Row'];
  customers: Database['public']['Tables']['customers']['Row'];
};

const Purchases = () => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchPurchases();
  }, [user]);
  
  const fetchPurchases = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          products!inner(*, owner_id),
          customers(*)
        `)
        .eq('products.owner_id', user.id)
        .order('purchase_date', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setPurchases(data as Purchase[] || []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      toast.error('Failed to load purchases');
    } finally {
      setLoading(false);
    }
  };
  
  const deletePurchase = async (id: string) => {
    if (!confirm('Are you sure you want to delete this purchase record? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('purchases')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setPurchases(purchases.filter(p => p.id !== id));
      toast.success('Purchase record deleted successfully');
    } catch (error) {
      console.error('Error deleting purchase:', error);
      toast.error('Failed to delete purchase record');
    }
  };
  
  const filteredPurchases = purchases.filter(purchase => 
    (purchase.products.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (purchase.customers?.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (purchase.customers?.full_name && purchase.customers.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Calculate total revenue
  const totalRevenue = purchases.reduce((sum, purchase) => sum + Number(purchase.amount), 0);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1>Purchases</h1>
          <p className="text-muted-foreground">Track and manage product purchases</p>
        </div>
        
        <Link to="/purchases/new" className="btn-primary flex items-center justify-center md:justify-start">
          <FiPlus className="mr-2" />
          Record Purchase
        </Link>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Total Purchases</p>
            <p className="text-2xl font-bold">{purchases.length}</p>
          </div>
        </div>
        
        <div className="card">
          <div className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="card">
          <div className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Average Purchase</p>
            <p className="text-2xl font-bold">
              ${purchases.length > 0 ? (totalRevenue / purchases.length).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="card">
        <div className="p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search purchases..."
              className="form-input w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Purchases list */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredPurchases.length === 0 ? (
        <div className="card">
          <div className="p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium">No purchases found</h3>
            <p className="mt-2 text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by recording a new purchase'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Link to="/purchases/new" className="btn-primary">
                  <FiPlus className="mr-2" />
                  Record Purchase
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Product</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.map((purchase) => (
                <tr key={purchase.id} className="border-b border-border hover:bg-accent">
                  <td className="px-4 py-3 text-sm">
                    {new Date(purchase.purchase_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Link to={`/customers/${purchase.customer_id}`} className="hover:underline">
                      {purchase.customers?.email || 'Unknown'}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Link to={`/products/${purchase.product_id}`} className="hover:underline">
                      {purchase.products.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    ${Number(purchase.amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`badge ${
                      purchase.payment_status === 'completed' 
                        ? 'badge-primary' 
                        : purchase.payment_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          : 'bg-red-100 text-red-800 border-red-200'
                    }`}>
                      {purchase.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link 
                        to={`/purchases/${purchase.id}`}
                        className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent"
                        title="View Details"
                      >
                        <FiEye className="h-4 w-4" />
                      </Link>
                      
                      <button 
                        onClick={() => deletePurchase(purchase.id)}
                        className="p-2 text-muted-foreground hover:text-destructive rounded-full hover:bg-accent"
                        title="Delete"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Purchases;
