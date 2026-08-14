import React from 'react';
import styles from './SkeletonLoader.module.css';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className={styles.cardSkeleton}>
      <div className={styles.imageSkeleton} />
      <div className={styles.contentSkeleton}>
        <div className={styles.lineSmall} />
        <div className={styles.lineMedium} />
        <div className={styles.lineLarge} />
        <div className={styles.priceRow}>
          <div className={styles.priceSkeleton} />
          <div className={styles.btnSkeleton} />
        </div>
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 5 }) => {
  return (
    <tr className={styles.tableRow}>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className={styles.tableCell}>
          <div className={styles.tableCellLine} />
        </td>
      ))}
    </tr>
  );
};
