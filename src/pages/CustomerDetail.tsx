import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiArrowLeft, FiShoppingCart, FiDownload, FiKey, FiPlus, FiEye } from 'react-icons/fi';
import { Database } from '../types/supabase';

type Customer = Database['public']['Tables']['customers']['Row'];
type Purchase = Database['public']['Tables']['purchases']['Row'] & {
  products: Database['public']['Tables']['products']['Row'];
};
type License = Database['public']['Tables']['licenses']['Row'] & {
  products: Database['public']['Tables']['products']['Row'];
};
type Download = Database['public']['Tables']['downloads']['Row'] & {
  products: Database['public']['Tables']['products']['Row'];
};

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    if (id) {
      fetchCustomerData(id);
    }
  }, [id, user]);
  
  const fetchCustomerData = async (customerId: string) => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Fetch customer
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .eq('owner_id', user.id)
        .single();
      
      if (customerError) {
        if (customerError.code === 'PGRST116') {
          // Customer not found or doesn't belong to user
          navigate('/customers');
          toast.error('Customer not found');
          return;
        }
        throw customerError;
      }
      
      setCustomer(customerData);
      
      // Fetch purchases with product info
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('purchases')
        .select('*, products(*)')
        .eq('customer_id', customerId);
      
      if (purchaseError) throw purchaseError;
      setPurchases(purchaseData as Purchase[] || []);
      
      // Fetch licenses with product info
      const { data: licenseData, error: licenseError } = await supabase
        .from('licenses')
        .select('*, products(*)')
        .eq('customer_id', customerId);
      
      if (licenseError) throw licenseError;
      setLicenses(licenseData as License[] || []);
      
      // Fetch downloads with product info
      const { data: downloadData, error: downloadError } = await supabase
        .from('downloads')
        .select('*, products(*)')
        .eq('customer_id', customerId);
      
      if (downloadError) throw downloadError;
      setDownloads(downloadData as Download[] || []);
      
    } catch (error) {
      console.error('Error fetching customer data:', error);
      toast.error('Failed to load customer data');
    } finally {
      setLoading(false);
    }
  };
  
  const deleteCustomer = async () => {
    if (!customer) return;
    
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customer.id);
      
      if (error) throw error;
      
      toast.success('Customer deleted successfully');
      navigate('/customers');
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!customer) {
    return (
      <div className="text-center py-12">
        <h2>Customer not found</h2>
        <Link to="/customers" className="btn-primary mt-4">
          <FiArrowLeft className="mr-2" />
          Back to Customers
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center">
          <Link to="/customers" className="mr-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent">
            <FiArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="mb-1">{customer.full_name || 'No name provided'}</h1>
            <p className="text-muted-foreground">{customer.email}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Link
            to={`/purchases/new?customer=${customer.id}`}
            className="btn-primary flex items-center"
          >
            <FiShoppingCart className="mr-2" />
            Record Purchase
          </Link>
          
          <Link
            to={`/customers/${customer.id}/edit`}
            className="btn-secondary flex items-center"
          >
            <FiEdit2 className="mr-2" />
            Edit
          </Link>
          
          <button
            onClick={deleteCustomer}
            className="btn-destructive flex items-center"
          >
            <FiTrash2 className="mr-2" />
            Delete
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            Overview
          </button>
          
          <button
            onClick={() => setActiveTab('purchases')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'purchases'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            Purchases ({purchases.length})
          </button>
          
          <button
            onClick={() => setActiveTab('licenses')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'licenses'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            Licenses ({licenses.length})
          </button>
          
          <button
            onClick={() => setActiveTab('downloads')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'downloads'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            Downloads ({downloads.length})
          </button>
        </nav>
      </div>
      
      {/* Tab content */}
      <div>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Customer details */}
            <div className="md:col-span-2 space-y-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Customer Details</h3>
                </div>
                <div className="card-content">
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Full Name</dt>
                      <dd className="mt-1">{customer.full_name || 'No name provided'}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                      <dd className="mt-1">{customer.email}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                      <dd className="mt-1">{new Date(customer.created_at).toLocaleDateString()}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
                      <dd className="mt-1">{new Date(customer.updated_at).toLocaleDateString()}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
            
            {/* Stats and quick actions */}
            <div className="space-y-6">
              {/* Stats */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Stats</h3>
                </div>
                <div className="card-content">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Purchases</p>
                      <p className="text-2xl font-bold">{purchases.length}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                      <p className="text-2xl font-bold">
                        ${purchases.reduce((sum, p) => sum + Number(p.amount), 0).toFixed(2)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Licenses</p>
                      <p className="text-2xl font-bold">
                        {licenses.filter(l => l.is_active).length}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Downloads</p>
                      <p className="text-2xl font-bold">{downloads.length}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick actions */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Quick Actions</h3>
                </div>
                <div className="card-content space-y-3">
                  <Link 
                    to={`/purchases/new?customer=${customer.id}`}
                    className="btn-outline w-full flex items-center justify-center"
                  >
                    <FiShoppingCart className="mr-2" />
                    Record Purchase
                  </Link>
                  
                  <Link 
                    to={`/licenses/new?customer=${customer.id}`}
                    className="btn-outline w-full flex items-center justify-center"
                  >
                    <FiKey className="mr-2" />
                    Assign License
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'purchases' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3>Purchases</h3>
              <Link 
                to={`/purchases/new?customer=${customer.id}`}
                className="btn-primary flex items-center"
              >
                <FiPlus className="mr-2" />
                Record Purchase
              </Link>
            </div>
            
            {purchases.length === 0 ? (
              <div className="card">
                <div className="p-12 text-center">
                  <FiShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No purchases found</h3>
                  <p className="mt-2 text-muted-foreground">
                    This customer hasn't made any purchases yet
                  </p>
                  <Link 
                    to={`/purchases/new?customer=${customer.id}`}
                    className="btn-primary mt-4"
                  >
                    Record Purchase
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Product</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((purchase) => (
                      <tr key={purchase.id} className="border-b border-border hover:bg-accent">
                        <td className="px-4 py-3 text-sm">
                          {new Date(purchase.purchase_date).toLocaleDateString()}
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
                            >
                              <FiEye className="h-4 w-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'licenses' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3>Licenses</h3>
              <Link 
                to={`/licenses/new?customer=${customer.id}`}
                className="btn-primary flex items-center"
              >
                <FiPlus className="mr-2" />
                Assign License
              </Link>
            </div>
            
            {licenses.length === 0 ? (
              <div className="card">
                <div className="p-12 text-center">
                  <FiKey className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No licenses found</h3>
                  <p className="mt-2 text-muted-foreground">
                    This customer doesn't have any licenses assigned
                  </p>
                  <Link 
                    to={`/licenses/new?customer=${customer.id}`}
                    className="btn-primary mt-4"
                  >
                    Assign License
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">License Key</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Product</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Activations</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Created</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {licenses.map((license) => (
                      <tr key={license.id} className="border-b border-border hover:bg-accent">
                        <td className="px-4 py-3 text-sm font-mono truncate max-w-[150px]">
                          {license.license_key}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Link to={`/products/${license.product_id}`} className="hover:underline">
                            {license.products.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`badge ${license.is_active ? 'badge-primary' : 'bg-muted text-muted-foreground'}`}>
                            {license.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {license.current_activations} / {license.max_activations}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(license.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Link 
                              to={`/licenses/${license.id}`}
                              className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent"
                            >
                              <FiEye className="h-4 w-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'downloads' && (
          <div className="space-y-4">
            <h3>Downloads</h3>
            
            {downloads.length === 0 ? (
              <div className="card">
                <div className="p-12 text-center">
                  <FiDownload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No downloads found</h3>
                  <p className="mt-2 text-muted-foreground">
                    This customer hasn't downloaded any products yet
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Product</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">IP Address</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">User Agent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {downloads.map((download) => (
                      <tr key={download.id} className="border-b border-border hover:bg-accent">
                        <td className="px-4 py-3 text-sm">
                          {new Date(download.download_date).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Link to={`/products/${download.product_id}`} className="hover:underline">
                            {download.products.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-xs">
                          {download.ip_address || 'Not recorded'}
                        </td>
                        <td className="px-4 py-3 text-sm truncate max-w-xs">
                          {download.user_agent || 'Not recorded'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetail;
