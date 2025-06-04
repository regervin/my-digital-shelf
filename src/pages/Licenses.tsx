import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiToggleLeft, FiToggleRight, FiCopy } from 'react-icons/fi';
import { Database } from '../types/supabase';

type License = Database['public']['Tables']['licenses']['Row'] & {
  products: Database['public']['Tables']['products']['Row'];
  customers?: Database['public']['Tables']['customers']['Row'] | null;
};

const Licenses = () => {
  const { user } = useAuth();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchLicenses();
  }, [user]);
  
  const fetchLicenses = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('licenses')
        .select(`
          *,
          products!inner(*, owner_id),
          customers(*)
        `)
        .eq('products.owner_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setLicenses(data as License[] || []);
    } catch (error) {
      console.error('Error fetching licenses:', error);
      toast.error('Failed to load licenses');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleLicenseStatus = async (license: License) => {
    try {
      const { error } = await supabase
        .from('licenses')
        .update({ is_active: !license.is_active })
        .eq('id', license.id);
      
      if (error) {
        throw error;
      }
      
      setLicenses(licenses.map(l => 
        l.id === license.id ? { ...l, is_active: !l.is_active } : l
      ));
      
      toast.success(`License ${license.is_active ? 'deactivated' : 'activated'}`);
    } catch (error) {
      console.error('Error toggling license status:', error);
      toast.error('Failed to update license status');
    }
  };
  
  const deleteLicense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this license? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('licenses')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setLicenses(licenses.filter(l => l.id !== id));
      toast.success('License deleted successfully');
    } catch (error) {
      console.error('Error deleting license:', error);
      toast.error('Failed to delete license');
    }
  };
  
  const copyLicenseKey = (key: string) => {
    navigator.clipboard.writeText(key)
      .then(() => toast.success('License key copied to clipboard'))
      .catch(() => toast.error('Failed to copy license key'));
  };
  
  const filteredLicenses = licenses.filter(license => 
    license.license_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    license.products.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (license.customers?.email && license.customers.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1>Licenses</h1>
          <p className="text-muted-foreground">Manage license keys for your products</p>
        </div>
        
        <Link to="/licenses/new" className="btn-primary flex items-center justify-center md:justify-start">
          <FiPlus className="mr-2" />
          Generate License
        </Link>
      </div>
      
      {/* Search and filters */}
      <div className="card">
        <div className="p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search licenses..."
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
      
      {/* Licenses list */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredLicenses.length === 0 ? (
        <div className="card">
          <div className="p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium">No licenses found</h3>
            <p className="mt-2 text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by generating a new license'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Link to="/licenses/new" className="btn-primary">
                  <FiPlus className="mr-2" />
                  Generate License
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
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">License Key</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Product</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Activations</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Created</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLicenses.map((license) => (
                <tr key={license.id} className="border-b border-border hover:bg-accent">
                  <td className="px-4 py-3 text-sm font-mono">
                    <div className="flex items-center">
                      <span className="truncate max-w-[150px]">{license.license_key}</span>
                      <button 
                        onClick={() => copyLicenseKey(license.license_key)}
                        className="ml-2 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent"
                        title="Copy license key"
                      >
                        <FiCopy className="h-4 w-4" />
                      </button>
                    </div>
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
                    {license.customer_id && license.customers ? (
                      <Link to={`/customers/${license.customer_id}`} className="hover:underline">
                        {license.customers.email}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">Not assigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(license.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => toggleLicenseStatus(license)}
                        className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent"
                        title={license.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {license.is_active ? <FiToggleRight className="h-4 w-4" /> : <FiToggleLeft className="h-4 w-4" />}
                      </button>
                      
                      <Link 
                        to={`/licenses/${license.id}`}
                        className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent"
                        title="View Details"
                      >
                        <FiEye className="h-4 w-4" />
                      </Link>
                      
                      <Link 
                        to={`/licenses/${license.id}/edit`}
                        className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent"
                        title="Edit"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </Link>
                      
                      <button 
                        onClick={() => deleteLicense(license.id)}
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

export default Licenses;
