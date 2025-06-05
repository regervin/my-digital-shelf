import { useState, useEffect } from 'react';
import { getUserCount } from '../utils/getUserCount';

function UserCount() {
  const [userCount, setUserCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUserCount() {
      try {
        setLoading(true);
        const { count, error } = await getUserCount();
        
        if (error) {
          setError(error.message || 'Failed to fetch user count');
        } else {
          setUserCount(count);
        }
      } catch (err) {
        setError('Unexpected error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchUserCount();
  }, []);

  if (loading) return <div>Loading user count...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">User Statistics</h2>
      <p className="text-lg">Total users: {userCount}</p>
    </div>
  );
}

export default UserCount;
