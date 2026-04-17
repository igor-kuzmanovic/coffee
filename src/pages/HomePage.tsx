import { coffees, roasterById } from '../coffee';
import { CoffeeCard } from '../components/CoffeeCard';
import styles from './HomePage.module.css';

export function HomePage() {
  return (
    <main className={`shell ${styles.page}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>Coffee Notebook</h1>
      </header>
      <section className={styles.grid} aria-label="Bought coffees">
        {coffees.map((coffee) => (
          <CoffeeCard key={coffee.id} coffee={coffee} roaster={roasterById.get(coffee.roasterId ?? -1)} />
        ))}
      </section>
    </main>
  );
}
