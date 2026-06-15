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

type Oklch = {
  l: number;
  c: number;
  h: number;
};

type ContinentColorSeed = {
  base: Oklch;
  hueRange: number;
  chromaRange: number;
  lightRange: number;
};

const CONTINENT_COLOR_SEEDS: Record<Continent, ContinentColorSeed> = {
  Africa: { base: { l: 0.62, c: 0.26, h: 140 }, hueRange: 110, chromaRange: 0.26, lightRange: 0.24 },
  Asia: { base: { l: 0.6, c: 0.25, h: 300 }, hueRange: 120, chromaRange: 0.24, lightRange: 0.24 },
  'North America': { base: { l: 0.62, c: 0.26, h: 28 }, hueRange: 110, chromaRange: 0.26, lightRange: 0.24 },
  'South America': { base: { l: 0.6, c: 0.25, h: 210 }, hueRange: 120, chromaRange: 0.24, lightRange: 0.24 },
  Oceania: { base: { l: 0.64, c: 0.22, h: 320 }, hueRange: 90, chromaRange: 0.2, lightRange: 0.2 },
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

function formatOklch(color: Oklch): string {
  return `oklch(${color.l.toFixed(4)} ${color.c.toFixed(4)} ${Math.round(color.h)}deg)`;
}

export function getContinentColor(country: OriginCountry): string {
  const continent = CONTINENT_BY_COUNTRY[country];
  const seed = CONTINENT_COLOR_SEEDS[continent];
  return formatOklch(seed.base);
}

export function getCountryColor(country: OriginCountry): string {
  const continent = CONTINENT_BY_COUNTRY[country];
  const seed = CONTINENT_COLOR_SEEDS[continent];
  const countries = COUNTRIES_BY_CONTINENT[continent] as readonly OriginCountry[];
  const index = countries.indexOf(country);
  const count = Math.max(1, countries.length);
  const t = (index + 1) / (count + 1);
  const sign = index % 2 === 0 ? 1 : -1;
  const delta = (0.4 + t * 0.45) * sign;

  const derived: Oklch = {
    h: (seed.base.h + delta * seed.hueRange + 360) % 360,
    c: clamp(seed.base.c + delta * seed.chromaRange, 0.04, 0.42),
    l: clamp(seed.base.l - Math.abs(delta) * seed.lightRange, 0.24, 0.88),
  };

  return formatOklch(derived);
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
