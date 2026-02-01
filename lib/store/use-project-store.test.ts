/**
 * Project Store Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore } from './use-project-store';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

describe('useProjectStore', () => {
  beforeEach(() => {
    localStorageMock.clear();
    useProjectStore.setState({
      currentProject: null,
      projects: [],
      isLoading: false,
      error: null,
    });
  });

  it('should create a new project', () => {
    const { createProject } = useProjectStore.getState();

    createProject('Test Project', 'A test project');

    const state = useProjectStore.getState();
    expect(state.currentProject).toBeTruthy();
    expect(state.currentProject?.name).toBe('Test Project');
    expect(state.currentProject?.description).toBe('A test project');
    expect(state.projects).toHaveLength(1);
  });

  it('should save project to localStorage', () => {
    const { createProject } = useProjectStore.getState();

    createProject('Test Project');

    const stored = localStorage.getItem('component-library-builder-projects');
    expect(stored).toBeTruthy();

    const projects = JSON.parse(stored!);
    expect(projects).toHaveLength(1);
    expect(projects[0].name).toBe('Test Project');
  });

  it('should load projects from localStorage', () => {
    // Manually add a project to localStorage
    const project = {
      id: 'test-id',
      name: 'Stored Project',
      description: 'From storage',
      files: {},
      tokens: [],
      components: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      'component-library-builder-projects',
      JSON.stringify([project])
    );

    const { loadProjectsFromStorage } = useProjectStore.getState();
    loadProjectsFromStorage();

    const state = useProjectStore.getState();
    expect(state.projects).toHaveLength(1);
    expect(state.projects[0].name).toBe('Stored Project');
  });

  it('should delete a project', () => {
    const { createProject, deleteProject } = useProjectStore.getState();

    createProject('Project 1');
    createProject('Project 2');

    let state = useProjectStore.getState();
    expect(state.projects).toHaveLength(2);

    const projectId = state.projects[0].id;
    deleteProject(projectId);

    state = useProjectStore.getState();
    expect(state.projects).toHaveLength(1);
    expect(state.projects[0].name).toBe('Project 2');
  });

  it('should update project metadata', () => {
    const { createProject, updateProjectMetadata } = useProjectStore.getState();

    createProject('Original Name', 'Original description');

    updateProjectMetadata('Updated Name', 'Updated description');

    const state = useProjectStore.getState();
    expect(state.currentProject?.name).toBe('Updated Name');
    expect(state.currentProject?.description).toBe('Updated description');
  });

  it('should handle errors gracefully', () => {
    const { updateProjectMetadata } = useProjectStore.getState();

    // Try to update without a current project
    updateProjectMetadata('New Name');

    const state = useProjectStore.getState();
    expect(state.error).toBe('No project to update');
  });
});
