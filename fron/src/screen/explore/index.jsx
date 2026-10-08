import { useMemo, useState } from "react";

import Explore from "../../components/explore/explore";
import { getIssues } from "../../services/issueService";

function ExploreScreen() {

  const { issues } = getIssues();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [location, setLocation] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("most-upvoted");
  const [view, setView] = useState("grid");

  const categories = useMemo(() => {

    return [
      ...new Set(
        issues
          .map((issue) => issue.category)
          .filter(Boolean)
      ),
    ];

  }, [issues]);

  const locations = useMemo(() => {

    return [
      ...new Set(
        issues
          .map((issue) => issue.location?.address)
          .filter(Boolean)
      ),
    ];

  }, [issues]);

  const filteredIssues = useMemo(() => {

    let result = [...issues];

    if (search.trim()) {

      const searchText = search.toLowerCase();

      result = result.filter((issue) => {

        const title =
          issue.title?.toLowerCase() || "";

        const description =
          issue.description?.toLowerCase() || "";

        const issueCategory =
          issue.category?.toLowerCase() || "";

        const issueLocation =
          issue.location?.address?.toLowerCase() || "";

        return (
          title.includes(searchText) ||
          description.includes(searchText) ||
          issueCategory.includes(searchText) ||
          issueLocation.includes(searchText)
        );

      });

    }

    if (category !== "all") {

      result = result.filter(
        (issue) => issue.category === category
      );

    }

    if (location !== "all") {

      result = result.filter(
        (issue) =>
          issue.location?.address === location
      );

    }

    if (status !== "all") {

      result = result.filter(
        (issue) =>
          issue.status?.toLowerCase() === status
      );

    }

    if (sort === "most-upvoted") {

      result.sort(
        (a, b) =>
          (b.votes || 0) - (a.votes || 0)
      );

    }

    return result;

  }, [
    issues,
    search,
    category,
    location,
    status,
    sort,
  ]);

  const statusCounts = useMemo(() => {

    return {
      inProgress: issues.filter(
        (issue) =>
          issue.status?.toLowerCase() === "in-progress"
      ).length,

      reviewing: issues.filter(
        (issue) =>
          issue.status?.toLowerCase() === "reviewing"
      ).length,

      resolved: issues.filter(
        (issue) =>
          issue.status?.toLowerCase() === "resolved"
      ).length,
    };

  }, [issues]);

  const resetFilters = () => {

    setSearch("");
    setCategory("all");
    setLocation("all");
    setStatus("all");
    setSort("most-upvoted");

  };

  return (
    <Explore
      issues={filteredIssues}
      total={filteredIssues.length}
      search={search}
      setSearch={setSearch}
      category={category}
      setCategory={setCategory}
      location={location}
      setLocation={setLocation}
      status={status}
      setStatus={setStatus}
      sort={sort}
      setSort={setSort}
      view={view}
      setView={setView}
      resetFilters={resetFilters}
      categories={categories}
      locations={locations}
      statusCounts={statusCounts}
    />
  );
}

export default ExploreScreen;