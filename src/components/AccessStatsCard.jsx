import React from 'react';

const AccessStatsCard = ({ stats, loading, error, period, setPeriod }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Access Statistics</h3>
        <div className="text-red-500">Error loading statistics: {error.message}</div>
      </div>
    );
  }
  
  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Access Statistics</h3>
        <div className="text-gray-500">No statistics available.</div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Access Statistics</h3>
        <div className="flex space-x-2">
          <button 
            className={`px-3 py-1 rounded text-sm ${period === 'today' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setPeriod('today')}
          >
            Today
          </button>
          <button 
            className={`px-3 py-1 rounded text-sm ${period === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setPeriod('week')}
          >
            Week
          </button>
          <button 
            className={`px-3 py-1 rounded text-sm ${period === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setPeriod('month')}
          >
            Month
          </button>
          <button 
            className={`px-3 py-1 rounded text-sm ${period === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setPeriod('all')}
          >
            All Time
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-blue-500 text-sm font-medium uppercase">Total Accesses</div>
            <div className="mt-2 text-3xl font-bold text-blue-700">{stats.totalAccesses}</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-green-500 text-sm font-medium uppercase">Product Downloads</div>
            <div className="mt-2 text-3xl font-bold text-green-700">{stats.productDownloads}</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-purple-500 text-sm font-medium uppercase">Membership Accesses</div>
            <div className="mt-2 text-3xl font-bold text-purple-700">{stats.membershipAccesses}</div>
          </div>
        </div>
        
        {Object.keys(stats.dailyAccesses).length > 0 && (
          <div className="mt-8">
            <h4 className="text-md font-medium text-gray-700 mb-4">Daily Breakdown</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Products
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Memberships
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(stats.dailyAccesses)
                    .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
                    .map(([date, data]) => (
                      <tr key={date}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {data.total}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {data.productDownloads}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {data.membershipAccesses}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessStatsCard;
