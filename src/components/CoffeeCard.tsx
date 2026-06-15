import { ViewTransition } from 'react';
import type { Coffee, Roaster } from '../coffee';
import { Link } from 'react-router-dom';
import type { CSSProperties } from 'react';
import { getContinentColor, getCountryColor } from '../coffee';
import styles from './CoffeeCard.module.css';

type Props = {
  coffee: Coffee;
  roaster?: Roaster;
};

export function CoffeeCard({ coffee, roaster }: Props) {
  const href = `/coffee/${coffee.slug}`;
  const originAccent = getCountryColor(coffee.origin);
  const continentAccent = getContinentColor(coffee.origin);
  const style = { '--origin-accent': originAccent, '--continent-accent': continentAccent } as CSSProperties;
  const transitionName = `coffee-title-${coffee.slug}`;
  const subtitleTransitionName = `coffee-subtitle-${coffee.slug}`;
  const roasterTransitionName = `coffee-roaster-${coffee.slug}`;
  const cardTransitionName = `coffee-card-${coffee.slug}`;

  return (
    <ViewTransition name={cardTransitionName}>
      <Link className={styles.card} to={href} style={style} viewTransition>
        <div className={styles.body}>
          <h2 className={styles.name}>
            <ViewTransition name={transitionName}>
              <span>{coffee.name}</span>
            </ViewTransition>
          </h2>
          <p className={styles.origin}>
            <ViewTransition name={subtitleTransitionName}>
              <span>{coffee.origin}</span>
            </ViewTransition>
          </p>
          {roaster?.name ? (
            <p className={styles.roaster}>
              <ViewTransition name={roasterTransitionName}>
                <span>{roaster.name}</span>
              </ViewTransition>
            </p>
          ) : null}
        </div>
      </Link>
    </ViewTransition>
  );
}
