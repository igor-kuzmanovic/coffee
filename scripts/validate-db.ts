import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { ALL_ORIGIN_COUNTRIES, ROAST_LEVELS } from '../src/coffee.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const RoasterSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1),
  website: z.string().min(1),
  country: z.string().min(1),
  city: z.string().min(1),
});

const originEnumValues = ALL_ORIGIN_COUNTRIES as readonly [string, ...string[]];
const roastLevelEnumValues = ROAST_LEVELS as readonly [string, ...string[]];

const CoffeeInputSchema = z.object({
  id: z.number().int(),
  slug: z.string().min(1),
  name: z.string().min(1),
  website: z.string().min(1).nullable(),
  roastingLevel: z.enum(roastLevelEnumValues).nullable(),
  roastingType: z.string().min(1).nullable(),
  origin: z.enum(originEnumValues),
  roasterId: z.number().int().nullable(),
  cuppingScore: z.number().nullable(),
  tastingNotes: z.array(z.string()),
  process: z.string().min(1),
  seaLevel: z.string().min(1).nullable(),
  variety: z.string().min(1),
  harvestYear: z.string().min(1).nullable(),
  roastDate: z.string().min(1),
  boughtAt: z.string().min(1),
});

const DbInputSchema = z
  .object({
    roasters: z.array(RoasterSchema),
    coffees: z.array(CoffeeInputSchema),
  })
  .superRefine((db, ctx) => {
    const roasterIds = new Set<number>();
    db.roasters.forEach((roaster, index) => {
      if (roasterIds.has(roaster.id)) {
        ctx.addIssue({
          code: 'custom',
          path: ['roasters', index, 'id'],
          message: `duplicate roaster id ${roaster.id}`,
        });
      }
      roasterIds.add(roaster.id);
    });

    const coffeeIds = new Set<number>();
    const slugs = new Set<string>();

    db.coffees.forEach((coffee, index) => {
      if (coffeeIds.has(coffee.id)) {
        ctx.addIssue({
          code: 'custom',
          path: ['coffees', index, 'id'],
          message: `duplicate coffee id ${coffee.id}`,
        });
      }
      coffeeIds.add(coffee.id);

      if (slugs.has(coffee.slug)) {
        ctx.addIssue({
          code: 'custom',
          path: ['coffees', index, 'slug'],
          message: `duplicate coffee slug ${coffee.slug}`,
        });
      }
      slugs.add(coffee.slug);

      if (coffee.roasterId !== null && !roasterIds.has(coffee.roasterId)) {
        ctx.addIssue({
          code: 'custom',
          path: ['coffees', index, 'roasterId'],
          message: `missing roaster reference ${coffee.roasterId}`,
        });
      }
    });
  });

export function validateDbJson(): void {
  const dbPath = path.join(rootDir, 'data/db.json');
  const raw = fs.readFileSync(dbPath, 'utf8');
  const parsed = JSON.parse(raw);

  const result = DbInputSchema.safeParse(parsed);
  if (result.success) {
    console.log('[db.json validation] ok');
    return;
  }

  const maxItems = 25;
  const issues = result.error.issues.map((issue) => {
    const pathText = issue.path.length ? `/${issue.path.join('/')}` : '/';
    return `- ${pathText} ${issue.message}`;
  });

  const shown = issues.slice(0, maxItems).join('\n');
  const more = issues.length > maxItems ? `\n...and ${issues.length - maxItems} more.` : '';
  const message = `[db.json validation:error] ${issues.length} issue(s)\n${shown}${more}`;
  throw new Error(message);
}
