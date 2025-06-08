import { Link } from 'react-router-dom'

export default function PageHeader({ title, description, actions }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
      
      {actions && (
        <div className="flex flex-wrap gap-2">
          {actions.map((action, index) => (
            action.to ? (
              <Link
                key={index}
                to={action.to}
                className={`btn ${action.variant ? `btn-${action.variant}` : 'btn-primary'}`}
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </Link>
            ) : (
              <button
                key={index}
                onClick={action.onClick}
                className={`btn ${action.variant ? `btn-${action.variant}` : 'btn-primary'}`}
                disabled={action.disabled}
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </button>
            )
          ))}
        </div>
      )}
    </div>
  )
}
