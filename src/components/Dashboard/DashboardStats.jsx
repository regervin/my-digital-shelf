import React from 'react';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { formatCurrency, formatDate } from '../../utils/formatters';

// Icons
import { 
  ShoppingBag, 
  Users, 
  CreditCard, 
  TrendingUp,
  Loader
} from 'lucide-react';

export default function DashboardStats() {
  const { stats, loading, error } = useDashboardStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p>Error loading dashboard data. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Products" 
          value={stats.totalProducts} 
          icon={<ShoppingBag className="w-5 h-5" />}
          color="bg-blue-500"
        />
        <StatCard 
          title="Total Customers" 
          value={stats.totalCustomers} 
          icon={<Users className="w-5 h-5" />}
          color="bg-green-500"
        />
        <StatCard 
          title="Active Memberships" 
          value={stats.totalMemberships} 
          icon={<CreditCard className="w-5 h-5" />}
          color="bg-purple-500"
        />
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(stats.revenue.total)} 
          icon={<TrendingUp className="w-5 h-5" />}
          color="bg-indigo-500"
        />
      </div>

      {/* Revenue Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Revenue</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <RevenueCard title="Today" value={stats.revenue.today} />
          <RevenueCard title="This Week" value={stats.revenue.thisWeek} />
          <RevenueCard title="This Month" value={stats.revenue.thisMonth} />
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium">Recent Sales</h3>
        </div>
        <div className="divide-y">
          {stats.recentSales.length > 0 ? (
            stats.recentSales.map((sale) => (
              <div key={sale.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{sale.customer?.name || 'Unknown Customer'}</p>
                  <p className="text-sm text-gray-500">{sale.customer?.email}</p>
                  <p className="text-xs text-gray-400">{formatDate(sale.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(sale.amount)}</p>
                  <p className="text-sm text-gray-500">{sale.product?.name}</p>
                  <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    {sale.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              <p>No recent sales found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`${color} rounded-full p-3 text-white mr-4`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function RevenueCard({ title, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-bold">{formatCurrency(value)}</p>
    </div>
  );
}
