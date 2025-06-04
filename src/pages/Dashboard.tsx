import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { FiPackage, FiUsers, FiShoppingCart, FiDownload, FiTrendingUp, FiDollarSign } from 'react-icons/fi';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ChartData } from 'chart.js';
import { format, subDays } from 'date-fns';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalPurchases: 0,
    totalDownloads: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  
  // Generate last 7 days for chart labels
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    return format(subDays(new Date(), i), 'MMM dd');
  }).reverse();
  
  // Sample data for charts
  const salesData: ChartData<'line'> = {
    labels: last7Days,
    datasets: [
      {
        label: 'Sales',
        data: [3, 5, 2, 8, 15, 12, 10],
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.5)',
        tension: 0.3,
      },
    ],
  };
  
  const revenueData: ChartData<'bar'> = {
    labels: last7Days,
    datasets: [
      {
        label: 'Revenue',
        data: [45, 75, 30, 120, 225, 180, 150],
        backgroundColor: 'rgba(14, 165, 233, 0.7)',
      },
    ],
  };
  
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        // Get product count
        const { count: productCount } = await supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('owner_id', user.id);
        
        // Get customer count
        const { count: customerCount } = await supabase
          .from('customers')
          .select('id', { count: 'exact', head: true })
          .eq('owner_id', user.id);
        
        // Get purchases count and total revenue
        const { data: purchases, count: purchaseCount } = await supabase
          .from('purchases')
          .select('amount, products!inner(owner_id)', { count: 'exact' })
          .eq('products.owner_id', user.id);
        
        const totalRevenue = purchases?.reduce((sum, purchase) => sum + Number(purchase.amount), 0) || 0;
        
        // Get download count
        const { count: downloadCount } = await supabase
          .from('downloads')
          .select('id, products!inner(owner_id)', { count: 'exact', head: true })
          .eq('products.owner_id', user.id);
        
        setStats({
          totalProducts: productCount || 0,
          totalCustomers: customerCount || 0,
          totalPurchases: purchaseCount || 0,
          totalDownloads: downloadCount || 0,
          totalRevenue,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [user]);
  
  const StatCard = ({ title, value, icon, linkTo, color }: { 
    title: string; 
    value: number | string; 
    icon: JSX.Element; 
    linkTo: string;
    color: string;
  }) => (
    <Link to={linkTo} className="card hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-full ${color} text-white mr-4`}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </div>
    </Link>
  );
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1>Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your digital product business.</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Products" 
          value={stats.totalProducts} 
          icon={<FiPackage className="h-6 w-6" />} 
          linkTo="/products"
          color="bg-blue-500"
        />
        <StatCard 
          title="Total Customers" 
          value={stats.totalCustomers} 
          icon={<FiUsers className="h-6 w-6" />} 
          linkTo="/customers"
          color="bg-green-500"
        />
        <StatCard 
          title="Total Purchases" 
          value={stats.totalPurchases} 
          icon={<FiShoppingCart className="h-6 w-6" />} 
          linkTo="/purchases"
          color="bg-purple-500"
        />
        <StatCard 
          title="Total Downloads" 
          value={stats.totalDownloads} 
          icon={<FiDownload className="h-6 w-6" />} 
          linkTo="/downloads"
          color="bg-orange-500"
        />
      </div>
      
      {/* Revenue Overview */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="card-title flex items-center">
              <FiDollarSign className="mr-2" />
              Revenue Overview
            </h3>
            <span className="badge badge-primary">
              ${stats.totalRevenue.toFixed(2)}
            </span>
          </div>
          <p className="card-description">Your total revenue from all products</p>
        </div>
        <div className="card-content">
          <div className="h-80">
            <Bar 
              data={revenueData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return '$' + value;
                      }
                    }
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>
      
      {/* Sales Trend */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title flex items-center">
            <FiTrendingUp className="mr-2" />
            Sales Trend
          </h3>
          <p className="card-description">Number of sales in the last 7 days</p>
        </div>
        <div className="card-content">
          <div className="h-80">
            <Line 
              data={salesData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/products/new" className="card hover:shadow-md transition-shadow">
          <div className="p-6 text-center">
            <FiPackage className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold">Add New Product</h3>
            <p className="text-sm text-muted-foreground">Create and sell a new digital product</p>
          </div>
        </Link>
        
        <Link to="/customers/new" className="card hover:shadow-md transition-shadow">
          <div className="p-6 text-center">
            <FiUsers className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold">Add New Customer</h3>
            <p className="text-sm text-muted-foreground">Manually add a new customer</p>
          </div>
        </Link>
        
        <Link to="/purchases/new" className="card hover:shadow-md transition-shadow">
          <div className="p-6 text-center">
            <FiShoppingCart className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold">Record Purchase</h3>
            <p className="text-sm text-muted-foreground">Manually record a new purchase</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
