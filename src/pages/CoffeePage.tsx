import { ViewTransition, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { coffeeBySlug, getContinentColor, getCountryColor, roasterById } from '../coffee';
import { CoffeeFacts } from '../components/CoffeeFacts';
import styles from './CoffeePage.module.css';

export function CoffeePage() {
  const { slug } = useParams();

  const coffee = useMemo(() => {
    return slug ? coffeeBySlug.get(slug) : undefined;
  }, [slug]);

  if (!coffee) {
    return (
      <main className={`shell ${styles.page}`}>
        <Link className={styles.backLink} to="/">
          <ArrowLeft className={styles.backIcon} aria-hidden="true" />
          Back
        </Link>
        <article className={styles.card}>
          <div className={styles.content}>
            <h1 className={styles.title}>Coffee not found</h1>
          </div>
        </article>
      </main>
    );
  }

  const roaster = roasterById.get(coffee.roasterId ?? -1);
  const originAccent = getCountryColor(coffee.origin);
  const continentAccent = getContinentColor(coffee.origin);
  const cardStyle = { '--origin-accent': originAccent, '--continent-accent': continentAccent } as CSSProperties;
  const transitionName = `coffee-title-${coffee.slug}`;
  const subtitleTransitionName = `coffee-subtitle-${coffee.slug}`;
  const roasterTransitionName = `coffee-roaster-${coffee.slug}`;
  const cardTransitionName = `coffee-card-${coffee.slug}`;

  return (
    <main className={`shell ${styles.page}`}>
      <Link className={styles.backLink} to="/">
        <ArrowLeft className={styles.backIcon} aria-hidden="true" />
        Back
      </Link>
      <ViewTransition name={cardTransitionName}>
        <article className={styles.card} style={cardStyle}>
          <div className={styles.content}>
            <h1 className={styles.title}>
              <ViewTransition name={transitionName}>
                <span>{coffee.name}</span>
              </ViewTransition>
              {coffee.website ? (
                <a
                  className={styles.titleExternal}
                  href={coffee.website}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open coffee website"
                >
                  <ExternalLink className={styles.linkIcon} aria-hidden="true" />
                </a>
              ) : null}
            </h1>
            <div className={styles.subtitle}>
              <ViewTransition name={subtitleTransitionName}>
                <span className={styles.origin}>{coffee.origin}</span>
              </ViewTransition>
              {roaster ? (
                <span className={styles.roasterLine}>
                  <ViewTransition name={roasterTransitionName}>
                    <span>{roaster.name}</span>
                  </ViewTransition>
                  <span aria-hidden="true">·</span>
                  <a className={styles.inlineExternal} href={roaster.website} target="_blank" rel="noreferrer">
                    Website
                    <ExternalLink className={styles.linkIcon} aria-hidden="true" />
                  </a>
                  <span aria-hidden="true">·</span>
                  <a className={styles.inlineExternal} href={roaster.instagram} target="_blank" rel="noreferrer">
                    Instagram
                    <ExternalLink className={styles.linkIcon} aria-hidden="true" />
                  </a>
                </span>
              ) : null}
            </div>
            {coffee.tastingNotes.length ? (
              <section>
                <h2 className={styles.notesTitle}>Tasting notes</h2>
                <ul className={styles.notesList}>
                  {coffee.tastingNotes.map((note, index) => (
                    <li key={`${note}-${index}`}>{note}</li>
                  ))}
                </ul>
              </section>
            ) : null}
            <section>
              <CoffeeFacts coffee={coffee} />
            </section>
          </div>
        </article>
      </ViewTransition>
    </main>
  );
}
