"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2 } from "lucide-react";

type Category = {
  id: string;
  slug: string;
  name: string;
  articleCount: number;
};

interface Props {
  value: string | null; // categoryId
  onChange: (categoryId: string | null) => void;
}

export default function CategorySelector({ value, onChange }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");

  const loadCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      if (res.ok) {
        setCategories(data.categories || []);
      }
    } catch (e) {
      console.error("Failed to load categories:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const createCategory = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Aanmaken mislukt");
      
      // Add new category to list and select it
      setCategories((prev) => [...prev, data.category]);
      onChange(data.category.id);
      setNewName("");
      setShowNew(false);
    } catch (e: any) {
      setError(e?.message || "Aanmaken mislukt");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        Categorieën laden...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-700">Categorie</label>
      
      <div className="flex gap-2">
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value || null)}
          className="flex-1 text-sm border border-zinc-200 rounded-lg px-3 py-2"
        >
          <option value="">Geen categorie</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setShowNew(!showNew)}
          className="p-2 border border-zinc-200 rounded-lg hover:bg-zinc-50 text-zinc-600"
          title="Nieuwe categorie"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {showNew && (
        <div className="p-3 bg-zinc-50 rounded-lg space-y-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nieuwe categorie naam..."
            className="w-full text-sm border border-zinc-200 rounded px-3 py-2"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                createCategory();
              }
            }}
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={createCategory}
              disabled={creating || !newName.trim()}
              className="px-3 py-1.5 text-sm bg-coral text-white rounded hover:bg-coral/90 disabled:opacity-50"
            >
              {creating ? "Aanmaken..." : "Toevoegen"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowNew(false);
                setNewName("");
                setError("");
              }}
              className="px-3 py-1.5 text-sm border border-zinc-200 rounded hover:bg-zinc-100"
            >
              Annuleren
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-zinc-400">
        Lege categorieën worden automatisch verwijderd
      </p>
    </div>
  );
}
