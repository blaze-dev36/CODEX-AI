export default function SearchBar({ value, onChange }) {
  return (
    <div className="form-field" style={{ marginBottom: "1rem" }}>
      <label htmlFor="plugin-search">Search plugins</label>
      <input
        id="plugin-search"
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Find a plugin by name or author"
      />
    </div>
  );
}
