const Button = ({ children, variant = 'primary', size = 'md', onClick, disabled, type = 'button', className = '', icon }) => {
  const baseClasses = 'font-semibold rounded-xl focus:outline-none focus:ring-4 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg';
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white focus:ring-blue-300 shadow-blue-200',
    secondary: 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white focus:ring-gray-300 shadow-gray-200',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white focus:ring-red-300 shadow-red-200',
    success: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white focus:ring-green-300 shadow-green-200',
    outline: 'border-2 border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-blue-300 shadow-gray-100',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-300'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base'
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed transform-none hover:scale-100' : '';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className} flex items-center gap-2`}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;