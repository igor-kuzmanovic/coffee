import { ViewTransition, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { coffeeBySlug, getCountryColor, roasterById } from '../coffee';
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
  const cardStyle = { '--origin-accent': originAccent } as CSSProperties;
  const subtitleParts = [coffee.origin, roaster?.name].filter((part): part is string => Boolean(part && part.trim()));
  const transitionName = `coffee-title-${coffee.slug}`;
  const subtitleTransitionName = `coffee-subtitle-${coffee.slug}`;
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
            <ViewTransition name={transitionName}>
              <h1 className={styles.title}>
                <span>{coffee.name}</span>
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
            </ViewTransition>
            {subtitleParts.length ? (
              <p className={styles.subtitle}>
                <ViewTransition name={subtitleTransitionName}>
                  <span>{subtitleParts.join(' · ')}</span>
                </ViewTransition>
                {roaster ? (
                  <a
                    className={styles.inlineExternal}
                    href={roaster.website}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Open roaster website"
                  >
                    <ExternalLink className={styles.linkIcon} aria-hidden="true" />
                  </a>
                ) : null}
              </p>
            ) : null}
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
