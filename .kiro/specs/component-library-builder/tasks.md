# Implementation Plan: Component Library Builder

## Overview

This implementation plan breaks down the Component Library Builder web application into discrete, incremental coding tasks. The application is a Next.js web app (not a VS Code extension) that provides a browser-based IDE for creating React component libraries with design tokens. The current implementation has basic token management and live preview working. This plan focuses on completing the remaining features.

## Current Status

**Completed:**
- ✅ Next.js project setup with TypeScript, Tailwind CSS, and Vitest
- ✅ Domain models (DesignToken, ComponentSpec, Project types)
- ✅ Token validation with Zod schemas
- ✅ Token resolver for reference resolution
- ✅ CSS variable generator
- ✅ Zustand stores for token and editor state
- ✅ Basic token editor UI with create/edit/delete
- ✅ Token list with category grouping
- ✅ Sandpack code editor integration
- ✅ Live preview with automatic CSS regeneration
- ✅ Basic unit tests for TokenValidator

**In Progress:**
- This is a web application, not a VS Code extension
- Focus is on browser-based component library building
- No backend API yet (using client-side state only)

## Tasks

- [x] 1. Set up project structure and core infrastructure
  - Create Next.js project with TypeScript 5.3+
  - Configure build tools and testing framework (Vitest with fast-check)
  - Configure ESLint and Prettier
  - Set up Sandpack for code editor
  - Create directory structure following layered architecture
  - _Requirements: 23.1, 23.2_

- [x] 2. Implement domain models and validation schemas
  - [x] 2.1 Create DesignToken type and Zod schema
    - Define TokenType, TokenValue, TokenCategory enums
    - Create DesignToken interface with W3C fields and extensions
    - Implement Zod validation schema for tokens
    - _Requirements: 1.1, 2.1_

  - [x] 2.2 Create ComponentSpec type and schema
    - Define ComponentType enum and PropDefinition interface
    - Create ComponentSpec interface with all fields
    - _Requirements: 5.1, 5.7_

  - [x] 2.3 Create Project and validation types
    - Define Project, ValidationResult interfaces
    - _Requirements: 9.1, 14.1_

- [x] 3. Implement token validation system
  - [x] 3.1 Implement TokenValidator class
    - Create validate() method with Zod schema validation
    - Implement type-specific validation (color, dimension, fontWeight)
    - Add validateColor(), validateDimension(), validateFontWeight() methods
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ]*  3.2 Write property test for W3C token type validation
    - **Property 1: W3C Token Type Validation**
    - **Validates: Requirements 2.1**

  - [ ]* 3.3 Write property test for color format validation
    - **Property 2: Color Token Format Validation**
    - **Validates: Requirements 2.2**

  - [ ]* 3.4 Write property test for dimension unit validation
    - **Property 3: Dimension Token Unit Validation**
    - **Validates: Requirements 2.3**

  - [ ]* 3.5 Write property test for font weight validation
    - **Property 4: Font Weight Range Validation**
    - **Validates: Requirements 2.4**

  - [x] 3.6 Write unit tests for edge cases
    - Test invalid color formats (malformed hex, invalid rgb)
    - Test dimension without units
    - Test font weight edge values (99, 901, 150)
    - _Requirements: 2.2, 2.3, 2.4_

- [x] 4. Add circular reference detection to TokenResolver
  - [x] 4.1 Implement detectCircularReferences() using DFS algorithm in TokenResolver
    - Build dependency graph from token references
    - Use depth-first search to detect cycles
    - Return cycle paths for debugging
    - _Requirements: 2.7_

  - [ ]* 4.2 Write property test for circular reference detection
    - **Property 5: Circular Reference Detection**
    - **Validates: Requirements 2.7**

  - [ ]* 4.3 Write unit tests for complex circular reference chains
    - Test simple A→B→A cycle
    - Test longer A→B→C→A cycle
    - Test multiple independent cycles
    - _Requirements: 2.7_

- [ ] 5. Checkpoint - Ensure validation tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement token resolution and CSS generation
  - [x] 6.1 Implement TokenResolver class
    - Create resolve() method for recursive reference resolution
    - Handle TokenReference detection and resolution
    - Implement error handling for missing references
    - _Requirements: 3.2, 3.3_

  - [ ]* 6.2 Write property test for reference resolution termination
    - **Property 6: Reference Resolution Termination**
    - **Validates: Requirements 3.2**

  - [x] 6.3 Implement CSSGenerator class
    - Create generate() method to produce CSS from tokens
    - Implement formatValue() for different token types
    - Add formatColor(), formatShadow() helper methods
    - Ensure all variables are in :root selector
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.6, 4.7_

  - [ ]* 6.4 Write property test for complete token coverage in CSS
    - **Property 8: Complete Token Coverage in CSS**
    - **Validates: Requirements 4.1**

  - [ ]* 6.5 Write property test for CSS root selector structure
    - **Property 9: CSS Root Selector Structure**
    - **Validates: Requirements 4.6**

  - [ ]* 6.6 Write property test for CSS reference resolution
    - **Property 10: CSS Reference Resolution**
    - **Validates: Requirements 4.7**

  - [ ]* 6.7 Write unit tests for CSS generation edge cases
    - Test empty token set
    - Test tokens with special characters in names
    - Test shadow and gradient formatting
    - _Requirements: 4.1, 4.6, 4.7_

- [x] 7. Implement Zustand stores for state management
  - [x] 7.1 Create useTokenStore
    - Implement addToken(), updateToken(), deleteToken()
    - Implement selectToken() for editing
    - Integrate with CSSGenerator for automatic CSS regeneration
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 7.2 Create useEditorStore
    - Implement file management (updateFile, addFile, deleteFile)
    - Track active file
    - Initialize with default files
    - _Requirements: 16.1, 16.2_

- [x] 8. Implement token management UI
  - [x] 8.1 Create TokenEditor component
    - Build form for token creation/editing
    - Add type-specific input fields (color picker, dimension input)
    - Implement real-time validation with error display
    - Auto-generate CSS variable name from token ID
    - _Requirements: 1.1, 1.2_

  - [x] 8.2 Create TokenList component
    - Display tokens grouped by category
    - Show color preview for color tokens
    - Show value preview for other tokens
    - Implement delete functionality
    - _Requirements: 1.5_

  - [x] 8.3 Create TokenPanel component
    - Combine TokenList and TokenEditor
    - Handle create/edit mode switching
    - Add "New Token" button
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 9. Implement code editor integration
  - [x] 9.1 Create CodeEditor component with Sandpack
    - Integrate Sandpack with React TypeScript template
    - Configure editor options (tabs, line numbers, errors)
    - Enable live preview
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 9.2 Create editor page layout
    - Build two-column layout (tokens sidebar + editor)
    - Make sidebar resizable (optional enhancement)
    - _Requirements: 22.1, 22.2_

- [x] 10. Implement component generation system
  - [x] 10.1 Create HandlebarsTemplateEngine class
    - Implement render() using Handlebars
    - Implement loadTemplate() to read template strings
    - Register custom helpers: camelCase, pascalCase, kebabCase, json
    - _Requirements: 18.1, 18.2, 18.4, 18.5, 18.6, 18.7_

  - [ ]* 10.2 Write property test for template context availability
    - **Property 27: Template Context Availability**
    - **Validates: Requirements 18.6**

  - [ ]* 10.3 Write unit tests for template engine
    - Test rendering with simple context
    - Test custom helpers (camelCase, pascalCase, etc.)
    - Test error handling for invalid templates
    - _Requirements: 18.4, 18.5, 18.6, 18.7_

- [x] 11. Create component generation templates
  - [x] 11.1 Create Component.tsx.hbs template
    - Include imports for React and types
    - Generate functional component with props destructuring
    - Include JSDoc comments with description
    - Apply className from props
    - _Requirements: 5.1, 5.2_

  - [x] 11.2 Create Component.types.ts.hbs template
    - Generate TypeScript interface for props
    - Include JSDoc comments for each prop
    - Handle required vs optional props with ? flag
    - Extend React.HTMLAttributes for standard props
    - _Requirements: 5.2, 6.1, 6.2, 6.3, 6.6_

  - [x] 11.3 Create Component.module.css.hbs template
    - Generate CSS class for component
    - Map tokens to CSS custom properties
    - Include custom styles if provided
    - Generate variant classes
    - _Requirements: 5.3_

  - [x] 11.4 Create Component.test.tsx.hbs template
    - Import Testing Library utilities
    - Generate basic render test
    - Generate tests for each prop
    - Generate tests for variants
    - _Requirements: 5.4_

  - [x] 11.5 Create Component.stories.tsx.hbs template
    - Use Storybook 7+ format with Meta and StoryObj
    - Generate default story with args
    - Generate stories for each variant
    - Configure argTypes with appropriate controls
    - Include autodocs tag
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

- [x] 12. Implement component generator
  - [x] 12.1 Create ComponentGenerator class
    - Inject HandlebarsTemplateEngine
    - Implement validate() to check ComponentSpec validity
    - Implement generate() to create all component files
    - Generate component, types, styles, test, story, and index files
    - Update editor store with generated files
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.8_

  - [ ]* 12.2 Write property test for valid TypeScript component output
    - **Property 11: Valid TypeScript Component Output**
    - **Validates: Requirements 5.1**

  - [ ]* 12.3 Write property test for props to TypeScript interface mapping
    - **Property 12: Props to TypeScript Interface Mapping**
    - **Validates: Requirements 5.7, 6.1**

  - [ ]* 12.4 Write property test for optional flag correctness
    - **Property 13: Optional Flag Correctness**
    - **Validates: Requirements 6.2, 6.3**

  - [ ]* 12.5 Write integration test for complete component generation
    - Test all files are created
    - Test file contents match spec
    - Test generated code structure
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 13. Implement component builder UI
  - [x] 13.1 Create ComponentSpecForm component
    - Build form for component name, type, description
    - Add prop editor with add/remove functionality
    - Add token selector (multi-select from available tokens)
    - Add variant editor
    - _Requirements: 5.1, 5.2, 5.7_

  - [x] 13.2 Create ComponentPanel component
    - Show component list
    - Show component spec form
    - Add "Generate Component" button
    - Display generated file structure preview
    - _Requirements: 5.1, 5.8_

  - [x] 13.3 Add component panel to editor layout
    - Add tab or accordion to switch between tokens and components
    - Update editor page layout
    - _Requirements: 22.1_

- [x] 14. Checkpoint - Ensure component generation tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Implement project management
  - [x] 15.1 Create useProjectStore
    - Implement project state (currentProject, projects list)
    - Add createProject(), loadProject(), saveProject()
    - Integrate with localStorage for persistence
    - _Requirements: 11.1, 11.2, 11.3, 11.6_

  - [x] 15.2 Create ProjectList component
    - Display user's projects with names and dates
    - Add "New Project" button
    - Add project selection
    - Add project deletion with confirmation
    - _Requirements: 11.4, 11.5_

  - [x] 15.3 Create project management page
    - Build projects list page at /projects
    - Add navigation between home, projects, and editor
    - _Requirements: 11.1, 11.7_

  - [ ]* 15.4 Write unit tests for project management
    - Test project creation
    - Test project loading
    - Test localStorage persistence
    - _Requirements: 11.1, 11.2, 11.3, 11.6_

- [ ] 16. Implement export functionality
  - [ ] 16.1 Create ExportManager class
    - Implement exportAsZip() using JSZip
    - Implement generatePackageJson()
    - Implement generateReadme()
    - Include all project files, tokens, and generated CSS
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

  - [ ] 16.2 Create ExportButton component
    - Add export button to editor UI
    - Show export options (zip download)
    - Trigger download on export
    - _Requirements: 13.1, 13.8_

  - [ ]* 16.3 Write property test for token export round-trip
    - **Property 7: Token Export Round-Trip**
    - **Validates: Requirements 1.7**

  - [ ]* 16.4 Write integration test for export workflow
    - Test zip file generation
    - Test package.json content
    - Test README content
    - Test all files included
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [ ] 17. Implement dependency tracking (optional for MVP)
  - [ ] 17.1 Create ComponentDependencyGraph class
    - Implement addDependency() to record token-component relationships
    - Implement findDependents() to query components using a token
    - Implement getTokenDependencies() to query tokens used by component
    - Use Map<string, Set<string>> for efficient bidirectional lookup
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6_

  - [ ]* 17.2 Write property test for dependency graph completeness
    - **Property 24: Dependency Graph Completeness**
    - **Validates: Requirements 14.5, 17.4**

  - [ ]* 17.3 Write property test for dependency recording
    - **Property 26: Dependency Recording**
    - **Validates: Requirements 17.1**

  - [ ] 17.4 Integrate dependency tracking with token deletion
    - Check dependencies before allowing token deletion
    - Show warning with list of dependent components
    - _Requirements: 1.4_

- [ ] 18. Add authentication and database (optional for MVP)
  - [ ] 18.1 Set up Supabase or similar backend
    - Create database schema for users and projects
    - Set up authentication (email/password)
    - Configure API routes
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [ ] 18.2 Create authentication UI
    - Build login page
    - Build signup page
    - Add logout functionality
    - _Requirements: 12.1, 12.4, 12.7_

  - [ ] 18.3 Migrate from localStorage to database
    - Update useProjectStore to use API
    - Implement API routes for CRUD operations
    - Add loading states
    - _Requirements: 12.8_

- [ ] 19. Polish and optimization
  - [ ] 19.1 Add loading indicators
    - Show loading state during component generation
    - Show loading state during export
    - _Requirements: 20.2, 20.3_

  - [ ] 19.2 Add error boundaries
    - Wrap main sections in error boundaries
    - Show user-friendly error messages
    - Preserve user data on errors
    - _Requirements: 21.7, 21.8_

  - [ ] 19.3 Improve responsive design
    - Test on tablet devices
    - Adjust layout for smaller screens
    - Make sidebar collapsible on mobile
    - _Requirements: 22.1, 23.1, 23.2, 23.3, 23.4_

  - [ ] 19.4 Add keyboard shortcuts
    - Implement save shortcut (Cmd/Ctrl+S)
    - Implement new token shortcut
    - Implement new component shortcut
    - _Requirements: 8.8, 22.7_

  - [ ] 19.5 Add documentation
    - Create getting started guide
    - Add inline help tooltips
    - Create example projects
    - _Requirements: 24.1, 24.2, 24.3, 24.4_

- [ ] 20. Final testing and deployment
  - [ ] 20.1 Write E2E tests with Playwright
    - Test complete workflow: create tokens → generate component → export
    - Test token CRUD operations
    - Test component generation
    - _Requirements: All_

  - [ ] 20.2 Performance optimization
    - Measure and optimize bundle size
    - Implement code splitting
    - Optimize Sandpack configuration
    - _Requirements: 20.1, 20.5_

  - [ ] 20.3 Deploy to Vercel
    - Configure deployment settings
    - Set up environment variables
    - Test production build
    - _Requirements: 23.1, 23.2, 23.3, 23.4_

  - [ ] 20.4 Final checkpoint - Ensure all tests pass
    - Run full test suite
    - Fix any remaining issues
    - Verify all requirements are met
    - _Requirements: All_

## Notes

- Tasks marked with `*` are optional property-based tests that can be skipped for faster MVP
- The application is a Next.js web app, not a VS Code extension
- Focus is on browser-based development with Sandpack
- Authentication and database are optional for MVP (can use localStorage)
- Dependency tracking is optional for MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end workflows
- The implementation follows a bottom-up approach: models → services → UI → integration
