import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-5xl w-full text-center">
        <h1 className="text-6xl font-bold mb-6">Component Library Builder</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Build React component libraries with design tokens in your browser
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">🎨 Design Tokens</h3>
            <p className="text-sm text-muted-foreground">
              Visual token editor following W3C Design Tokens Format
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">⚡ Live Preview</h3>
            <p className="text-sm text-muted-foreground">
              See your components update in real-time as you code
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">📦 Export</h3>
            <p className="text-sm text-muted-foreground">
              Download your library or push to GitHub
            </p>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/projects"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8"
          >
            View Projects
          </Link>
          <Link
            href="/editor"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 px-8"
          >
            Quick Start
          </Link>
        </div>
      </div>
    </main>
  );
}
