type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
};

export default function SearchBar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  categories,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search courses..."
          className="bg-brand-card border border-brand-border rounded-xl pl-4 pr-4 py-2 text-sm text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-primary/60 transition-colors"
        />
      </div>
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="bg-brand-card border border-brand-border rounded-xl px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-primary/60 transition-colors">
        <option value="ALL">All categories</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

    </div>
  );
}