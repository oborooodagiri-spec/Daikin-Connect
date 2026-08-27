
"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{ padding: "50px", fontFamily: "sans-serif" }}>
      <h2 style={{ color: "red" }}>Custom Error Boundary Caught an Error!</h2>
      <p style={{ fontWeight: "bold" }}>Message:</p>
      <pre style={{ background: "#f5f5f5", padding: "10px", borderRadius: "5px", overflow: "auto" }}>
        {error.message}
      </pre>
      <p style={{ fontWeight: "bold", marginTop: "20px" }}>Stack Trace:</p>
      <pre style={{ background: "#f5f5f5", padding: "10px", borderRadius: "5px", overflow: "auto", fontSize: "12px" }}>
        {error.stack}
      </pre>
      <button
        onClick={() => reset()}
        style={{ marginTop: "20px", padding: "10px 20px", background: "black", color: "white", borderRadius: "5px", cursor: "pointer" }}
      >
        Try again
      </button>
    </div>
  );
}

