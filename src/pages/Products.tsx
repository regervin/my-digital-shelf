import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiDollarSign, FiToggleLeft, FiToggleRight, FiPackage } from 'react-icons/fi';
import { Database } from '../types/supabase';

type Product = Database['public']['Tables']['products']['Row'];

const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchProducts();
  }, [user]);
  
  const fetchProducts = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleProductStatus = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !product.is_active })
        .eq('id', product.id);
      
      if (error) {
        throw error;
      }
      
      setProducts(products.map(p => 
        p.id === product.id ? { ...p, is_active: !p.is_active } : p
      ));
      
      toast.success(`Product ${product.is_active ? 'deactivated' : 'activated'}`);
    } catch (error) {
      console.error('Error toggling product status:', error);
      toast.error('Failed to update product status');
    }
  };
  
  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setProducts(products.filter(p => p.id !== id));
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1>Products</h1>
          <p className="text-muted-foreground">Manage your digital products</p>
        </div>
        
        <Link to="/products/new" className="btn-primary flex items-center justify-center md:justify-start">
          <FiPlus className="mr-2" />
          Add New Product
        </Link>
      </div>
      
      {/* Search and filters */}
      <div className="card">
        <div className="p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
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
      
      {/* Products list */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="card">
          <div className="p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-4 text-lg font-medium">No products found</h3>
            <p className="mt-2 text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating a new product'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Link to="/products/new" className="btn-primary">
                  <FiPlus className="mr-2" />
                  Add New Product
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="card overflow-hidden">
              {/* Product thumbnail */}
              <div className="aspect-video bg-muted relative">
                {product.thumbnail_url ? (
                  <img 
                    src={product.thumbnail_url} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-accent">
                    <FiPackage className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                
                {/* Status badge */}
                <div className="absolute top-2 right-2">
                  <span className={`badge ${product.is_active ? 'badge-primary' : 'bg-muted text-muted-foreground'}`}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              {/* Product info */}
              <div className="p-4">
                <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                <p className="text-muted-foreground text-sm line-clamp-2 h-10">
                  {product.description || 'No description provided'}
                </p>
                
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-semibold flex items-center">
                    <FiDollarSign className="mr-1" />
                    {product.price.toFixed(2)}
                  </span>
                  
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => toggleProductStatus(product)}
                      className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent"
                      title={product.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {product.is_active ? <FiToggleRight className="h-5 w-5" /> : <FiToggleLeft className="h-5 w-5" />}
                    </button>
                    
                    <Link 
                      to={`/products/${product.id}`}
                      className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent"
                      title="View Details"
                    >
                      <FiEye className="h-5 w-5" />
                    </Link>
                    
                    <Link 
                      to={`/products/${product.id}/edit`}
                      className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent"
                      title="Edit"
                    >
                      <FiEdit2 className="h-5 w-5" />
                    </Link>
                    
                    <button 
                      onClick={() => deleteProduct(product.id)}
                      className="p-2 text-muted-foreground hover:text-destructive rounded-full hover:bg-accent"
                      title="Delete"
                    >
                      <FiTrash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
