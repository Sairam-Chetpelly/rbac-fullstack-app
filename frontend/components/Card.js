const Card = ({ children, title, className = '', icon, actions, variant = 'default' }) => {
  const isGlass = className.includes('bg-white/10') || className.includes('backdrop-blur');
  
  const cardClasses = isGlass 
    ? `bg-white/10 backdrop-blur-xl shadow-xl rounded-2xl border border-white/20 hover:shadow-2xl transition-all duration-300`
    : `bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-100 hover:shadow-2xl transition-all duration-300`;
    
  const headerClasses = isGlass
    ? `px-8 py-6 border-b border-white/20 bg-white/5 rounded-t-2xl`
    : `px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded-t-2xl`;
    
  const titleClasses = isGlass
    ? `text-xl font-bold text-white`
    : `text-xl font-bold text-gray-900`;

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
      <div className="px-8 py-6">
        {children}
      </div>
    </div>
  );
};

export default Card;