export default function Badge({ children, className = '' }) {
  return (
    <span
      className={`
        inline-block px-2.5 py-0.5 rounded text-xs font-medium
        bg-gold/20 text-[#7A5C1A] border border-gold/40
        ${className}
      `}
    >
      {children}
    </span>
  );
}
