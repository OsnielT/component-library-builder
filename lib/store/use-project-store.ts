/**
 * Project Store
 * Manages project state and persistence with localStorage
 */

import { create } from 'zustand';
import type { Project } from '@/types';
import { useTokenStore } from './use-token-store';
import { useComponentStore } from './use-component-store';
import { useEditorStore } from './use-editor-store';

interface ProjectState {
  currentProject: Project | null;
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  
  // Project CRUD operations
  createProject: (name: string, description?: string) => void;
  loadProject: (id: string) => void;
  saveProject: () => void;
  deleteProject: (id: string) => void;
  updateProjectMetadata: (name: string, description?: string) => void;
  
  // Initialization
  loadProjectsFromStorage: () => void;
}

const STORAGE_KEY = 'component-library-builder-projects';

// Helper to generate unique IDs
const generateId = () => `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Helper to load projects from localStorage
const loadFromStorage = (): Project[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const projects = JSON.parse(stored) as Project[];
    // Convert date strings back to Date objects
    return projects.map((p) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
    }));
  } catch (error) {
    console.error('Failed to load projects from localStorage:', error);
    return [];
  }
};

// Helper to save projects to localStorage
const saveToStorage = (projects: Project[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Failed to save projects to localStorage:', error);
    throw new Error('Failed to save projects. Storage may be full.');
  }
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  currentProject: null,
  projects: [],
  isLoading: false,
  error: null,

  createProject: (name, description) => {
    const newProject: Project = {
      id: generateId(),
      name,
      description,
      files: {},
      tokens: [],
      components: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => {
      const updatedProjects = [...state.projects, newProject];
      saveToStorage(updatedProjects);
      
      return {
        projects: updatedProjects,
        currentProject: newProject,
        error: null,
      };
    });

    // Clear all stores for new project
    useTokenStore.getState().clearTokens();
    useComponentStore.getState().clearComponents();
    useEditorStore.getState().reset();
  },

  loadProject: (id) => {
    set({ isLoading: true, error: null });

    try {
      const { projects } = get();
      const project = projects.find((p) => p.id === id);

      if (!project) {
        set({ isLoading: false, error: 'Project not found' });
        return;
      }

      // Load project data into respective stores
      const tokenStore = useTokenStore.getState();
      const componentStore = useComponentStore.getState();
      const editorStore = useEditorStore.getState();

      // Clear current selections
      tokenStore.selectToken(null);
      componentStore.selectComponent(null);

      // Reset editor files
      editorStore.reset();

      // Load project files
      Object.entries(project.files).forEach(([path, content]) => {
        editorStore.addFile(path, content);
      });

      // Load tokens directly (this will also regenerate CSS)
      tokenStore.setTokens(project.tokens);

      // Load components directly
      componentStore.setComponents(project.components);

      set({
        currentProject: project,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load project',
      });
    }
  },

  saveProject: () => {
    const { currentProject, projects } = get();

    if (!currentProject) {
      set({ error: 'No project to save' });
      return;
    }

    try {
      // Gather current state from all stores
      const tokenStore = useTokenStore.getState();
      const componentStore = useComponentStore.getState();
      const editorStore = useEditorStore.getState();

      // Update project with current state
      const updatedProject: Project = {
        ...currentProject,
        files: editorStore.files,
        tokens: tokenStore.tokens,
        components: componentStore.components,
        updatedAt: new Date(),
      };

      // Update projects list
      const updatedProjects = projects.map((p) =>
        p.id === updatedProject.id ? updatedProject : p
      );

      // Save to localStorage
      saveToStorage(updatedProjects);

      set({
        currentProject: updatedProject,
        projects: updatedProjects,
        error: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to save project',
      });
    }
  },

  deleteProject: (id) => {
    try {
      const { projects, currentProject } = get();
      const updatedProjects = projects.filter((p) => p.id !== id);

      // Save to localStorage
      saveToStorage(updatedProjects);

      // If deleting current project, clear it
      const newCurrentProject = currentProject?.id === id ? null : currentProject;

      set({
        projects: updatedProjects,
        currentProject: newCurrentProject,
        error: null,
      });

      // If we deleted the current project, clear stores
      if (currentProject?.id === id) {
        useTokenStore.getState().clearTokens();
        useComponentStore.getState().clearComponents();
        useEditorStore.getState().reset();
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete project',
      });
    }
  },

  updateProjectMetadata: (name, description) => {
    const { currentProject, projects } = get();

    if (!currentProject) {
      set({ error: 'No project to update' });
      return;
    }

    try {
      const updatedProject: Project = {
        ...currentProject,
        name,
        description,
        updatedAt: new Date(),
      };

      const updatedProjects = projects.map((p) =>
        p.id === updatedProject.id ? updatedProject : p
      );

      saveToStorage(updatedProjects);

      set({
        currentProject: updatedProject,
        projects: updatedProjects,
        error: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update project',
      });
    }
  },

  loadProjectsFromStorage: () => {
    set({ isLoading: true, error: null });

    try {
      const projects = loadFromStorage();
      set({
        projects,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load projects',
      });
    }
  },
}));
