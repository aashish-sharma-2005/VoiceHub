import {
  BarChart3,
  Compass,
  FilePlus2,
  ClipboardList,
  Bookmark,
  Bell,
  HelpCircle,
  Settings,
  MapPin,
  LogOut,
  Flag,
} from "lucide-react";

import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">

      {/* =========================
          BRAND
      ========================= */}

      <div className="sidebar-brand">

        <div className="sidebar-brand-icon">
          <Flag size={24} />
        </div>

        <div className="sidebar-brand-content">

          <div className="sidebar-brand-title">
            VoiceHub
            <span className="sidebar-live">
              ● LIVE
            </span>
          </div>

          <div className="sidebar-brand-subtitle">
            CIVIC ACTION HUB
          </div>

        </div>

      </div>


      {/* =========================
          REPORT BUTTON
      ========================= */}

      <NavLink
        to="/create-issue"
        className="report-button"
      >
        <FilePlus2 size={20} />
        <span>Report an Issue</span>
      </NavLink>


      {/* =========================
          MAIN MENU
      ========================= */}

      <div className="sidebar-section">

        <div className="sidebar-section-title">
          MAIN MENU
        </div>


        <NavLink
          to="/"
          className="sidebar-link"
        >
          <BarChart3 size={19} />
          <span>Dashboard</span>
        </NavLink>


        <NavLink
          to="/explore"
          className="sidebar-link"
        >
          <Compass size={19} />

          <span>Explore Issues</span>

          <span className="sidebar-active-dot"></span>
        </NavLink>


        <NavLink
          to="/create-issue"
          className="sidebar-link"
        >
          <FilePlus2 size={19} />

          <span>Report an Issue</span>

          <span className="new-badge">
            New
          </span>
        </NavLink>


        <NavLink
          to="/my-issues"
          className="sidebar-link"
        >
          <ClipboardList size={19} />

          <span>My Issues</span>

          <span className="sidebar-count">
            2
          </span>
        </NavLink>


        <button className="sidebar-link">
          <Bookmark size={19} />

          <span>Saved Issues</span>
        </button>


        <NavLink
          to="/notifications"
          className="sidebar-link"
        >
          <Bell size={19} />

          <span>Notifications</span>

          <span className="notification-count">
            3
          </span>
        </NavLink>

      </div>


      {/* =========================
          SYSTEM
      ========================= */}

      <div className="sidebar-section system-section">

        <div className="sidebar-section-title">
          SYSTEM
        </div>


        <button className="sidebar-link">

          <HelpCircle size={19} />

          <span>Help & Support</span>

        </button>


        <button className="sidebar-link">

          <Settings size={19} />

          <span>Settings</span>

        </button>

      </div>


      {/* =========================
          USER
      ========================= */}

      <div className="sidebar-user">

        <div className="sidebar-user-avatar">
          AS
        </div>

        <div className="sidebar-user-info">

          <strong>
            Alex Morgan
          </strong>

          <span>
            <MapPin size={11} />
            Downtown Ward 4
          </span>

        </div>

        <button className="sidebar-logout">
          <LogOut size={17} />
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;