function SearchBar({ value, onChange, onClear }) {
  return (
    <div className="search-panel">
      <label className="search-field" htmlFor="purchase-search">
        <span className="search-icon" aria-hidden="true">
          ⌕
        </span>

        <input
          id="purchase-search"
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search by product or store..."
          aria-label="Search purchases"
        />
      </label>

      {value && (
        <button type="button" className="ghost-button" onClick={onClear}>
          Clear
        </button>
      )}
    </div>
  );
}

export default SearchBar;
