import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';

const SearchFilters = ({ onSearch, onFilter, onClear, filters = {}, searchPlaceholder = "Search...", initialSearch = '', initialFilters = {} }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState(initialFilters);
  
  // Sync with parent state
  useEffect(() => {
    setSearchTerm(initialSearch);
    setActiveFilters(initialFilters);
  }, [initialSearch, initialFilters]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...activeFilters, [key]: value };
    if (!value) delete newFilters[key];
    setActiveFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
    if (onClear) {
      onClear();
    } else {
      onSearch('');
      onFilter({});
    }
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0 || searchTerm;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700 font-medium transition-colors min-w-fit"
        >
          <Filter className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Filters</span>
          <span className="sm:hidden">Filter</span>
          {Object.keys(activeFilters).length > 0 && (
            <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
              {Object.keys(activeFilters).length}
            </span>
          )}
        </button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center px-4 py-3 text-gray-600 font-medium transition-colors min-w-fit"
          >
            <X className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filters.status && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={activeFilters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm bg-white"
              >
                <option value="">All Status</option>
                {filters.status.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          )}

          {filters.country && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
              <select
                value={activeFilters.country || ''}
                onChange={(e) => handleFilterChange('country', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm bg-white"
              >
                <option value="">All Countries</option>
                {filters.country.map(country => (
                  <option key={country.value} value={country.value}>{country.label}</option>
                ))}
              </select>
            </div>
          )}

          {filters.dateRange && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date Range</label>
              <select
                value={activeFilters.dateRange || ''}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm bg-white"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilters;