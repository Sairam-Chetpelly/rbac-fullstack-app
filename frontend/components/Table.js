const Table = ({ columns, data, onEdit, onDelete, canEdit = true, canDelete = true, actions = [] }) => {
  const hasActions = (canEdit || canDelete) || actions.length > 0;
  
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
      <table className="min-w-full">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
            {hasActions && (
              <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white">
          {data.map((row, index) => (
            <tr key={index} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
              {columns.map((column) => (
                <td key={column.key} className="px-4 sm:px-6 py-4 text-sm text-gray-900">
                  <div className="break-words">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </div>
                </td>
              ))}
              {hasActions && (
                <td className="px-4 sm:px-6 py-4 text-sm font-medium">
                  {actions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {actions.map((action, actionIndex) => {
                        const label = typeof action.label === 'function' ? action.label(row) : action.label;
                        const icon = typeof action.icon === 'function' ? action.icon(row) : action.icon;
                        const variant = typeof action.variant === 'function' ? action.variant(row) : action.variant;
                        const disabled = typeof action.disabled === 'function' ? action.disabled(row) : action.disabled;
                        
                        return (
                          <button
                            key={actionIndex}
                            onClick={() => action.onClick(row)}
                            disabled={disabled}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                              variant === 'danger' 
                                ? 'bg-red-100 text-red-700 border border-red-200' 
                                : variant === 'success'
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : 'bg-blue-100 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {icon && <span className="mr-1">{icon}</span>}
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {canEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="px-3 py-1.5 bg-orange-100 text-orange-700 border border-orange-200 rounded-lg text-xs font-medium transition-colors"
                        >
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="px-3 py-1.5 bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-medium transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;