import { Link } from 'react-router-dom'

export default function EmptyState({ 
  title, 
  description, 
  icon, 
  actionLabel, 
  actionLink, 
  actionOnClick,
  secondaryActionLabel,
  secondaryActionLink,
  secondaryActionOnClick
}) {
  return (
    <div className="text-center py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {icon && (
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 mb-6">
          {icon}
        </div>
      )}
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
        {description}
      </p>
      <div className="mt-6 flex justify-center gap-3">
        {actionLink ? (
          <Link to={actionLink} className="btn btn-primary">
            {actionLabel}
          </Link>
        ) : actionOnClick ? (
          <button onClick={actionOnClick} className="btn btn-primary">
            {actionLabel}
          </button>
        ) : null}
        
        {secondaryActionLink ? (
          <Link to={secondaryActionLink} className="btn btn-outline">
            {secondaryActionLabel}
          </Link>
        ) : secondaryActionOnClick ? (
          <button onClick={secondaryActionOnClick} className="btn btn-outline">
            {secondaryActionLabel}
          </button>
        ) : null}
      </div>
    </div>
  )
}
