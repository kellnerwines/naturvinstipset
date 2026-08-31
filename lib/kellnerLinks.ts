/**
 * Curated cross-link to kellnerwines.se, keyed by producer name as it appears in
 * naturvinstipset's own wine data. kellnerwines.se is a separate deployment/repo —
 * its data isn't reachable at build or request time here, so this mapping is
 * maintained by hand. Verified 2026-08-31 by matching producer + wine names across
 * both datasets (country + wine names line up, e.g. "Arinto" from Barroca da Malhada
 * appears on both sites linking to the same Systembolaget article number).
 *
 * Update this list when new overlapping producers are confirmed.
 */
const KELLNER_PRODUCER_SLUGS: Record<string, string> = {
  "Arribas Wine Company": "arribas-wine-company",
  "Barroca da Malhada": "barroca-da-malhada",
  "Purista Vinhos": "purista",
};

export function kellnerProducerUrl(producerName: string): string | undefined {
  const slug = KELLNER_PRODUCER_SLUGS[producerName];
  return slug ? `https://www.kellnerwines.se/producenter/${slug}` : undefined;
}
