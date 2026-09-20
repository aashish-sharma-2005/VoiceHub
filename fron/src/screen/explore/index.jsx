import {
  Search,
  MapPin,
  ChevronDown,
  ArrowUpDown,
  RotateCcw,
  Navigation,
  CircleAlert,
  Wrench,
  Trash2,
  CheckCircle2,
} from "lucide-react";

import IssueCard from "../../components/issue/issueCard";
import { getIssues } from "../../services/issueService";

function Explore() {
  // Temporary dummy data through service layer.
  // Later this same function will fetch data from the backend.
  const { issues, total } = getIssues();

  return (
    <div className="explore-page">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="explore-header">

        <div>

          <div className="breadcrumb">
            <span>Community Voice</span>
            <span>›</span>
            <span>Explore Community Issues</span>
            <span>›</span>
            <span>Metro Region</span>
          </div>

          <h1>
            Explore Community Issues
          </h1>

        </div>


        <div className="explore-header-actions">

          <div className="view-toggle">

            <button
              type="button"
              className="view-button active"
            >
              ▦ Grid
            </button>

            <button
              type="button"
              className="view-button"
            >
              ☰ Compact
            </button>

          </div>


          <button
            type="button"
            className="header-report-button"
          >
            ⚑ Report Issue
          </button>

        </div>

      </div>


      {/* =========================
          INTRO
      ========================= */}

      <div className="explore-intro">
        Discover problems reported by people around you and make your voice count.
      </div>


      {/* =========================
          FILTER PANEL
      ========================= */}

      <section className="filter-panel">

        <div className="filter-row">

          {/* Search */}

          <div className="large-search">

            <Search size={19} />

            <input
              type="text"
              placeholder="Search problems, locations or categories..."
            />

            <span className="search-shortcut">
              ⌘K
            </span>

          </div>


          {/* Category */}

          <button
            type="button"
            className="filter-select"
          >
            <span>All Categories</span>
            <ChevronDown size={17} />
          </button>


          {/* Location */}

          <button
            type="button"
            className="filter-select"
          >
            <span>All Locations</span>
            <ChevronDown size={17} />
          </button>


          {/* Status */}

          <button
            type="button"
            className="filter-select small"
          >
            <span>All Statuses</span>
            <ChevronDown size={17} />
          </button>


          {/* Sort */}

          <button
            type="button"
            className="filter-select sort"
          >
            <span>Most Upvoted</span>

            <ArrowUpDown size={15} />

            <ChevronDown size={15} />
          </button>


          {/* Reset */}

          <button
            type="button"
            className="reset-button"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>

        </div>


        {/* Active Filters */}

        <div className="active-filter-row">

          <span className="active-label">
            ACTIVE:
          </span>

          <span className="filter-chip">
            Radius: 5 km ×
          </span>

          <span className="filter-chip">
            Verified Reports Only ×
          </span>

          <span className="realtime-text">
            Showing real-time community records
          </span>

        </div>

      </section>


      {/* =========================
          RESULTS SUMMARY
      ========================= */}

      <section className="results-summary">

        <div className="results-left">

          <strong>
            {total} Issues Found
          </strong>

          <span className="radius-badge">
            Within 5km radius
          </span>

        </div>


        <div className="results-status">

          <span>
            Filter summary:
          </span>

          <span className="status-summary orange">
            ● 42 In Progress
          </span>

          <span className="status-summary blue">
            ● 31 Reviewing
          </span>

          <span className="status-summary green">
            ● 18 Resolved
          </span>

        </div>

      </section>


      {/* =========================
          CONTENT GRID
      ========================= */}

      <section className="explore-content">

        {/* =========================
            ISSUES
        ========================= */}

        <div className="issues-grid">

          {issues.map((issue) => (
            <IssueCard
              key={issue._id}
              issue={issue}
            />
          ))}

        </div>


        {/* =========================
            NEARBY ISSUES RADAR
        ========================= */}

        <div className="nearby-panel">

          <div className="nearby-header">

            <div>

              <h2>
                Issues Near You
              </h2>

              <p>
                Live civic geospatial radar
              </p>

            </div>


            <span className="radius-control">

              <Navigation size={13} />

              Radius: 5km

            </span>

          </div>


          {/* Radar */}

          <div className="radar">

            <div className="radar-circle circle-one"></div>

            <div className="radar-circle circle-two"></div>

            <div className="radar-circle circle-three"></div>


            {/* Current Location */}

            <div className="radar-marker center">
              ●
            </div>


            {/* Resolved */}

            <div className="radar-marker green-marker">
              <CheckCircle2 size={17} />
            </div>


            {/* Issue */}

            <div className="radar-marker orange-marker">
              <CircleAlert size={16} />
            </div>


            {/* Issue */}

            <div className="radar-marker orange-marker-two">
              <CircleAlert size={16} />
            </div>


            {/* Maintenance */}

            <div className="radar-marker blue-marker">
              <Wrench size={15} />
            </div>


            {/* Waste */}

            <div className="radar-marker purple-marker">
              <Trash2 size={15} />
            </div>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Explore;