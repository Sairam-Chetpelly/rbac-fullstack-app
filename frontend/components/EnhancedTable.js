import { useState, useEffect } from 'react';
import Button from './Button';

export default function EnhancedTable({ 
  data = [], 
  columns = [], 
  loading = false,
  title,
  searchPlaceholder = "Search...",
  onView,
  onEdit,
  onDelete,
  onAdd,
  addButtonText = "Add New",
  emptyMessage = "No data found",
  emptyIcon = "📋",
  itemsPerPage = 10,
  showStats = false,
  stats = {},
  filters = [],
  activeFilters = {},
  serverSidePagination = false,
  totalItems = 0,
  currentPage: externalCurrentPage = 1,
  onPageChange,
  onFilterChange,
  onClearFilters,
  onExport,
  exportButtonText = "Export CSV"
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(externalCurrentPage);
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Sync external current page changes
  useEffect(() => {
    setCurrentPage(externalCurrentPage);
  }, [externalCurrentPage]);
  
  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Helper function to get nested object values
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Filter data based on search term and filters (only for client-side pagination)
  const filteredData = serverSidePagination ? data : data.filter(item => {
    // Search filter
    const matchesSearch = !searchTerm || columns.some(column => {
      const value = getNestedValue(item, column.key);
      return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Custom filters
    const matchesFilters = Object.entries(activeFilters).every(([filterKey, filterValue]) => {
      if (!filterValue) return true;
      const itemValue = getNestedValue(item, filterKey);
      return itemValue && itemValue.toString().toLowerCase().includes(filterValue.toLowerCase());
    });

    return matchesSearch && matchesFilters;
  });

  // Sort data (only for client-side pagination)
  const sortedData = serverSidePagination ? filteredData : [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = getNestedValue(a, sortColumn);
    const bValue = getNestedValue(b, sortColumn);
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = serverSidePagination 
    ? Math.ceil(totalItems / itemsPerPage)
    : Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = serverSidePagination ? data : sortedData.slice(startIndex, startIndex + itemsPerPage);
  const totalRecords = serverSidePagination ? totalItems : sortedData.length;

  // Handle column sorting
  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  // Handle filter change
  const handleFilterChange = (filterKey, value) => {
    const newFilters = {
      ...activeFilters,
      [filterKey]: value
    };
    if (!value || value === '') delete newFilters[filterKey];
    
    // For server-side pagination, reset to page 1 and call parent handler
    if (serverSidePagination && onFilterChange) {
      setCurrentPage(1);
      onFilterChange(newFilters);
    } else {
      setCurrentPage(1);
    }
  };

  // Render cell content
  const renderCell = (item, column) => {
    const value = getNestedValue(item, column.key);
    
    if (column.render) {
      return column.render(value, item);
    }
    
    if (column.type === 'status') {
      const statusName = value?.name || value || '';
      const colors = {
        active: 'bg-green-100 text-green-800 border-green-200',
        inactive: 'bg-red-100 text-red-800 border-red-200',
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      };
      const colorClass = colors[statusName] || 'bg-gray-100 text-gray-800 border-gray-200';
      
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${colorClass}`}>
          {statusName.toUpperCase()}
        </span>
      );
    }
    
    if (column.type === 'currency') {
      return `$${value || 0}`;
    }
    
    if (column.type === 'date') {
      return value ? new Date(value).toLocaleDateString() : '-';
    }
    
    return value || '-';
  };

  const SortIcon = ({ column }) => {
    if (sortColumn !== column) {
      return <span className="text-gray-400">↕️</span>;
    }
    return sortDirection === 'asc' ? <span className="text-blue-600">↑</span> : <span className="text-blue-600">↓</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {title && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          </div>
        )}
        <div className="flex gap-2 w-full sm:w-auto">
          {onExport && (
            <Button onClick={onExport} icon="📊" variant="outline" className="flex-1 sm:flex-none">
              {exportButtonText}
            </Button>
          )}
          {onAdd && (
            <Button onClick={onAdd} icon="➕" className="flex-1 sm:flex-none">
              {addButtonText}
            </Button>
          )}
        </div>
      </div>

      {/* Statistics */}
      {/* {showStats && stats && Object.keys(stats).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{value}</div>
              <div className="text-sm text-blue-800 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
            </div>
          ))}
        </div>
      )} */}

      {/* Search and Filters */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6">
              🔍
            </div>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                const value = e.target.value;
                setSearchTerm(value);
                
                // Clear existing timeout
                if (searchTimeout) {
                  clearTimeout(searchTimeout);
                }
                
                // Set new timeout for server-side search
                if (serverSidePagination && onFilterChange) {
                  const timeout = setTimeout(() => {
                    const newFilters = { ...activeFilters };
                    if (value) {
                      newFilters.search = value;
                    } else {
                      delete newFilters.search;
                    }
                    setCurrentPage(1);
                    onFilterChange(newFilters);
                  }, 500); // 500ms debounce
                  setSearchTimeout(timeout);
                }
              }}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700 font-medium transition-colors min-w-fit"
          >
            <span className="h-6 w-6 mr-1">📋</span>
            <span className="hidden sm:inline">Filters</span>
            <span className="sm:hidden">Filter</span>
            {Object.keys(activeFilters).length > 0 && (
              <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {Object.keys(activeFilters).length}
              </span>
            )}
          </button>

          {/* Clear Filters */}
          {(searchTerm || Object.keys(activeFilters).length > 0) && onClearFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center px-4 py-3 text-gray-600 font-medium transition-colors min-w-fit"
            >
              <span className="h-6 w-6 mr-1">✕</span>
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>

        {/* Filter Options */}
        {showFilters && filters.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filters.map((filter) => (
              <div key={filter.key}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{filter.label}</label>
                {filter.type === 'select' ? (
                  <select
                    value={activeFilters[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm bg-white"
                  >
                    <option value="">All {filter.label}</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={filter.type || 'text'}
                    placeholder={filter.placeholder || `Filter by ${filter.label.toLowerCase()}`}
                    value={activeFilters[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : (serverSidePagination ? data.length === 0 : sortedData.length === 0) ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">{emptyIcon}</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{emptyMessage}</h3>
            <p className="text-gray-600">
              {searchTerm || Object.values(activeFilters).some(v => v) ? 'Try adjusting your search criteria' : 'No records found'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className={`px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                          column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                        }`}
                        onClick={() => column.sortable && handleSort(column.key)}
                      >
                        <div className="flex items-center gap-2">
                          {column.label}
                          {column.sortable && <SortIcon column={column.key} />}
                        </div>
                      </th>
                    ))}
                    {(onView || onEdit || onDelete) && (
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.map((item, index) => (
                    <tr key={item._id || index} className="hover:bg-gray-50 transition-colors">
                      {columns.map((column) => (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {renderCell(item, column)}
                        </td>
                      ))}
                      {(onView || onEdit || onDelete) && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            {onView && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onView(item)}
                                icon="👁️"
                              >
                                View
                              </Button>
                            )}
                            {onEdit && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onEdit(item)}
                                icon="✏️"
                              >
                                Edit
                              </Button>
                            )}
                            {onDelete && (
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => onDelete(item)}
                                icon="🗑️"
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden">
              <div className="space-y-4 p-4">
                {paginatedData.map((item, index) => (
                  <div key={item._id || index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="space-y-3">
                      {columns.map((column) => {
                        const value = getNestedValue(item, column.key);
                        if (!value && value !== 0) return null;
                        
                        return (
                          <div key={column.key} className="flex justify-between items-start">
                            <div className="text-sm font-medium text-gray-500 min-w-0 flex-1">
                              {column.label}:
                            </div>
                            <div className="text-sm text-gray-900 ml-2 flex-1 text-right">
                              {column.render ? column.render(value, item) : renderCell(item, column)}
                            </div>
                          </div>
                        );
                      })}
                      
                      {(onView || onEdit || onDelete) && (
                        <div className="flex gap-2 pt-3 border-t border-gray-100">
                          {onView && (
                            <button
                              onClick={() => onView(item)}
                              className="flex-1 bg-gray-100 text-gray-600 px-3 py-2 rounded text-sm hover:bg-gray-200 transition-colors"
                            >
                              👁️ View
                            </button>
                          )}
                          {onEdit && (
                            <button
                              onClick={() => onEdit(item)}
                              className="flex-1 bg-blue-100 text-blue-600 px-3 py-2 rounded text-sm hover:bg-blue-200 transition-colors"
                            >
                              ✏️ Edit
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(item)}
                              className="bg-red-100 text-red-600 px-3 py-2 rounded text-sm hover:bg-red-200 transition-colors"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            {(totalPages > 1 || serverSidePagination) && (
              <div className="bg-gray-50 px-4 lg:px-6 py-3 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-700 text-center sm:text-left">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalRecords)} of {totalRecords} results
                    {serverSidePagination && ` (Page ${currentPage} of ${totalPages})`}
                  </div>
                  <div className="flex gap-2 flex-wrap justify-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newPage = currentPage - 1;
                        if (serverSidePagination && onPageChange) {
                          onPageChange(newPage);
                        } else {
                          setCurrentPage(newPage);
                        }
                      }}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                        return (
                          <Button
                            key={page}
                            size="sm"
                            variant={currentPage === page ? 'primary' : 'outline'}
                            onClick={() => {
                              if (serverSidePagination && onPageChange) {
                                onPageChange(page);
                              } else {
                                setCurrentPage(page);
                              }
                            }}
                          >
                            {page}
                          </Button>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="px-2 text-gray-500">...</span>;
                      }
                      return null;
                    })}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newPage = currentPage + 1;
                        if (serverSidePagination && onPageChange) {
                          onPageChange(newPage);
                        } else {
                          setCurrentPage(newPage);
                        }
                      }}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}