type ActionDockProps = {
  onOpenManifest: () => void
  onReset: () => void
}

export function ActionDock({ onOpenManifest, onReset }: ActionDockProps) {
  return (
    <nav
      className="dock"
      aria-label="Acciones de la lista"
    >
      <div className="dock-in">
        <button
          className="btn"
          type="button"
          onClick={onOpenManifest}
        >
          <span>VER EMPACADOS</span>
          <span
            className="btn-arrow"
            aria-hidden="true"
          >
            ↗
          </span>
        </button>
        <button
          className="btn btn-g"
          type="button"
          title="Reiniciar empacados"
          aria-label="Reiniciar empacados"
          onClick={onReset}
        >
          <span aria-hidden="true">↺</span>
          <span>REINICIAR</span>
        </button>
      </div>
    </nav>
  )
}
