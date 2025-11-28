const Table = ({ columns, data, onEdit, onDelete, canEdit = true, canDelete = true, actions = [] }) => {
  const hasActions = (canEdit || canDelete) || actions.length > 0;
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
            {hasActions && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
              {hasActions && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {actions.length > 0 ? (
                    <div className="flex gap-2">
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
                            className={`px-2 py-1 rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                              variant === 'danger' 
                                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                : variant === 'success'
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                          >
                            {icon && <span className="mr-1">{icon}</span>}
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <>
                      {canEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      )}
                    </>
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