import type {
  TrekItem,
  TrekSection,
  TrekState,
  TrekTotals,
} from "../../types/trek";

export const formatWeight = (value: number) =>
  value.toFixed(value < 10 ? 2 : 1);

export const formatPreciseWeight = (value: number) => value.toFixed(3);

export const getQuantity = (item: TrekItem, state: TrekState) =>
  item.q ? (state.qty[item.id] ?? item.q.d) : 1;

export const getWeight = (item: TrekItem, state: TrekState) =>
  (state.wov[item.id] ?? item.w) * getQuantity(item, state);

export function getSections(state: TrekState, baseSections: TrekSection[]) {
  return baseSections.map((section) =>
    section.type === "custom" ? { ...section, items: state.extra } : section,
  );
}

export function calculateTotals(
  sections: TrekSection[],
  state: TrekState,
): TrekTotals {
  const totals: TrekTotals = {
    kg: 0,
    done: 0,
    total: 0,
    off: 0,
    ghost: 0,
    bySection: {},
  };

  for (const section of sections) {
    const stats = { kg: 0, done: 0, total: 0, off: 0 };
    const active = !section.prof || Boolean(state.prof[section.prof]);

    for (const item of section.items) {
      if (state.off[item.id]) {
        stats.off += 1;
        if (active) totals.off += 1;
        continue;
      }

      if (active) {
        stats.total += 1;
        if (state.chk[item.id]) {
          stats.done += 1;
          stats.kg += getWeight(item, state);
        }
      } else if (state.chk[item.id]) {
        totals.ghost += 1;
      }
    }

    if (active) {
      totals.kg += stats.kg;
      totals.done += stats.done;
      totals.total += stats.total;
    }
    totals.bySection[section.id] = stats;
  }

  return totals;
}

export function buildManifestText(sections: TrekSection[], state: TrekState) {
  const totals = calculateTotals(sections, state);
  const date = new Date().toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const profile = state.prof.frio ? "FRÍO" : "SALIDA BASE";
  const lines = [
    "▓ CARGA — TREK//SYS",
    `${date} · ${profile}`,
    `PESO: ${formatWeight(totals.kg)} KG · ${totals.done} ítems`,
  ];

  for (const section of sections) {
    if (section.prof && !state.prof[section.prof]) continue;
    const items = section.items.filter(
      (item) => state.chk[item.id] && !state.off[item.id],
    );
    if (!items.length) continue;
    const sectionWeight = items.reduce(
      (sum, item) => sum + getWeight(item, state),
      0,
    );
    lines.push(
      "",
      `// ${section.t.toUpperCase()} — ${formatPreciseWeight(sectionWeight)} kg`,
      ...items.map(
        (item) =>
          `· ${item.n}${item.q ? ` (${getQuantity(item, state)} ${item.q.u})` : ""} — ${formatPreciseWeight(getWeight(item, state))} kg`,
      ),
    );
  }

  return lines.join("\n");
}
