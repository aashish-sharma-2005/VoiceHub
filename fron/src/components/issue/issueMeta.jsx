import { Clock3, MapPin } from "lucide-react";

function IssueMeta({ createdAt, location }) {
  return (
    <div className="issue-meta">
      <span>
        <Clock3 size={13} />
        {createdAt}
      </span>

      <span>
        <MapPin size={13} />
        {location}
      </span>
    </div>
  );
}

export default IssueMeta;