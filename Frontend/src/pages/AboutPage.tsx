export function AboutPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">About</h1>
      </div>

      <div className="about-card">
        <h2>TravelHub AI</h2>
        <p>
          TravelHub AI is a full-stack vacations platform built as a final project for the John Bryce Full Stack
          Web Developer track. Registered users can browse vacations, like the ones they'd love to take, and get
          AI-generated travel recommendations. Administrators manage the vacation catalog and review engagement
          through a live report.
        </p>
        <p>
          Built with React &amp; TypeScript on the client, Express &amp; TypeScript with MongoDB on the server, and
          OpenAI for both the recommendation engine and the natural-language MCP data assistant.
        </p>

        <h2 style={{ marginTop: 24 }}>Developer</h2>
        <p>
          Built by <strong>MordehAI</strong> as a final project for the John Bryce Full Stack Web Developer track.
        </p>
      </div>
    </div>
  );
}
