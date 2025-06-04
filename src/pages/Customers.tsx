import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiShoppingCart } from 'react-icons/fi';
import { Database } from '../types/supabase';

type Customer = Database['public']['Tables']['customers']['Row'];

const Customers = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchCustomers();
  }, [user]);
  
  const fetchCustomers = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };
  
  const deleteCustomer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setCustomers(customers.filter(c => c.id !== id));
      toast.success('Customer deleted successfully');
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer');
    }
  };
  
  const filteredCustomers = customers.filter(customer => 
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.full_name && customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1>Customers</h1>
          <p className="text-muted-foreground">Manage your customer database</p>
        </div>
        
        <Link to="/customers/new" className="btn-primary flex items-center justify-center md:justify-start">
          <FiPlus className="mr-2" />
          Add New Customer
        </Link>
      </div>
      
      {/* Search and filters */}
      <div className="card">
        <div className="p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search customers..."
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
      
      {/* Customers list */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="card">
          <div className="p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium">No customers found</h3>
            <p className="mt-2 text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding a new customer'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Link to="/customers/new" className="btn-primary">
                  <FiPlus className="mr-2" />
                  Add New Customer
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
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Created</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="border-b border-border hover:bg-accent">
                  <td className="px-4 py-3 text-sm font-medium">
                    {customer.full_name || 'No name provided'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {customer.email}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link 
                        to={`/customers/${customer.id}`}
                        className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent"
                        title="View Details"
                      >
                        <FiEye className="h-4 w-4" />
                      </Link>
                      
                      <Link 
                        to={`/purchases/new?customer=${customer.id}`}
                        className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent"
                        title="Record Purchase"
                      >
                        <FiShoppingCart className="h-4 w-4" />
                      </Link>
                      
                      <Link 
                        to={`/customers/${customer.id}/edit`}
                        className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent"
                        title="Edit"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </Link>
                      
                      <button 
                        onClick={() => deleteCustomer(customer.id)}
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

export default Customers;
