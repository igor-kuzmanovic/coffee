import { ViewTransition } from 'react';
import type { Coffee, Roaster } from '../coffee';
import { Link } from 'react-router-dom';
import type { CSSProperties } from 'react';
import { formatDate, getCountryColor } from '../coffee';
import styles from './CoffeeCard.module.css';

type Props = {
  coffee: Coffee;
  roaster?: Roaster;
};

export function CoffeeCard({ coffee, roaster }: Props) {
  const href = `/coffee/${coffee.slug}`;
  const originAccent = getCountryColor(coffee.origin);
  const style = { '--origin-accent': originAccent } as CSSProperties;
  const metaParts = [coffee.origin, roaster?.name].filter((part): part is string => Boolean(part && part.trim()));
  const transitionName = `coffee-title-${coffee.slug}`;
  const boughtTransitionName = `coffee-bought-${coffee.slug}`;
  const subtitleTransitionName = `coffee-subtitle-${coffee.slug}`;
  const cardTransitionName = `coffee-card-${coffee.slug}`;

  return (
    <ViewTransition name={cardTransitionName}>
      <Link className={styles.card} to={href} style={style} viewTransition>
        <div className={styles.body}>
          <ViewTransition name={transitionName}>
            <h2 className={styles.name}>{coffee.name}</h2>
          </ViewTransition>
          {metaParts.length ? (
            <p className={styles.meta}>
              <ViewTransition name={subtitleTransitionName}>
                <span>{metaParts.join(' · ')}</span>
              </ViewTransition>
            </p>
          ) : null}
          <p className={styles.bought}>
            <ViewTransition name={boughtTransitionName}>
              <span>{formatDate(coffee.boughtAt)}</span>
            </ViewTransition>
          </p>
        </div>
      </Link>
    </ViewTransition>
  );
}
