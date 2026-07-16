import type { Beer } from '../schemas/beer.schema';
import type {
  NormalizedPublicBeer,
  PublicBeerLifecycle,
  PublicCatalog,
  PublicMetricProvenance,
  PublicWebPackaging
} from '../schemas/catalog.schema';

export type BeerDisplayPackaging = {
  id: string;
  label: string;
  priceLabel: string;
};

export type BeerDisplayLifecycleBadge = {
  kind: PublicBeerLifecycle;
  label: string;
};

export type BeerDisplayItem = Beer & {
  statusKind: PublicBeerLifecycle | Beer['availability'];
  statusLabel: string;
  statusDetail?: string;
  lifecycleBadges: BeerDisplayLifecycleBadge[];
  packagings: BeerDisplayPackaging[];
  groupingKey: string;
  recipeRevision?: number;
  metricProvenance?: PublicMetricProvenance;
  imageIsTemporary?: boolean | null;
  imageAttribution?: string | null;
};

const LIFECYCLE_LABELS: Record<PublicBeerLifecycle, string> = {
  available: 'En stock',
  in_production: 'Bientôt disponible',
  in_design: 'On planche dessus',
  out_of_stock: 'Cave à sec'
};

const LEGACY_AVAILABILITY_LABELS: Record<Beer['availability'], string> = {
  available: 'En stock',
  coming_soon: 'Arrive bientôt',
  sold_out: 'Cave à sec'
};

const LIFECYCLE_RANK: Record<PublicBeerLifecycle, number> = {
  available: 0,
  in_production: 1,
  in_design: 2,
  out_of_stock: 3
};

const PRICE_FORMATTER = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR'
});

function isLifecycle(value: string | null | undefined): value is PublicBeerLifecycle {
  return value === 'available' ||
    value === 'in_production' ||
    value === 'in_design' ||
    value === 'out_of_stock';
}

function inferLifecycle(beer: NormalizedPublicBeer): PublicBeerLifecycle {
  if (isLifecycle(beer.lifecycle)) {
    return beer.lifecycle;
  }

  if (beer.isUpcoming || beer.fermentation?.comingSoon || beer.production) {
    return 'in_production';
  }

  if (beer.webStockLevel === 'in_stock' || beer.stock?.availabilityWeb === 'in_stock') {
    return 'available';
  }

  return 'out_of_stock';
}

function groupKey(beer: NormalizedPublicBeer): string {
  const key = beer.groupingKey?.trim() ?? '';
  return key.length > 0 ? key : beer.id;
}

function displayStatus(entry: NormalizedPublicBeer): {
  kind: PublicBeerLifecycle | Beer['availability'];
  label: string;
} {
  const lifecycle = inferLifecycle(entry);

  if (lifecycle === 'available' && entry.webStockLabel) {
    return {
      kind: entry.webStockLevel === 'out_of_stock' ? 'out_of_stock' : 'available',
      label: entry.webStockLabel
    };
  }

  if (lifecycle === 'available' && entry.stock) {
    return {
      kind: entry.stock.availabilityWeb === 'out_of_stock' ? 'out_of_stock' : 'available',
      label: entry.stock.labelWeb
    };
  }

  return {
    kind: lifecycle,
    label: LIFECYCLE_LABELS[lifecycle]
  };
}

function productionDetail(beer: NormalizedPublicBeer): string | undefined {
  if (beer.production) {
    const parts = [beer.production.statusLabel];

    if (typeof beer.production.daysUntilReady === 'number') {
      if (beer.production.daysUntilReady > 1) {
        parts.push(`environ ${beer.production.daysUntilReady} jours`);
      } else if (beer.production.daysUntilReady === 1) {
        parts.push('environ 1 jour');
      } else if (beer.production.daysUntilReady === 0) {
        parts.push('prêt à basculer');
      }
    }

    return parts.join(' · ');
  }

  const fermentation = beer.fermentation;

  if (!fermentation) {
    return undefined;
  }

  const parts = [fermentation.statusLabel];

  if (typeof fermentation.daysUntilReady === 'number') {
    if (fermentation.daysUntilReady > 1) {
      parts.push(`environ ${fermentation.daysUntilReady} jours`);
    } else if (fermentation.daysUntilReady === 1) {
      parts.push('environ 1 jour');
    } else if (fermentation.daysUntilReady === 0) {
      parts.push('prêt à basculer');
    }
  }

  if (fermentation.batchCountInProgress > 1) {
    parts.push(`${fermentation.batchCountInProgress} brassins`);
  }

  return parts.join(' · ');
}

function statusDetail(entry: NormalizedPublicBeer, group: NormalizedPublicBeer[]): string | undefined {
  const lifecycle = inferLifecycle(entry);

  if (lifecycle === 'in_production') {
    return productionDetail(entry) ?? entry.lifecycleLabel ?? undefined;
  }

  if (lifecycle === 'in_design') {
    return entry.lifecycleLabel ??
      (entry.recipeRevision ? `Version V${entry.recipeRevision}` : undefined);
  }

  if (lifecycle === 'available') {
    const productionVariant = group.find((beer) => inferLifecycle(beer) === 'in_production');
    const detail = productionVariant ? productionDetail(productionVariant) : undefined;
    return detail ? `Nouveau brassin : ${detail}` : entry.webStockLabel ?? entry.stock?.labelWeb;
  }

  return entry.lifecycleLabel ?? entry.webStockLabel ?? entry.stock?.labelWeb;
}

function lifecycleBadges(
  entry: NormalizedPublicBeer,
  group: NormalizedPublicBeer[]
): BeerDisplayLifecycleBadge[] {
  const kinds = new Set<PublicBeerLifecycle>();
  kinds.add(inferLifecycle(entry));

  for (const variant of entry.lifecycleVariants ?? []) {
    if (isLifecycle(variant)) {
      kinds.add(variant);
    }
  }

  for (const beer of group) {
    kinds.add(inferLifecycle(beer));
  }

  return [...kinds]
    .sort((left, right) => LIFECYCLE_RANK[left] - LIFECYCLE_RANK[right])
    .map((kind) => ({
      kind,
      label: LIFECYCLE_LABELS[kind]
    }));
}

function packagingKey(packaging: PublicWebPackaging): string {
  return `${packaging.id}:${packaging.label}:${packaging.priceEUR}`;
}

function collectPackagings(beer: NormalizedPublicBeer): BeerDisplayPackaging[] {
  const seen = new Set<string>();
  const publicPackagings = beer.publicPackagings ?? [];

  return publicPackagings
    .filter((packaging) => {
      const key = packagingKey(packaging);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .sort((left, right) => left.label.localeCompare(right.label, 'fr'))
    .map((packaging) => ({
      id: packaging.id,
      label: packaging.label,
      priceLabel: PRICE_FORMATTER.format(packaging.priceEUR)
    }));
}

function fromLocalBeer(beer: Beer): BeerDisplayItem {
  return {
    ...beer,
    statusKind: beer.availability,
    statusLabel: LEGACY_AVAILABILITY_LABELS[beer.availability],
    lifecycleBadges: [],
    packagings: [],
    groupingKey: beer.id
  };
}

export function buildBeerDisplayItems(beers: Beer[], catalog: PublicCatalog | null): BeerDisplayItem[] {
  if (!catalog) {
    return beers.map(fromLocalBeer);
  }

  const localById = new Map(beers.map((beer) => [beer.id, beer]));
  const groups = new Map<string, NormalizedPublicBeer[]>();

  for (const beer of catalog.beers) {
    const key = groupKey(beer);
    const group = groups.get(key) ?? [];
    group.push(beer);
    groups.set(key, group);
  }

  return [...groups.values()]
    .flatMap((group) => group.map((entry) => {
      const localBeer = localById.get(entry.id);

      if (!localBeer) {
        return undefined;
      }

      const lifecycle = inferLifecycle(entry);
      const display = displayStatus(entry);

      return {
        ...localBeer,
        statusKind: display.kind,
        statusLabel: display.label,
        statusDetail: statusDetail(entry, group),
        lifecycleBadges: lifecycleBadges(entry, group),
        packagings: collectPackagings(entry),
        groupingKey: groupKey(entry),
        recipeRevision: entry.recipeRevision,
        metricProvenance: entry.metricProvenance,
        imageIsTemporary: entry.imageIsTemporary,
        imageAttribution: entry.imageAttribution
      };
    }))
    .filter((beer): beer is BeerDisplayItem => Boolean(beer));
}
