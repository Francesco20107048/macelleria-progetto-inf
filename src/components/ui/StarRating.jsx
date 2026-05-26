import { useState } from 'react';

function Star({ filled, onClick, onMouseEnter, onMouseLeave, interactive }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={filled ? '#C9A84C' : 'none'}
      stroke={filled ? '#C9A84C' : '#D1D5DB'}
      strokeWidth="1.5"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={interactive ? 'cursor-pointer transition-colors duration-100' : ''}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
      />
    </svg>
  );
}

export default function StarRating({
  rating = 0,
  interactive = false,
  onChange,
  count,
  size = 'md',
}) {
  const [hover, setHover] = useState(0);
  const active = hover || rating;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          filled={active >= star}
          interactive={interactive}
          onClick={() => interactive && onChange && onChange(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
        />
      ))}
      {count !== undefined && (
        <span className="text-sm text-[#888888] ml-1.5">
          {typeof rating === 'number' ? rating.toFixed(1) : rating} ({count})
        </span>
      )}
    </div>
  );
}
