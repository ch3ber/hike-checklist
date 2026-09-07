import { animate } from "animejs";
import {
  useRef,
  type Dispatch,
  type SetStateAction,
  type TouchEvent as ReactTouchEvent,
} from "react";
import type { TrekItem, TrekState } from "../../types/trek";
import { formatPreciseWeight, getQuantity, getWeight } from "./trek-utils";

type ChecklistItemProps = {
  item: TrekItem;
  custom: boolean;
  state: TrekState;
  setState: Dispatch<SetStateAction<TrekState>>;
};

export function ChecklistItem({
  item,
  custom,
  state,
  setState,
}: ChecklistItemProps) {
  const row = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const checkbox = useRef<HTMLButtonElement>(null);
  const gesture = useRef({ x: 0, y: 0, dx: 0, dragging: false });
  const checked = Boolean(state.chk[item.id]);
  const discarded = Boolean(state.off[item.id]);
  const quantity = getQuantity(item, state);
  const weight = getWeight(item, state);

  const toggleChecked = () => {
    if (discarded) return;
    setState((current) => ({
      ...current,
      chk: { ...current.chk, [item.id]: !current.chk[item.id] },
    }));
    if (!checked && checkbox.current) {
      animate(checkbox.current, {
        scale: [1, 1.32, 1],
        duration: 280,
        ease: "outBack",
      });
    }
  };

  const toggleDiscarded = () => {
    setState((current) => {
      const nextOff = { ...current.off };
      if (current.off[item.id]) delete nextOff[item.id];
      else nextOff[item.id] = true;
      return {
        ...current,
        off: nextOff,
        chk: current.off[item.id]
          ? current.chk
          : { ...current.chk, [item.id]: false },
      };
    });
  };

  const setQuantity = (value: number) => {
    if (!item.q || !Number.isFinite(value)) return;
    setState((current) => ({
      ...current,
      qty: {
        ...current.qty,
        [item.id]: Math.max(item.q!.min, Math.round(value * 100) / 100),
      },
    }));
  };

  const setTotalWeight = (value: number) => {
    if (!Number.isFinite(value) || value < 0) return;
    setState((current) => ({
      ...current,
      wov: { ...current.wov, [item.id]: value / (quantity || 1) },
    }));
  };

  const remove = () => {
    if (!confirm(`¿Borrar “${item.n}” de Extras?`)) return;
    setState((current) => {
      const omit = <T,>(record: Record<string, T>) =>
        Object.fromEntries(
          Object.entries(record).filter(([id]) => id !== item.id),
        );
      return {
        ...current,
        extra: current.extra.filter((entry) => entry.id !== item.id),
        chk: omit(current.chk),
        qty: omit(current.qty),
        wov: omit(current.wov),
        off: omit(current.off),
      };
    });
  };

  const startSwipe = (event: ReactTouchEvent<HTMLDivElement>) => {
    if ((event.target as Element).closest("button,input")) return;
    const touch = event.touches[0];
    gesture.current = {
      x: touch.clientX,
      y: touch.clientY,
      dx: 0,
      dragging: true,
    };
    if (inner.current) inner.current.style.transition = "none";
  };

  const moveSwipe = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (!gesture.current.dragging || !inner.current) return;
    const touch = event.touches[0];
    const deltaX = touch.clientX - gesture.current.x;
    const deltaY = touch.clientY - gesture.current.y;
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 8) {
      gesture.current.dragging = false;
      inner.current.style.transform = "";
      return;
    }
    gesture.current.dx = Math.max(0, Math.min(deltaX, 140));
    inner.current.style.transform = `translateX(${gesture.current.dx}px)`;
  };

  const endSwipe = () => {
    if (!gesture.current.dragging || !inner.current) return;
    const shouldToggle = gesture.current.dx >= 76;
    gesture.current.dragging = false;
    inner.current.style.transition = "transform .22s cubic-bezier(.2,.8,.2,1)";
    inner.current.style.transform = "";
    if (shouldToggle) toggleDiscarded();
  };

  return (
    <div
      className={`row ${checked ? "on" : ""} ${discarded ? "off" : ""}`}
      ref={row}
      data-row={item.id}
      onTouchStart={startSwipe}
      onTouchMove={moveSwipe}
      onTouchEnd={endSwipe}
      onTouchCancel={endSwipe}
    >
      <div className="row-bg">
        <span>{discarded ? "RESTAURAR" : "DESCARTAR"}</span>
      </div>
      <div
        className="row-in"
        ref={inner}
        onClick={(event) => {
          if ((event.target as Element).closest("input,button")) return;
          toggleChecked();
        }}
      >
        <button
          className="cb"
          ref={checkbox}
          type="button"
          role="checkbox"
          aria-checked={checked}
          aria-label={item.n}
          onClick={toggleChecked}
        />
        <div className="rt">
          <div className="rn">{item.n}</div>
          {item.note ? <div className="rnote">{item.note}</div> : null}
          {item.q ? (
            <div className="qty">
              <button
                className="qb"
                type="button"
                aria-label={`Reducir ${item.n}`}
                onClick={() => setQuantity(quantity - item.q!.s)}
              >
                −
              </button>
              <input
                className="qv"
                type="number"
                inputMode="decimal"
                aria-label={`Cantidad en ${item.q.u}`}
                min={item.q.min}
                step={item.q.s}
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
              />
              <button
                className="qb"
                type="button"
                aria-label={`Aumentar ${item.n}`}
                onClick={() => setQuantity(quantity + item.q!.s)}
              >
                +
              </button>
              <span className="qlab">{item.q.u}</span>
            </div>
          ) : null}
        </div>
        <div className="wc">
          <input
            className="wi"
            type="number"
            inputMode="decimal"
            aria-label={`Peso total de ${item.n} en kilos`}
            min="0"
            step="0.005"
            value={formatPreciseWeight(weight)}
            onFocus={(event) => event.currentTarget.select()}
            onChange={(event) => setTotalWeight(Number(event.target.value))}
          />
          <span className="wu">KG</span>
        </div>
        <button
          className="act"
          type="button"
          aria-label={`${discarded ? "Restaurar" : "Descartar"} ${item.n}`}
          onClick={toggleDiscarded}
        >
          {discarded ? "↺" : "⊘"}
        </button>
        {custom ? (
          <button
            className="act del"
            type="button"
            aria-label={`Borrar ${item.n}`}
            onClick={remove}
          >
            ⌫
          </button>
        ) : null}
      </div>
    </div>
  );
}
