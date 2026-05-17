"use client";

import { useState } from "react";

export function FollowButton() {
  const [following, setFollowing] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setFollowing((f) => !f)}
      className={`bg-transparent text-primary font-data-tabular text-data-tabular px-6 py-3 rounded border border-border-hairline hover:bg-surface-container transition-colors flex items-center gap-2${following ? " bg-surface-container" : ""}`}
    >
      <span className="material-symbols-outlined text-[18px]">
        {following ? "check" : "add"}
      </span>
      <span>{following ? "Following" : "Follow Brand"}</span>
    </button>
  );
}
