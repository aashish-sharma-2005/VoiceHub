import IssueStatus from "./issueStatus";
import IssueMeta from "./issueMeta";

function IssueCard({ issue }) {
  return (
    <article className="issue-card">

      <div className="issue-image-wrapper">

        <img
          src={issue.image}
          alt={issue.title}
          className="issue-image"
        />

        <IssueStatus status={issue.status} />

        <span className="issue-category">
          {issue.category}
        </span>

      </div>

      <div className="issue-content">

        <IssueMeta
          createdAt={issue.createdAt}
          location={issue.location.address}
        />

        <h3>{issue.title}</h3>

        <p>{issue.description}</p>

      </div>

    </article>
  );
}

export default IssueCard;