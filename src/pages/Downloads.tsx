import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { FiDownload } from 'react-icons/fi';
import { Database } from '../types/supabase';

type Download = Database['public']['Tables']['downloads']['Row'] & {
  products: Database['public']['Tables']['products']['Row'];
  customers: Database['public']['Tables']['customers']['Row'];
};

const Downloads = () => {
  const { user } = useAuth();
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchDownloads();
  }, [user]);
  
  const fetchDownloads = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('downloads')
        .select(`
          *,
          products!inner(*, owner_id),
          customers(*)
        `)
        .eq('products.owner_id', user.id)
        .order('download_date', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setDownloads(data as Download[] || []);
    } catch (error) {
      console.error('Error fetching downloads:', error);
      toast.error('Failed to load downloads');
    } finally {
      setLoading(false);
    }
  };
  
  const filteredDownloads = downloads.filter(download => 
    (download.products.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (download.customers?.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (download.customers?.full_name && download.customers.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (download.ip_address && download.ip_address.includes(searchTerm))
  );
  
  // Group downloads by product for stats
  const productDownloads = downloads.reduce((acc, download) => {
    const productId = download.product_id;
    if (!acc[productId]) {
      acc[productId] = {
        product: download.products,
        count: 0
      };
    }
    acc[productId].count++;
    return acc;
  }, {} as Record<string, { product: Download['products'], count: number }>);
  
  // Get top products by download count
  const topProducts = Object.values(productDownloads)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  return (
    <div className="space-y-6">
      <div>
        <h1>Downloads</h1>
        <p className="text-muted-foreground">Track product downloads by your customers</p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Download Stats</h3>
          </div>
          <div className="card-content">
            <div className="text-center py-4">
              <p className="text-4xl font-bold">{downloads.length}</p>
              <p className="text-muted-foreground">Total Downloads</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Top Products</h3>
          </div>
          <div className="card-content">
            {topProducts.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No download data available</p>
            ) : (
              <ul className="divide-y divide-border">
                {topProducts.map(({ product, count }) => (
                  <li key={product.id} className="py-2 flex justify-between items-center">
                    <Link to={`/products/${product.id}`} className="hover:underline">
                      {product.name}
                    </Link>
                    <span className="badge badge-primary">{count} downloads</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="card">
        <div className="p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search downloads..."
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
      
      {/* Downloads list */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredDownloads.length === 0 ? (
        <div className="card">
          <div className="p-12 text-center">
            <FiDownload className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No downloads found</h3>
            <p className="mt-2 text-muted-foreground">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Downloads will be recorded when customers access your products'}
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date & Time</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Product</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">IP Address</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">User Agent</th>
              </tr>
            </thead>
            <tbody>
              {filteredDownloads.map((download) => (
                <tr key={download.id} className="border-b border-border hover:bg-accent">
                  <td className="px-4 py-3 text-sm">
                    {new Date(download.download_date).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Link to={`/customers/${download.customer_id}`} className="hover:underline">
                      {download.customers?.email || 'Unknown'}
                    </Link>
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
  );
};

export default Downloads;
