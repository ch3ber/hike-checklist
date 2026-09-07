type ActionDockProps = {
  onOpenManifest: () => void;
  onReset: () => void;
};

export function ActionDock({ onOpenManifest, onReset }: ActionDockProps) {
  return (
    <nav className="dock" aria-label="Acciones de la lista">
      <div className="dock-in">
        <button className="btn" type="button" onClick={onOpenManifest}>
          VER CARGA
        </button>
        <button
          className="btn btn-g"
          type="button"
          title="Desmarcar todo"
          aria-label="Desmarcar todo"
          onClick={onReset}
        >
          ✕
        </button>
      </div>
    </nav>
  );
}
