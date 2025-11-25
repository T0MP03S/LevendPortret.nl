"use client";

import { useState } from "react";
import { LayoutGrid, List, Search, X } from "lucide-react";

type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  thumbnailUrl: string | null;
  category: string; // category slug
  categoryName?: string; // category display name
  publishedAt: string | null;
};

type Category = {
  slug: string;
  name: string;
};

export default function ArticleList({
  articles,
  categories,
}: {
  articles: Article[];
  categories: Category[];
}) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter by category and search
  const filtered = articles.filter((a) => {
    const matchesCategory = !selectedCategory || a.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.excerpt && a.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });
  
  // Get category name from slug
  const getCategoryName = (slug: string) => {
    const cat = categories.find((c) => c.slug === slug);
    return cat?.name || slug;
  };

  return (
    <div>
      {/* Search bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Zoek artikelen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 rounded"
            >
              <X className="w-4 h-4 text-zinc-400" />
            </button>
          )}
        </div>
      </div>

      {/* Filters and view toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !selectedCategory
                ? "bg-coral text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            Alles
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat.slug
                  ? "bg-coral text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-zinc-100 rounded-lg p-1">
          <button
            onClick={() => setView("grid")}
            className={`p-2 rounded-md transition-colors ${
              view === "grid" ? "bg-white shadow-sm" : "hover:bg-zinc-200"
            }`}
            title="Grid weergave"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-2 rounded-md transition-colors ${
              view === "list" ? "bg-white shadow-sm" : "hover:bg-zinc-200"
            }`}
            title="Lijst weergave"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Articles */}
      {filtered.length === 0 ? (
        <p className="text-center text-zinc-500 py-12">
          Geen artikelen gevonden.
        </p>
      ) : view === "grid" ? (
        <div className="grid md:grid-cols-2 gap-5">
          {filtered.map((article) => (
            <a
              key={article.id}
              href={`/${article.category}/${article.slug}`}
              className="group bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {article.thumbnailUrl ? (
                <div className="aspect-[16/9] bg-zinc-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={article.thumbnailUrl}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="aspect-[16/9] bg-gradient-to-br from-navy/10 to-coral/10" />
              )}
              <div className="p-4 h-[140px] flex flex-col">
                <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-zinc-100">
                    {article.categoryName || getCategoryName(article.category)}
                  </span>
                  {article.publishedAt && (
                    <span>
                      {new Date(article.publishedAt).toLocaleDateString("nl-NL")}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-lg text-navy group-hover:text-coral transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="mt-1.5 text-sm text-zinc-600 line-clamp-2 flex-1">
                  {article.excerpt || ''}
                </p>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((article) => (
            <a
              key={article.id}
              href={`/${article.category}/${article.slug}`}
              className="group flex gap-4 bg-white border border-zinc-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              {article.thumbnailUrl ? (
                <div className="w-32 h-[72px] flex-shrink-0 bg-zinc-100 rounded-lg overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={article.thumbnailUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-[72px] flex-shrink-0 bg-gradient-to-br from-navy/10 to-coral/10 rounded-lg" />
              )}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                  <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-[11px]">
                    {article.categoryName || getCategoryName(article.category)}
                  </span>
                  {article.publishedAt && (
                    <span className="text-[11px]">
                      {new Date(article.publishedAt).toLocaleDateString("nl-NL")}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-lg text-navy group-hover:text-coral transition-colors line-clamp-1">
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="text-sm text-zinc-500 line-clamp-1 mt-1">
                    {article.excerpt}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
