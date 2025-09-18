const Card = ({ children, title, className = '', icon, actions }) => {
  return (
    <div className={`bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-100 hover:shadow-2xl transition-all duration-300 ${className}`}>
      {title && (
        <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon && <span className="text-2xl">{icon}</span>}
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
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