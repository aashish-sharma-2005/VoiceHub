function IssueStatus({ status }) {
  const statusText = {
    "in-progress": "In Progress",
    reviewing: "Reviewing",
    resolved: "Resolved",
  };

  return (
    <span className={`issue-status issue-status-${status}`}>
      ● {statusText[status] || status}
    </span>
  );
}

export default IssueStatus;