function Header() {
  return (
    <header className="app-header">
      <div className="brand-block">
        <div className="brand-mark" aria-hidden="true">
          RM
        </div>

        <div>
          <p className="eyebrow">Smart purchase tracking</p>
          <h1>Receipt Memory</h1>
        </div>
      </div>

      <nav className="top-nav" aria-label="Main navigation">
        <a href="#dashboard">Dashboard</a>
        <a href="#warranty">Warranty</a>
        <a href="#purchases">Purchases</a>
      </nav>
    </header>
  );
}

export default Header;
