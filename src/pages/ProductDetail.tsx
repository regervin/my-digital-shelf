import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiDownload, FiKey, FiShoppingCart, FiArrowLeft, FiToggleLeft, FiToggleRight, FiPlus, FiEye } from 'react-icons/fi';
import { Database } from '../types/supabase';

type Product = Database['public']['Tables']['products']['Row'];
type License = Database['public']['Tables']['licenses']['Row'];
type Purchase = Database['public']['Tables']['purchases']['Row'] & {
  customers: Database['public']['Tables']['customers']['Row'];
};
type Download = Database['public']['Tables']['downloads']['Row'] & {
  customers: Database['public']['Tables']['customers']['Row'];
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    if (id) {
      fetchProductData(id);
    }
  }, [id, user]);
  
  const fetchProductData = async (productId: string) => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Fetch product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('owner_id', user.id)
        .single();
      
      if (productError) {
        if (productError.code === 'PGRST116') {
          // Product not found or doesn't belong to user
          navigate('/products');
          toast.error('Product not found');
          return;
        }
        throw productError;
      }
      
      setProduct(productData);
      
      // Fetch licenses
      const { data: licenseData, error: licenseError } = await supabase
        .from('licenses')
        .select('*')
        .eq('product_id', productId);
      
      if (licenseError) throw licenseError;
      setLicenses(licenseData || []);
      
      // Fetch purchases with customer info
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('purchases')
        .select('*, customers(*)')
        .eq('product_id', productId);
      
      if (purchaseError) throw purchaseError;
      setPurchases(purchaseData as Purchase[] || []);
      
      // Fetch downloads with customer info
      const { data: downloadData, error: downloadError } = await supabase
        .from('downloads')
        .select('*, customers(*)')
        .eq('product_id', productId);
      
      if (downloadError) throw downloadError;
      setDownloads(downloadData as Download[] || []);
      
    } catch (error) {
      console.error('Error fetching product data:', error);
      toast.error('Failed to load product data');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleProductStatus = async () => {
    if (!product) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !product.is_active })
        .eq('id', product.id);
      
      if (error) throw error;
      
      setProduct({ ...product, is_active: !product.is_active });
      toast.success(`Product ${product.is_active ? 'deactivated' : 'activated'}`);
    } catch (error) {
      console.error('Error toggling product status:', error);
      toast.error('Failed to update product status');
    }
  };
  
  const deleteProduct = async () => {
    if (!product) return;
    
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);
      
      if (error) throw error;
      
      toast.success('Product deleted successfully');
      navigate('/products');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="text-center py-12">
        <h2>Product not found</h2>
        <Link to="/products" className="btn-primary mt-4">
          <FiArrowLeft className="mr-2" />
          Back to Products
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center">
          <Link to="/products" className="mr-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent">
            <FiArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="mb-1">{product.name}</h1>
            <div className="flex items-center">
              <span className={`badge ${product.is_active ? 'badge-primary' : 'bg-muted text-muted-foreground'} mr-2`}>
                {product.is_active ? 'Active' : 'Inactive'}
              </span>
              <span className="text-sm text-muted-foreground">
                Created on {new Date(product.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={toggleProductStatus}
            className="btn-outline flex items-center"
          >
            {product.is_active ? (
              <>
                <FiToggleRight className="mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <FiToggleLeft className="mr-2" />
                Activate
              </>
            )}
          </button>
          
          <Link
            to={`/products/${product.id}/edit`}
            className="btn-secondary flex items-center"
          >
            <FiEdit2 className="mr-2" />
            Edit
          </Link>
          
          <button
            onClick={deleteProduct}
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
            {/* Product details */}
            <div className="md:col-span-2 space-y-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Product Details</h3>
                </div>
                <div className="card-content">
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                      <dd className="mt-1">{product.name}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Price</dt>
                      <dd className="mt-1">${product.price.toFixed(2)}</dd>
                    </div>
                    
                    <div className="md:col-span-2">
                      <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                      <dd className="mt-1">{product.description || 'No description provided'}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Requires License</dt>
                      <dd className="mt-1">{product.requires_license ? 'Yes' : 'No'}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                      <dd className="mt-1">{product.is_active ? 'Active' : 'Inactive'}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                      <dd className="mt-1">{new Date(product.created_at).toLocaleDateString()}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
                      <dd className="mt-1">{new Date(product.updated_at).toLocaleDateString()}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              {/* Product file */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Product File</h3>
                </div>
                <div className="card-content">
                  {product.file_url ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">File is available</p>
                        <p className="text-sm text-muted-foreground truncate max-w-md">
                          {product.file_url.split('/').pop()}
                        </p>
                      </div>
                      <a 
                        href={product.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-outline flex items-center"
                      >
                        <FiDownload className="mr-2" />
                        Download
                      </a>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <FiDownload className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="mt-2 font-medium">No file uploaded</p>
                      <p className="text-sm text-muted-foreground">
                        Upload a file to make this product available for delivery
                      </p>
                      <Link 
                        to={`/products/${product.id}/edit`}
                        className="btn-primary mt-4"
                      >
                        Upload File
                      </Link>
                    </div>
                  )}
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
                      <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold">
                        ${purchases.reduce((sum, p) => sum + Number(p.amount), 0).toFixed(2)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Downloads</p>
                      <p className="text-2xl font-bold">{downloads.length}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Licenses</p>
                      <p className="text-2xl font-bold">
                        {licenses.filter(l => l.is_active).length}
                      </p>
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
                    to={`/licenses/new?product=${product.id}`}
                    className="btn-outline w-full flex items-center justify-center"
                  >
                    <FiKey className="mr-2" />
                    Generate License
                  </Link>
                  
                  <Link 
                    to={`/purchases/new?product=${product.id}`}
                    className="btn-outline w-full flex items-center justify-center"
                  >
                    <FiShoppingCart className="mr-2" />
                    Record Purchase
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'licenses' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3>Licenses</h3>
              <Link 
                to={`/licenses/new?product=${product.id}`}
                className="btn-primary flex items-center"
              >
                <FiPlus className="mr-2" />
                Generate License
              </Link>
            </div>
            
            {licenses.length === 0 ? (
              <div className="card">
                <div className="p-12 text-center">
                  <FiKey className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No licenses found</h3>
                  <p className="mt-2 text-muted-foreground">
                    Generate licenses to control access to your product
                  </p>
                  <Link 
                    to={`/licenses/new?product=${product.id}`}
                    className="btn-primary mt-4"
                  >
                    Generate License
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">License Key</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Activations</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Customer</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Created</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {licenses.map((license) => (
                      <tr key={license.id} className="border-b border-border hover:bg-accent">
                        <td className="px-4 py-3 text-sm font-mono">{license.license_key}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`badge ${license.is_active ? 'badge-primary' : 'bg-muted text-muted-foreground'}`}>
                            {license.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {license.current_activations} / {license.max_activations}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {license.customer_id ? (
                            <Link to={`/customers/${license.customer_id}`} className="hover:underline">
                              View Customer
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
                            <Link 
                              to={`/licenses/${license.id}`}
                              className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent"
                            >
                              <FiEye className="h-4 w-4" />
                            </Link>
                            <Link 
                              to={`/licenses/${license.id}/edit`}
                              className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent"
                            >
                              <FiEdit2 className="h-4 w-4" />
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
        
        {activeTab === 'purchases' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3>Purchases</h3>
              <Link 
                to={`/purchases/new?product=${product.id}`}
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
                    Record purchases to track sales of this product
                  </p>
                  <Link 
                    to={`/purchases/new?product=${product.id}`}
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
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Customer</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">License</th>
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
                          <Link to={`/customers/${purchase.customer_id}`} className="hover:underline">
                            {purchase.customers?.email || 'Unknown'}
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
                        <td className="px-4 py-3 text-sm">
                          {purchase.license_id ? (
                            <Link to={`/licenses/${purchase.license_id}`} className="hover:underline">
                              View License
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">No license</span>
                          )}
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
        
        {activeTab === 'downloads' && (
          <div className="space-y-4">
            <h3>Downloads</h3>
            
            {downloads.length === 0 ? (
              <div className="card">
                <div className="p-12 text-center">
                  <FiDownload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No downloads found</h3>
                  <p className="mt-2 text-muted-foreground">
                    Downloads will be recorded when customers access your product
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Customer</th>
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
                          <Link to={`/customers/${download.customer_id}`} className="hover:underline">
                            {download.customers?.email || 'Unknown'}
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

export default ProductDetail;
