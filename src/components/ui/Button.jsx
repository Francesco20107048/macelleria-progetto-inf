const variants = {
  primary: 'bg-bordeaux text-white hover:bg-bordeaux-dark active:scale-95',
  secondary: 'bg-transparent border border-bordeaux text-bordeaux hover:bg-bordeaux hover:text-white active:scale-95',
  ghost: 'bg-transparent text-bordeaux hover:bg-bordeaux/10 active:scale-95',
  gold: 'bg-gold text-white hover:bg-gold/90 active:scale-95',
};

export default function Button({
  children,
  variant = 'primary',
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center
        px-5 py-2.5 rounded-md font-medium text-sm
        transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant] || variants.primary}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
