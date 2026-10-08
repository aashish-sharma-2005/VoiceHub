import { useEffect, useState } from "react";

import {
  Megaphone,
  CheckCircle2,
  Clock3,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Wrench,
  Trash2,
  TreePine,
  Lightbulb,
  MapPin,
  MessageCircle,
  ThumbsUp,
} from "lucide-react";

import { getDashboardData } from "../../services/dashboardServices";

import "./home.css";

const categoryIcons = {
  "Roads & Transit": Wrench,
  "Sanitation & Garbage": Trash2,
  "Environment & Parks": TreePine,
  "Water & Electricity": Lightbulb,
  Other: AlertCircle,
};

const categoryClasses = {
  "Roads & Transit": "purple-bar",
  "Sanitation & Garbage": "green-bar",
  "Environment & Parks": "orange-bar",
  "Water & Electricity": "blue-bar",
  Other: "purple-bar",
};

const getActivityIcon = (status) => {
  switch (status) {
    case "Resolved":
      return {
        icon: CheckCircle2,
        className: "activity-green",
      };

    case "In Progress":
      return {
        icon: Wrench,
        className: "activity-orange",
      };

    case "Under Review":
      return {
        icon: AlertCircle,
        className: "activity-blue",
      };

    default:
      return {
        icon: Clock3,
        className: "activity-blue",
      };
  }
};

const getTimeAgo = (date) => {
  if (!date) return "";

  const now = new Date();
  const created = new Date(date);

  const difference = Math.floor((now - created) / 1000);

  if (difference < 60) {
    return `${difference} seconds ago`;
  }

  const minutes = Math.floor(difference / 60);

  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }

  const days = Math.floor(hours / 24);

  return `${days} ${days === 1 ? "day" : "days"} ago`;
};

const getStatusClass = (status) => {
  switch (status) {
    case "Under Review":
      return "review";

    case "In Progress":
      return "in-progress";

    case "Resolved":
      return "resolved";

    case "Submitted":
    default:
      return "submitted";
  }
};

function Home() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getDashboardData();

        setDashboardData(data);
      } catch (error) {
        console.error("Dashboard fetch error:", error);

        setError(
          "Unable to load dashboard data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <div>
            <div className="breadcrumb">
              Community Voice <span>›</span> Dashboard
            </div>

            <h1>Community Dashboard</h1>

            <p>Loading community data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <div>
            <div className="breadcrumb">
              Community Voice <span>›</span> Dashboard
            </div>

            <h1>Community Dashboard</h1>

            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const {
    stats,
    categories,
    recentActivity,
    trendingIssues,
    civicProgress,
  } = dashboardData;

  const statsData = [
    {
      title: "Total Issues",
      value: stats.totalIssues,
      description: "total reported issues",
      type: "neutral",
      icon: Megaphone,
      iconClass: "purple",
    },
    {
      title: "Resolved",
      value: stats.resolved,
      description: "successfully resolved",
      type: "up",
      icon: CheckCircle2,
      iconClass: "green",
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      description: "currently being worked on",
      type: "neutral",
      icon: Wrench,
      iconClass: "orange",
    },
    {
      title: "Pending",
      value: stats.pending,
      description: "waiting for review",
      type: "down",
      icon: Clock3,
      iconClass: "blue",
    },
  ];

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <div className="breadcrumb">
            Community Voice <span>›</span> Dashboard
          </div>

          <h1>Community Dashboard</h1>

          <p>
            Stay updated with issues, community activity, and civic progress
            in your area.
          </p>
        </div>

        <button className="dashboard-report-btn">
          <Megaphone size={18} />
          Report Issue
        </button>
      </div>

      {/* Welcome */}
      <div className="dashboard-welcome">
        <div>
          <span className="welcome-label">COMMUNITY OVERVIEW</span>

          <h2>Your community at a glance</h2>

          <p>
            Track reported issues and see how your community is making
            progress.
          </p>
        </div>

        <div className="welcome-location">
          <MapPin size={17} />
          <span>Community Area</span>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        {statsData.map((stat) => {
          const Icon = stat.icon;

          return (
            <div className="stat-card" key={stat.title}>
              <div className="stat-card-top">
                <div className={`stat-icon ${stat.iconClass}`}>
                  <Icon size={20} />
                </div>
              </div>

              <div className="stat-title">{stat.title}</div>

              <div className="stat-value">{stat.value}</div>

              <div className={`stat-change ${stat.type}`}>
                {stat.type === "up" && <ArrowUpRight size={15} />}

                {stat.type === "down" && <ArrowDownRight size={15} />}

                {stat.type === "neutral" && (
                  <span className="small-dot" />
                )}

                <span>{stat.description}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="dashboard-main-grid">
        {/* Issue Distribution */}
        <div className="dashboard-card distribution-card">
          <div className="card-header">
            <div>
              <h3>Issue Distribution</h3>
              <p>Reported issues by category</p>
            </div>

            <button className="card-action">View all</button>
          </div>

          <div className="category-list">
            {categories.length === 0 ? (
              <p>No issues reported yet.</p>
            ) : (
              categories.map((category) => {
                const Icon =
                  categoryIcons[category.name] || AlertCircle;

                const className =
                  categoryClasses[category.name] || "purple-bar";

                return (
                  <div className="category-item" key={category.name}>
                    <div className="category-info">
                      <div className="category-name">
                        <span className="category-icon">
                          <Icon size={15} />
                        </span>

                        {category.name}
                      </div>

                      <div className="category-count">
                        {category.percentage}%{" "}
                        <span>({category.count} issues)</span>
                      </div>
                    </div>

                    <div className="progress-track">
                      <div
                        className={`progress-bar ${className}`}
                        style={{
                          width: `${category.percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-card activity-card">
          <div className="card-header">
            <div>
              <h3>Recent Activity</h3>
              <p>Latest community updates</p>
            </div>

            <button className="card-action">View all</button>
          </div>

          <div className="activity-list">
            {recentActivity.length === 0 ? (
              <p>No recent activity.</p>
            ) : (
              recentActivity.map((activity) => {
                const activityStyle = getActivityIcon(
                  activity.status
                );

                const Icon = activityStyle.icon;

                return (
                  <div className="activity-item" key={activity.title}>
                    <div
                      className={`activity-icon ${activityStyle.className}`}
                    >
                      <Icon size={17} />
                    </div>

                    <div className="activity-content">
                      <h4>{activity.title}</h4>

                      <p>
                        {activity.category} <span>•</span>{" "}
                        {getTimeAgo(activity.time)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="dashboard-bottom-grid">
        {/* Trending Issues */}
        <div className="dashboard-card trending-card">
          <div className="card-header">
            <div>
              <h3>Trending Issues</h3>
              <p>Issues getting the most community attention</p>
            </div>

            <button className="card-action">Explore</button>
          </div>

          <div className="trending-list">
            {trendingIssues.length === 0 ? (
              <p>No trending issues yet.</p>
            ) : (
              trendingIssues.map((issue, index) => (
                <div className="trending-item" key={issue.title}>
                  <div className="trending-number">
                    0{index + 1}
                  </div>

                  <div className="trending-content">
                    <h4>{issue.title}</h4>

                    <div className="trending-meta">
                      <span>
                        <MapPin size={13} />
                        {issue.location}
                      </span>

                      <span>
                        <ThumbsUp size={13} />
                        {issue.votes}
                      </span>

                      <span>
                        <MessageCircle size={13} />
                        {issue.comments}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`status-badge ${getStatusClass(
                      issue.status
                    )}`}
                  >
                    {issue.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Civic Progress */}
        <div className="dashboard-card progress-card">
          <div className="card-header">
            <div>
              <h3>Civic Progress</h3>
              <p>Current issue status</p>
            </div>
          </div>

          <div className="civic-progress">
            <div className="progress-circle">
              <div>
                <strong>
                  {civicProgress.resolvedPercentage}%
                </strong>

                <span>Resolved</span>
              </div>
            </div>

            <div className="progress-details">
              <div>
                <span className="legend-dot submitted" />
                <span>Submitted</span>
                <strong>{civicProgress.submitted}</strong>
              </div>

              <div>
                <span className="legend-dot review" />
                <span>Under Review</span>
                <strong>{civicProgress.underReview}</strong>
              </div>

              <div>
                <span className="legend-dot progress" />
                <span>In Progress</span>
                <strong>{civicProgress.inProgress}</strong>
              </div>

              <div>
                <span className="legend-dot resolved" />
                <span>Resolved</span>
                <strong>{civicProgress.resolved}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;