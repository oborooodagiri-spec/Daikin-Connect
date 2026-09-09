
import React from "react";
import { renderToString } from "react-dom/server";
import LiveDataClient from "./src/app/admin/live-data/LiveDataClient";

try {
  const html = renderToString(
    <LiveDataClient isAdmin={true} canClickWidgets={true} sessionName="Test" sessionId={1} avatarUrl={null} />
  );
  console.log("SSR Success! Length:", html.length);
} catch (e) {
  console.error("SSR Crash:", e);
}

