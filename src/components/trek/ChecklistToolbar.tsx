export type ChecklistFilter = 'all' | 'pending' | 'packed' | 'discarded'

type ChecklistToolbarProps = {
  query: string
  filter: ChecklistFilter
  resultCount: number
  onQueryChange: (query: string) => void
  onFilterChange: (filter: ChecklistFilter) => void
}

const FILTERS: { id: ChecklistFilter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'pending', label: 'Pendientes' },
  { id: 'packed', label: 'Empacados' },
  { id: 'discarded', label: 'Descartados' },
]

export function ChecklistToolbar({
  query,
  filter,
  resultCount,
  onQueryChange,
  onFilterChange,
}: ChecklistToolbarProps) {
  return (
    <section
      className="tools"
      aria-label="Buscar y filtrar el checklist"
    >
      <div className="tools-head">
        <span>IDX//EQUIPO</span>
        <span className="tools-rule" />
        <strong>{String(resultCount).padStart(2, '0')}</strong>
        <small>REGISTROS</small>
      </div>
      <div className="search-wrap">
        <span
          className="search-signal"
          aria-hidden="true"
        />
        <label
          className="sr-only"
          htmlFor="item-search"
        >
          Buscar equipo
        </label>
        <input
          id="item-search"
          className="search"
          type="search"
          placeholder="Buscar en el inventario…"
          autoComplete="off"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        {query ? (
          <button
            className="search-clear"
            type="button"
            aria-label="Limpiar búsqueda"
            onClick={() => onQueryChange('')}
          >
            ✕
          </button>
        ) : null}
      </div>
      <div
        className="filters"
        aria-label="Filtrar checklist"
      >
        {FILTERS.map((option) => (
          <button
            key={option.id}
            className={`filter ${filter === option.id ? 'on' : ''}`}
            type="button"
            aria-pressed={filter === option.id}
            onClick={() => onFilterChange(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="gesture-hint">
        <span
          className="gesture-arrow"
          aria-hidden="true"
        >
          →
        </span>
        Toca una fila para empacar · desliza o usa “Quitar” para descartarla
      </div>
      <p
        className="result-status sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {resultCount} elementos visibles
      </p>
    </section>
  )
}
