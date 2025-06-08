import React, { useState, useEffect } from 'react';
import { useAccessRecords } from '../hooks/useAccessRecords';
import AccessRecordsList from '../components/AccessRecordsList';
import AccessStatsCard from '../components/AccessStatsCard';
import RecordAccessForm from '../components/RecordAccessForm';

const AccessRecordsPage = () => {
  const { accessRecords, loading, error, getAccessStats } = useAccessRecords();
  const [statsPeriod, setStatsPeriod] = useState('week');
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  
  useEffect(() => {
    fetchStats();
  }, [statsPeriod]);
  
  const fetchStats = async () => {
    setStatsLoading(true);
    setStatsError(null);
    
    try {
      const result = await getAccessStats(statsPeriod);
      
      if (result.success) {
        setStats(result.data);
      } else {
        setStatsError(result.error);
      }
    } catch (err) {
      setStatsError(err);
    } finally {
      setStatsLoading(false);
    }
  };
  
  const handleAccessRecorded = () => {
    // Refresh stats after recording a new access
    fetchStats();
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Access Records</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="space-y-6">
            <AccessStatsCard 
              stats={stats} 
              loading={statsLoading} 
              error={statsError} 
              period={statsPeriod}
              setPeriod={setStatsPeriod}
            />
            
            <AccessRecordsList 
              accessRecords={accessRecords} 
              loading={loading} 
              error={error} 
            />
          </div>
        </div>
        
        <div>
          <RecordAccessForm onSuccess={handleAccessRecorded} />
        </div>
      </div>
    </div>
  );
};

export default AccessRecordsPage;
