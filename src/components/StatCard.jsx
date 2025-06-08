import { FiArrowUp, FiArrowDown } from 'react-icons/fi'

export default function StatCard({ title, value, change, icon, loading = false }) {
  // Determine if change is positive, negative, or neutral
  const isPositive = change > 0
  const isNegative = change < 0
  
  return (
    <div className="stat-card">
      {loading ? (
        <>
          <div className="skeleton h-4 w-24 mb-4"></div>
          <div className="skeleton h-8 w-32 mb-2"></div>
          <div className="skeleton h-4 w-16"></div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h3 className="stat-label">{title}</h3>
            {icon && <div className="text-gray-400 dark:text-gray-500">{icon}</div>}
          </div>
          <div className="stat-value">{value}</div>
          {change !== undefined && (
            <div className={`stat-change ${isPositive ? 'stat-change-positive' : ''} ${isNegative ? 'stat-change-negative' : ''}`}>
              <span className="flex items-center">
                {isPositive && <FiArrowUp className="mr-1" />}
                {isNegative && <FiArrowDown className="mr-1" />}
                {isPositive ? '+' : ''}{change}%
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
