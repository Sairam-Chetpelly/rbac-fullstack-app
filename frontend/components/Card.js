const Card = ({ children, title, className = '', icon, actions, variant = 'default' }) => {
  const isGlass = className.includes('bg-white/10') || className.includes('backdrop-blur');
  
  const cardClasses = isGlass 
    ? `bg-white/10 backdrop-blur-xl shadow-md rounded-2xl border border-white/20 transition-all duration-300`
    : `bg-white shadow-sm rounded-2xl border border-gray-200 transition-all duration-300 relative overflow-hidden`;
    
  const headerClasses = isGlass
    ? `px-8 py-6 border-b border-white/20 bg-white/5 rounded-t-2xl`
    : `px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200 bg-gray-50 rounded-t-2xl relative`;
    
  const titleClasses = isGlass
    ? `text-xl font-bold text-white`
    : `text-xl font-bold text-gray-800`;

  return (
    <div className={`${cardClasses} ${className}`}>
      {title && (
        <div className={headerClasses}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon && <span className="text-2xl">{icon}</span>}
              <h3 className={titleClasses}>{title}</h3>
            </div>
            {actions && <div className="flex gap-2">{actions}</div>}
          </div>
        </div>
      )}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative">
        {!isGlass && <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>}
        {children}
      </div>
    </div>
  );
};

export default Card;