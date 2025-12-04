const Button = ({ children, variant = 'primary', size = 'md', onClick, disabled, type = 'button', className = '', icon }) => {
  const baseClasses = 'font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all duration-200 hover:scale-105 active:scale-95';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-300',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-300',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-300',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-blue-300',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-300'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base'
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-lg' : '';
  
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