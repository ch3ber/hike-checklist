import { useState } from "react";
import type { TrekItem } from "../../types/trek";

type AddItemFormProps = {
  onAdd: (item: TrekItem) => void;
  onMessage: (message: string) => void;
};

export function AddItemForm({ onAdd, onMessage }: AddItemFormProps) {
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [quantity, setQuantity] = useState("1");

  const addItem = () => {
    const itemName = name.trim();
    if (!itemName) {
      onMessage("Ponle un nombre al ítem");
      return;
    }
    const itemQuantity = Math.max(1, Number.parseInt(quantity, 10) || 1);
    const item: TrekItem = {
      id: `ex${Date.now().toString(36)}${Math.floor(Math.random() * 900 + 100)}`,
      n: itemName,
      w: Math.max(0, Number.parseFloat(weight) || 0),
      ...(itemQuantity > 1
        ? { q: { u: "piezas", d: itemQuantity, s: 1, min: 0 } }
        : {}),
    };
    onAdd(item);
    setName("");
    setWeight("");
    setQuantity("1");
  };

  return (
    <div className="addf">
      <input
        className="afn"
        aria-label="Nombre del ítem"
        placeholder="Nombre del ítem"
        value={name}
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => event.key === "Enter" && addItem()}
      />
      <div className="afr">
        <input
          className="afw"
          aria-label="Peso unitario en kilos"
          inputMode="decimal"
          min="0"
          placeholder="kg"
          step="0.005"
          type="number"
          value={weight}
          onChange={(event) => setWeight(event.target.value)}
        />
        <input
          className="afq"
          aria-label="Cantidad"
          inputMode="numeric"
          min="1"
          step="1"
          type="number"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
        />
        <button className="afb" type="button" onClick={addItem}>
          AGREGAR
        </button>
      </div>
    </div>
  );
}
