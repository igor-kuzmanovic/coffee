import db from '../data/db.json' with { type: 'json' };

export const CONTINENTS = ['Africa', 'Asia', 'North America', 'South America', 'Oceania'] as const;

export type Continent = (typeof CONTINENTS)[number];

export const COUNTRIES_BY_CONTINENT = {
  Africa: [
    'Angola',
    'Central African Republic',
    'Democratic Republic of the Congo',
    'Ethiopia',
    'Guinea',
    'Ivory Coast',
    'Kenya',
    'Madagascar',
    'Malawi',
    'Rwanda',
    'Tanzania',
    'Togo',
    'Uganda',
  ],
  Asia: ['Cambodia', 'China', 'India', 'Indonesia', 'Laos', 'Philippines', 'Thailand', 'Vietnam', 'Yemen'],
  'North America': [
    'Costa Rica',
    'Dominican Republic',
    'El Salvador',
    'Guatemala',
    'Honduras',
    'Mexico',
    'Nicaragua',
    'Panama',
  ],
  'South America': ['Bolivia', 'Brazil', 'Colombia', 'Peru', 'Venezuela'],
  Oceania: ['Papua New Guinea'],
} as const satisfies Record<Continent, readonly string[]>;

export type OriginCountry = (typeof COUNTRIES_BY_CONTINENT)[Continent][number];

export const ALL_ORIGIN_COUNTRIES = Object.freeze(
  CONTINENTS.flatMap((continent) => COUNTRIES_BY_CONTINENT[continent]),
) as readonly OriginCountry[];

export const CONTINENT_BY_COUNTRY: Readonly<Record<OriginCountry, Continent>> = Object.freeze(
  Object.fromEntries(
    CONTINENTS.flatMap((continent) => COUNTRIES_BY_CONTINENT[continent].map((country) => [country, continent])),
  ) as Record<OriginCountry, Continent>,
);

export const ROAST_LEVELS = ['Light', 'Medium', 'Dark'] as const;
export type RoastLevel = (typeof ROAST_LEVELS)[number];
export const DARK_ROAST_LEVEL: RoastLevel = 'Dark';

export type Roaster = {
  id: number;
  name: string;
  website: string;
  country: string;
  city: string;
};

export type Coffee = {
  id: number;
  slug: string;
  name: string;
  website: string | null;
  roastingLevel: RoastLevel | null;
  roastingType: string | null;
  origin: OriginCountry;
  roasterId: number | null;
  cuppingScore: number | null;
  tastingNotes: string[];
  process: string;
  seaLevel: string | null;
  variety: string;
  harvestYear: string | null;
  roastDate: string;
  boughtAt: string;
};

export type Db = {
  roasters: Roaster[];
  coffees: Coffee[];
};

type Hsl = {
  h: number;
  s: number;
  l: number;
};

type ContinentColorSeed = {
  base: Hsl;
  hueRange: number;
  satRange: number;
  lightRange: number;
};

const CONTINENT_COLOR_SEEDS: Record<Continent, ContinentColorSeed> = {
  Africa: { base: { h: 132, s: 38, l: 46 }, hueRange: 24, satRange: 10, lightRange: 10 },
  Asia: { base: { h: 258, s: 34, l: 48 }, hueRange: 22, satRange: 9, lightRange: 10 },
  'North America': { base: { h: 22, s: 46, l: 50 }, hueRange: 22, satRange: 10, lightRange: 10 },
  'South America': { base: { h: 192, s: 36, l: 46 }, hueRange: 24, satRange: 9, lightRange: 10 },
  Oceania: { base: { h: 284, s: 30, l: 50 }, hueRange: 10, satRange: 4, lightRange: 6 },
};

const ROAST_LEVEL_HUE: Record<RoastLevel, number> = {
  Light: 48,
  Medium: 28,
  Dark: 0,
};

function normalizeRoastingLevel(level: string | null | undefined): RoastLevel | null {
  return level === 'Light' || level === 'Medium' || level === 'Dark' ? level : null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeToUnit(index: number, count: number): number {
  if (count <= 1) {
    return 0;
  }

  return (index / (count - 1)) * 2 - 1;
}

function formatHsl(color: Hsl): string {
  return `hsl(${Math.round(color.h)} ${Math.round(color.s)}% ${Math.round(color.l)}%)`;
}

export function getCountryColor(country: OriginCountry): string {
  const continent = CONTINENT_BY_COUNTRY[country];
  const seed = CONTINENT_COLOR_SEEDS[continent];
  const countries = COUNTRIES_BY_CONTINENT[continent] as readonly OriginCountry[];
  const index = countries.indexOf(country);
  const axis = normalizeToUnit(index, countries.length);

  const derived: Hsl = {
    h: (seed.base.h + axis * seed.hueRange + 360) % 360,
    s: clamp(seed.base.s + axis * seed.satRange, 16, 72),
    l: clamp(seed.base.l - Math.abs(axis) * seed.lightRange + axis * 2, 24, 74),
  };

  return formatHsl(derived);
}

export function formatDate(dateString: string): string {
  const timestamp = Date.parse(dateString);
  if (!Number.isFinite(timestamp)) {
    return '';
  }

  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function normalizeCuppingScore(cuppingScore: number | null | undefined): number | null {
  const numeric = cuppingScore === null || cuppingScore === undefined ? NaN : Number(cuppingScore);
  if (!Number.isFinite(numeric)) {
    return null;
  }

  const normalized = Math.round(numeric);
  return normalized >= 10 && normalized <= 100 ? normalized : null;
}

export function normalizeSeaLevel(seaLevel: string | null | undefined): string | null {
  return seaLevel?.trim() || null;
}

export function getRoastLevelHue(roastingLevel: RoastLevel | null): number | null {
  return roastingLevel === null ? null : ROAST_LEVEL_HUE[roastingLevel];
}

function parseSeaLevelMeters(seaLevel: string | null): number | null {
  const value = seaLevel?.trim();
  if (!value) {
    return null;
  }

  const rangeMatch = value.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)/);
  if (rangeMatch) {
    const lower = Number(rangeMatch[1]);
    const upper = Number(rangeMatch[2]);
    if (Number.isFinite(lower) && Number.isFinite(upper) && lower > 0 && upper > 0) {
      return (lower + upper) / 2;
    }
  }

  const firstNumber = value.match(/\d+(?:\.\d+)?/);
  const parsed = firstNumber ? Number(firstNumber[0]) : NaN;

  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function getSeaLevelHue(seaLevel: string | null): number | null {
  const meters = parseSeaLevelMeters(seaLevel);
  if (meters === null) {
    return null;
  }

  const normalized = (Math.min(2600, Math.max(800, meters)) - 800) / (2600 - 800);
  const warmHue = 32;
  const coolHue = 220;
  const hueSpan = 360 - coolHue + warmHue;
  const rawHue = warmHue - normalized * hueSpan;

  return Math.round((rawHue + 360) % 360);
}

const typedDb = db as Db;

const roasterById = new Map<number, Roaster>(typedDb.roasters.map((roaster) => [roaster.id, roaster]));

const coffeesSorted: Coffee[] = typedDb.coffees
  .map((coffee) => ({
    ...coffee,
    roastingLevel: normalizeRoastingLevel(coffee.roastingLevel),
    cuppingScore: normalizeCuppingScore(coffee.cuppingScore),
    seaLevel: normalizeSeaLevel(coffee.seaLevel),
  }))
  .sort((a, b) => {
    const aTime = a.boughtAt ? new Date(a.boughtAt).getTime() : Number.NEGATIVE_INFINITY;
    const bTime = b.boughtAt ? new Date(b.boughtAt).getTime() : Number.NEGATIVE_INFINITY;

    return bTime - aTime;
  });

const coffeeBySlug = new Map<string, Coffee>(coffeesSorted.map((coffee) => [coffee.slug, coffee]));

export const coffees = coffeesSorted;
export { roasterById, coffeeBySlug };
