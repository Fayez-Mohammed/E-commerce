import React, { useState } from 'react';
import { Star } from 'lucide-react';
import styles from './StarRating.module.css';

export interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showText?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 16,
  interactive = false,
  onChange,
  showText = false,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className={styles.container}>
      <div className={styles.stars}>
        {Array.from({ length: maxStars }).map((_, index) => {
          const starValue = index + 1;
          const isFilled = displayRating >= starValue;
          const isHalf = displayRating > index && displayRating < starValue;

          return (
            <button
              type="button"
              key={index}
              disabled={!interactive}
              className={`${styles.starBtn} ${interactive ? styles.interactive : ''}`}
              onClick={() => interactive && onChange && onChange(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              aria-label={`Rate ${starValue} stars`}
            >
              <Star
                size={size}
                className={`${styles.star} ${isFilled ? styles.filled : isHalf ? styles.half : styles.empty}`}
              />
            </button>
          );
        })}
      </div>
      {showText && (
        <span className={styles.ratingText}>
          {Number(rating).toFixed(1)}
        </span>
      )}
    </div>
  );
};
