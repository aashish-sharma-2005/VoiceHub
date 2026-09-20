import { Bell, Search, UserRound } from "lucide-react";

function Navbar() {
  return (
    <header className="navbar">

      <div className="navbar-search">
        <Search size={18} />

        <input
          type="text"
          placeholder="Search issues..."
        />
      </div>

      <div className="navbar-actions">

        <button className="navbar-notification">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>

        <button className="navbar-user">
          <div className="navbar-user-avatar">
            <UserRound size={18} />
          </div>

          <span>Alex</span>
        </button>

      </div>

    </header>
  );
}

export default Navbar;