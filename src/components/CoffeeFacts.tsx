import type { CSSProperties } from 'react';
import { DARK_ROAST_LEVEL, formatDate, getRoastLevelHue, getSeaLevelHue } from '../coffee';
import type { Coffee } from '../coffee';
import styles from './CoffeeFacts.module.css';

type Props = {
  coffee: Coffee;
};

export function CoffeeFacts({ coffee }: Props) {
  const seaLevelHue = getSeaLevelHue(coffee.seaLevel);
  const roastLevelHue = getRoastLevelHue(coffee.roastingLevel);
  const isDarkRoast = coffee.roastingLevel === DARK_ROAST_LEVEL;
  const sourceDetails = [
    { key: 'origin', label: 'Origin', value: coffee.origin },
    { key: 'process', label: 'Process', value: coffee.process },
    { key: 'variety', label: 'Variety', value: coffee.variety },
    { key: 'sea-level', label: 'Sea level', value: coffee.seaLevel ?? '' },
  ].filter(({ value }) => value.trim().length > 0);

  const roastDetails = [
    { key: 'roast-type', label: 'Roast type', value: coffee.roastingType ?? '' },
    { key: 'roast-level', label: 'Roast level', value: coffee.roastingLevel ?? '' },
    { key: 'roast-date', label: 'Roast date', value: coffee.roastDate },
    { key: 'harvest-year', label: 'Harvest year', value: coffee.harvestYear ?? '' },
    { key: 'bought', label: 'Bought', value: formatDate(coffee.boughtAt) },
    {
      key: 'cupping-score',
      label: 'Cupping score',
      value: coffee.cuppingScore === null ? '' : String(coffee.cuppingScore),
    },
  ].filter(({ value }) => value.trim().length > 0);

  return (
    <div className={styles.facts}>
      <div className={styles.context}>
        {sourceDetails.length ? (
          <section className={styles.section}>
            <dl className={styles.list}>
              {sourceDetails.map(({ key, label, value }) => (
                <div className={styles.row} key={key}>
                  <dt className={styles.rowLabel}>{label}</dt>
                  <dd
                    className={`${styles.rowValue} ${key === 'sea-level' && seaLevelHue !== null ? styles.seaLevelValue : ''}`}
                    style={
                      key === 'sea-level' && seaLevelHue !== null
                        ? ({ '--sea-h': seaLevelHue } as CSSProperties)
                        : undefined
                    }
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {roastDetails.length ? (
          <section className={styles.section}>
            <dl className={styles.list}>
              {roastDetails.map(({ key, label, value }) => (
                <div className={styles.row} key={key}>
                  <dt className={styles.rowLabel}>{label}</dt>
                  <dd
                    className={`${styles.rowValue} ${key === 'roast-level' && roastLevelHue !== null ? styles.roastLevelValue : ''} ${key === 'roast-level' && isDarkRoast ? styles.roastLevelDark : ''}`}
                    style={
                      key === 'roast-level' && roastLevelHue !== null
                        ? ({ '--roast-h': roastLevelHue } as CSSProperties)
                        : undefined
                    }
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}
      </div>
    </div>
  );
}
