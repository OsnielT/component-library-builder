'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProjectList } from '@/components/projects/project-list';
import { useProjectStore } from '@/lib/store/use-project-store';

export default function ProjectsPage() {
  const router = useRouter();
  const { createProject } = useProjectStore();
  const [isCreating, setIsCreating] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [error, setError] = useState('');

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!projectName.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      createProject(projectName.trim(), projectDescription.trim() || undefined);
      router.push('/editor');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setProjectName('');
    setProjectDescription('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-bold hover:opacity-80">
                Component Library Builder
              </Link>
              <span className="text-muted-foreground">/</span>
              <h1 className="text-xl font-semibold">Projects</h1>
            </div>
            <nav className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Home
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Your Projects</h2>
              <p className="text-muted-foreground">
                Manage your component library projects
              </p>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              + New Project
            </button>
          </div>

          {/* Create Project Form */}
          {isCreating && (
            <div className="mb-8 p-6 border rounded-lg bg-card">
              <h3 className="text-lg font-semibold mb-4">Create New Project</h3>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Project Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="My Component Library"
                    className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    id="description"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="A brief description of your component library"
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
                {error && (
                  <div className="p-3 bg-destructive/10 text-destructive text-sm rounded">
                    {error}
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Create Project
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border rounded-md hover:bg-accent transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Project List */}
          <ProjectList />
        </div>
      </main>
    </div>
  );
}
