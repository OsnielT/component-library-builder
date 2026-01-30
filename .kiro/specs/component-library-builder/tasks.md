# Implementation Plan: Component Library Builder

## Overview

This implementation plan breaks down the Component Library Builder VS Code extension into discrete, incremental coding tasks. Each task builds on previous work, with property-based tests integrated close to implementation to catch errors early. The plan follows a layered approach: domain models → core services → infrastructure → VS Code integration.

## Tasks

- [x] 1. Set up project structure and core infrastructure
  - Create VS Code extension project with TypeScript 5.3+
  - Configure build tools (esbuild, Rollup)
  - Set up testing framework (Vitest with fast-check for property tests)
  - Configure ESLint and Prettier
  - Create directory structure following layered architecture
  - _Requirements: 23.1, 23.2_

- [ ] 2. Implement domain models and validation schemas
  - [ ] 2.1 Create DesignToken type and Zod schema
    - Define TokenType, TokenValue, TokenCategory enums
    - Create DesignToken interface with W3C fields and extensions
    - Implement Zod validation schema for tokens
    - _Requirements: 1.1, 2.1_

  - [ ] 2.2 Create ComponentSpec type and schema
    - Define ComponentType enum and PropDefinition interface
    - Create ComponentSpec interface with all fields
    - Implement Zod validation schema
    - _Requirements: 5.1, 5.7_

  - [ ] 2.3 Create DataContract and change tracking types
    - Define JSONSchema, DataContract interfaces
    - Create TokenChange, PropagationPlan types
    - Define ValidationResult and error types
    - _Requirements: 9.1, 14.1_

- [ ] 3. Implement token validation system
  - [ ] 3.1 Implement TokenValidator class
    - Create validate() method with Zod schema validation
    - Implement type-specific validation (color, dimension, fontWeight)
    - Add validateColor(), validateDimension(), validateFontWeight() methods
    - Implement detectCircularReferences() using DFS algorithm
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.7_

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

  - [ ]* 3.6 Write property test for circular reference detection
    - **Property 5: Circular Reference Detection**
    - **Validates: Requirements 2.7**

  - [ ]* 3.7 Write unit tests for edge cases
    - Test invalid color formats (malformed hex, invalid rgb)
    - Test dimension without units
    - Test font weight edge values (99, 901, 150)
    - Test complex circular reference chains
    - _Requirements: 2.2, 2.3, 2.4, 2.7_

- [ ] 4. Checkpoint - Ensure validation tests pass
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 5. Implement token resolution and CSS generation
  - [ ] 5.1 Implement TokenResolver class
    - Create resolve() method for recursive reference resolution
    - Handle TokenReference detection and resolution
    - Implement error handling for missing references
    - _Requirements: 3.2, 3.3_

  - [ ]* 5.2 Write property test for reference resolution termination
    - **Property 6: Reference Resolution Termination**
    - **Validates: Requirements 3.2**

  - [ ] 5.3 Implement CSSVariableGenerator class
    - Create generate() method to produce CSS from tokens
    - Implement formatValue() for different token types
    - Add formatColor(), formatShadow() helper methods
    - Ensure all variables are in :root selector
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.6, 4.7_

  - [ ]* 5.4 Write property test for complete token coverage in CSS
    - **Property 8: Complete Token Coverage in CSS**
    - **Validates: Requirements 4.1**

  - [ ]* 5.5 Write property test for CSS root selector structure
    - **Property 9: CSS Root Selector Structure**
    - **Validates: Requirements 4.6**

  - [ ]* 5.6 Write property test for CSS reference resolution
    - **Property 10: CSS Reference Resolution**
    - **Validates: Requirements 4.7**

  - [ ]* 5.7 Write unit tests for CSS generation edge cases
    - Test empty token set
    - Test tokens with special characters in names
    - Test shadow and gradient formatting
    - _Requirements: 4.1, 4.6, 4.7_

- [ ] 6. Implement file system repository
  - [ ] 6.1 Create ITokenRepository interface and FileSystemTokenRepository
    - Implement getAll(), getById(), getByCategory() methods
    - Implement create(), update(), delete(), replaceAll() methods
    - Use atomic write operations with temp files and backups
    - Add path validation to prevent directory traversal
    - _Requirements: 1.1, 1.2, 1.3, 19.1, 19.6_

  - [ ]* 6.2 Write property test for token export round-trip
    - **Property 7: Token Export Round-Trip**
    - **Validates: Requirements 1.7**

  - [ ]* 6.3 Write property test for atomic write guarantee
    - **Property 28: Atomic Write Guarantee**
    - **Validates: Requirements 19.1**

  - [ ]* 6.4 Write property test for workspace path validation
    - **Property 29: Workspace Path Validation**
    - **Validates: Requirements 19.6**

  - [ ]* 6.5 Write unit tests for file system operations
    - Test file not found errors
    - Test permission denied errors
    - Test concurrent write operations
    - Test backup and rollback on failure
    - _Requirements: 19.1, 19.2, 19.6_

- [ ] 7. Implement component dependency graph
  - [ ] 7.1 Create ComponentDependencyGraph class
    - Implement addDependency() to record token-component relationships
    - Implement findDependents() to query components using a token
    - Implement getTokenDependencies() to query tokens used by component
    - Use Map<string, Set<string>> for efficient bidirectional lookup
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6_

  - [ ]* 7.2 Write property test for dependency graph completeness
    - **Property 24: Dependency Graph Completeness**
    - **Validates: Requirements 14.5, 17.4**

  - [ ]* 7.3 Write property test for dependency recording
    - **Property 26: Dependency Recording**
    - **Validates: Requirements 17.1**

  - [ ]* 7.4 Write unit tests for dependency graph operations
    - Test adding and removing dependencies
    - Test querying non-existent tokens/components
    - Test updating dependencies when component changes
    - _Requirements: 17.1, 17.2, 17.3, 17.4_

- [ ] 8. Checkpoint - Ensure core services tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement token management service
  - [ ] 9.1 Create TokenManager class
    - Inject ITokenRepository, ITokenValidator, ITokenPropagator, ComponentDependencyGraph
    - Implement createToken() with validation and propagation
    - Implement updateToken() with validation and change detection
    - Implement deleteToken() with dependency checking
    - Implement getAll(), getById(), getByCategory() delegation methods
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 9.2 Write unit tests for TokenManager
    - Test successful token creation
    - Test token creation with validation errors
    - Test token update with propagation
    - Test token deletion with dependents (should fail)
    - Test token deletion without dependents (should succeed)
    - _Requirements: 1.1, 1.2, 1.3_

- [ ] 10. Implement change propagation engine
  - [ ] 10.1 Create ChangeDetector class
    - Implement detectChanges() to compare old and new token sets
    - Detect created, updated, and deleted tokens
    - Record old and new values for each change
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

  - [ ]* 10.2 Write property test for complete change detection
    - **Property 23: Complete Change Detection**
    - **Validates: Requirements 14.1**

  - [ ] 10.3 Create PropagationEngine class
    - Implement createPlan() to analyze changes and generate actions
    - Implement execute() to run propagation actions with progress callbacks
    - Implement findDependents() using dependency graph
    - Implement generateActions() to create CSS regeneration and component update actions
    - Add executeAction() to handle different action types
    - _Requirements: 14.5, 14.6, 14.7, 14.8_

  - [ ]* 10.4 Write integration test for full propagation flow
    - Test token change triggers CSS regeneration
    - Test affected components are identified correctly
    - Test progress callbacks are invoked
    - _Requirements: 14.5, 14.6, 14.7_

- [ ] 11. Implement impact analysis
  - [ ] 11.1 Create ImpactAnalyzer class
    - Implement analyze() to calculate severity and affected components
    - Implement calculateSeverity() with rules for critical/high/medium/low
    - Implement estimateEffort() based on affected component count
    - Flag breaking changes when deletions are detected
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8, 15.9_

  - [ ]* 11.2 Write property test for impact severity classification
    - **Property 25: Impact Severity Classification**
    - **Validates: Requirements 15.2**

  - [ ]* 11.3 Write unit tests for impact analysis
    - Test severity calculation with various component counts
    - Test breaking change detection
    - Test effort estimation
    - _Requirements: 15.1, 15.2, 15.8_

- [ ] 12. Implement template engine
  - [ ] 12.1 Create HandlebarsTemplateEngine class
    - Implement ITemplateEngine interface
    - Implement render() using Handlebars
    - Implement loadTemplate() to read template files
    - Register custom helpers: camelCase, pascalCase, kebabCase, json
    - _Requirements: 18.1, 18.2, 18.4, 18.5, 18.6, 18.7_

  - [ ]* 12.2 Write property test for template context availability
    - **Property 27: Template Context Availability**
    - **Validates: Requirements 18.6**

  - [ ]* 12.3 Write unit tests for template engine
    - Test rendering with simple context
    - Test custom helpers (camelCase, pascalCase, etc.)
    - Test template loading from file system
    - Test error handling for invalid templates
    - _Requirements: 18.4, 18.5, 18.6, 18.7_

- [ ] 13. Create component generation templates
  - [ ] 13.1 Create Component.tsx.hbs template
    - Include imports for React and types
    - Generate functional component with props destructuring
    - Include JSDoc comments with description
    - Apply className from props
    - _Requirements: 5.1, 5.2_

  - [ ] 13.2 Create Component.types.ts.hbs template
    - Generate TypeScript interface for props
    - Include JSDoc comments for each prop
    - Handle required vs optional props with ? flag
    - Extend React.HTMLAttributes for standard props
    - _Requirements: 5.2, 6.1, 6.2, 6.3, 6.6_

  - [ ] 13.3 Create Component.module.css.hbs template
    - Generate CSS class for component
    - Map tokens to CSS custom properties
    - Include custom styles if provided
    - Generate variant classes
    - _Requirements: 5.3_

  - [ ] 13.4 Create Component.test.tsx.hbs template
    - Import Testing Library utilities
    - Generate basic render test
    - Generate tests for each prop
    - Generate tests for variants
    - _Requirements: 5.4_

  - [ ] 13.5 Create Component.stories.tsx.hbs template
    - Use Storybook 7+ format with Meta and StoryObj
    - Generate default story with args
    - Generate stories for each variant
    - Configure argTypes with appropriate controls
    - Include autodocs tag
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

- [ ] 14. Checkpoint - Ensure template tests pass
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 15. Implement component generator
  - [ ] 15.1 Create ComponentGenerator class
    - Inject ITemplateEngine and IFileSystem
    - Implement validate() to check ComponentSpec validity
    - Implement generate() to create all component files
    - Generate component, types, styles, test, story, and index files
    - Call formatCode() to run Prettier and ESLint on generated files
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.8, 5.9_

  - [ ]* 15.2 Write property test for valid TypeScript component output
    - **Property 11: Valid TypeScript Component Output**
    - **Validates: Requirements 5.1**

  - [ ]* 15.3 Write property test for props to TypeScript interface mapping
    - **Property 12: Props to TypeScript Interface Mapping**
    - **Validates: Requirements 5.7, 6.1**

  - [ ]* 15.4 Write property test for optional flag correctness
    - **Property 13: Optional Flag Correctness**
    - **Validates: Requirements 6.2, 6.3**

  - [ ]* 15.5 Write property test for lint-free generated code
    - **Property 14: Lint-Free Generated Code**
    - **Validates: Requirements 5.9**

  - [ ]* 15.6 Write integration test for complete component generation
    - Test all files are created
    - Test file contents match spec
    - Test generated code compiles
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 16. Implement Storybook integration
  - [ ] 16.1 Create StorybookIntegration class
    - Implement generateStory() using story template
    - Implement updateMainConfig() to generate .storybook/main.ts
    - Implement updatePreviewConfig() to generate .storybook/preview.ts with token imports
    - Configure standard addons (links, essentials, interactions, a11y)
    - Generate background options from color tokens
    - _Requirements: 7.1, 7.8, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [ ]* 16.2 Write property test for story file generation
    - **Property 15: Story File Generation**
    - **Validates: Requirements 7.1**

  - [ ]* 16.3 Write property test for argTypes configuration completeness
    - **Property 16: ArgTypes Configuration Completeness**
    - **Validates: Requirements 7.4**

  - [ ]* 16.4 Write unit tests for Storybook integration
    - Test main.ts config generation
    - Test preview.ts config with token imports
    - Test control type mapping (boolean → boolean, string enum → select, etc.)
    - _Requirements: 7.4, 7.5, 7.6, 7.7, 8.1, 8.2, 8.3_

- [ ] 17. Implement data contract system
  - [ ] 17.1 Create SchemaManager class
    - Implement validate() to check JSON Schema Draft 7 compliance
    - Implement generateTypes() to convert JSON Schema to TypeScript
    - Handle object, array, string, number, boolean types
    - Handle required vs optional properties
    - Handle nested objects and arrays
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [ ]* 17.2 Write property test for JSON Schema validation
    - **Property 17: JSON Schema Validation**
    - **Validates: Requirements 9.2**

  - [ ]* 17.3 Write property test for schema to TypeScript conversion
    - **Property 18: Schema to TypeScript Conversion**
    - **Validates: Requirements 9.3**

  - [ ] 17.4 Create MockDataGenerator class
    - Implement generate() to create mock data from schema
    - Use faker.js for realistic data generation
    - Handle format hints (email, uri, date, uuid)
    - Handle description hints (name, email, phone, address)
    - Handle enums by selecting random values
    - Generate arrays with 1-5 items
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_

  - [ ]* 17.5 Write property test for mock data schema conformance
    - **Property 19: Mock Data Schema Conformance**
    - **Validates: Requirements 10.1**

  - [ ]* 17.6 Write unit tests for mock data generation
    - Test email format generates valid emails
    - Test uuid format generates valid UUIDs
    - Test enum selects from provided values
    - Test array length is between 1-5
    - _Requirements: 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

- [ ] 18. Implement version management
  - [ ] 18.1 Create VersionManager class
    - Implement getCurrentVersion() to read from package.json
    - Implement bump() with calculateNewVersion() for major/minor/patch
    - Implement analyzeChanges() to determine bump type from changes
    - Implement tag() to create Git tags
    - Implement updatePackageJson() to write new version
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8_

  - [ ]* 18.2 Write property test for semantic version bump correctness
    - **Property 20: Semantic Version Bump Correctness**
    - **Validates: Requirements 11.2, 11.3, 11.4, 11.5, 11.6, 11.7**

  - [ ]* 18.3 Write property test for breaking changes trigger major bump
    - **Property 21: Breaking Changes Trigger Major Bump**
    - **Validates: Requirements 11.2**

  - [ ]* 18.4 Write unit tests for version management
    - Test version parsing and formatting
    - Test package.json update
    - Test Git tag creation
    - _Requirements: 11.1, 11.8_

- [ ] 19. Implement changelog generation
  - [ ] 19.1 Create ChangelogGenerator class
    - Implement generate() to create markdown from entries
    - Implement grouping by change type (breaking, features, fixes, docs, chores)
    - Add emoji for each section (⚠️ for breaking, ✨ for features, 🐛 for fixes)
    - Follow Keep a Changelog format
    - Implement addEntry() to prepend new entries
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8_

  - [ ]* 19.2 Write property test for changelog breaking changes section
    - **Property 22: Changelog Breaking Changes Section**
    - **Validates: Requirements 12.3**

  - [ ]* 19.3 Write unit tests for changelog generation
    - Test markdown formatting
    - Test change grouping
    - Test emoji inclusion
    - Test date formatting
    - _Requirements: 12.1, 12.2, 12.4, 12.5, 12.6_

- [ ] 20. Implement npm publishing
  - [ ] 20.1 Create NpmPublisher class
    - Implement publish() with full workflow
    - Implement runPrePublishChecks() to run tests, linting, type checking
    - Implement build() to compile the package
    - Implement npmPublish() to publish to registry
    - Support dry-run mode
    - Handle Git tagging and pushing
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8, 13.9_

  - [ ]* 20.2 Write integration test for publishing workflow
    - Test pre-publish checks run in order
    - Test build is called before publish
    - Test Git tag is created
    - Test dry-run mode doesn't actually publish
    - _Requirements: 13.1, 13.2, 13.3, 13.5, 13.9_

- [ ] 21. Checkpoint - Ensure all core services tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 22. Implement VS Code extension activation
  - [ ] 22.1 Create extension.ts entry point
    - Implement activate() function
    - Register all commands in command palette
    - Initialize services (TokenManager, ComponentGenerator, etc.)
    - Set up status bar items
    - Set up tree views
    - Ensure activation completes within 500ms
    - _Requirements: 22.1, 22.2, 22.3, 20.1_

  - [ ] 22.2 Register token management commands
    - component-builder.tokens.create
    - component-builder.tokens.edit
    - component-builder.tokens.delete
    - component-builder.tokens.import
    - component-builder.tokens.export
    - component-builder.tokens.regenerate
    - _Requirements: 22.1_

  - [ ] 22.3 Register component management commands
    - component-builder.component.create
    - component-builder.component.edit
    - component-builder.component.delete
    - component-builder.component.generate-story
    - component-builder.component.generate-test
    - _Requirements: 22.1_

  - [ ] 22.4 Register library management commands
    - component-builder.library.init
    - component-builder.library.build
    - component-builder.library.publish
    - component-builder.library.version
    - _Requirements: 22.1_

- [ ] 23. Implement VS Code UI components
  - [ ] 23.1 Create TokenTreeProvider for sidebar
    - Implement TreeDataProvider interface
    - Show tokens grouped by category
    - Support refresh on token changes
    - Handle click to edit token
    - _Requirements: 22.2_

  - [ ] 23.2 Create StatusBarManager
    - Display token count with icon
    - Display component count with icon
    - Display library version
    - Make items clickable to open relevant views
    - _Requirements: 22.3, 22.4_

  - [ ] 23.3 Create DiagnosticsProvider
    - Implement updateDiagnostics() for component files
    - Detect unused tokens and show warnings
    - Detect deprecated tokens and suggest replacements
    - _Requirements: 22.7, 22.8_

  - [ ] 23.4 Create TokenCompletionProvider for IntelliSense
    - Implement provideCompletionItems() for CSS files
    - Trigger on "var(--" pattern
    - Show all token CSS variable names
    - Include token value and description in details
    - Add color preview for color tokens
    - _Requirements: 22.5, 22.6_

  - [ ]* 23.5 Write property test for token autocomplete completeness
    - **Property 31: Token Autocomplete Completeness**
    - **Validates: Requirements 22.6**

  - [ ]* 23.6 Write unit tests for VS Code UI components
    - Test tree view data provider
    - Test status bar updates
    - Test diagnostics generation
    - Test completion provider triggers
    - _Requirements: 22.2, 22.3, 22.4, 22.5, 22.6, 22.7_

- [ ] 24. Implement webview panels
  - [ ] 24.1 Create TokenManagerPanel webview
    - Build React UI for token creation and editing
    - Show token list with search and filter
    - Show token form with type-specific fields
    - Validate tokens in real-time
    - Show dependency warnings on delete
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ] 24.2 Create ComponentBuilderPanel webview
    - Build React UI for component creation
    - Show component spec form
    - Show prop editor with add/remove
    - Show token selector
    - Show variant editor
    - Preview generated file structure
    - _Requirements: 5.1, 5.2, 5.3, 5.7_

  - [ ] 24.3 Create ConfigPanel webview
    - Build React UI for extension configuration
    - Show template customization options
    - Show publishing configuration
    - Show Storybook configuration
    - _Requirements: 18.3_

- [ ] 25. Implement snapshot and rollback system
  - [ ] 25.1 Create SnapshotManager class
    - Implement createSnapshot() to capture current state
    - Implement rollback() to restore from snapshot
    - Store snapshots with ID, timestamp, description
    - Create backup before rollback
    - Trigger propagation after rollback
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7_

  - [ ]* 25.2 Write integration test for snapshot and rollback
    - Test snapshot captures all tokens and components
    - Test rollback restores previous state
    - Test backup is created before rollback
    - Test propagation runs after rollback
    - _Requirements: 16.1, 16.4, 16.5, 16.6_

- [ ] 26. Implement caching system
  - [ ] 26.1 Create CacheManager class
    - Implement get() with memory and disk cache lookup
    - Implement set() to store in both caches
    - Implement TTL-based expiration
    - Promote disk cache hits to memory cache
    - _Requirements: 20.6, 20.7_

  - [ ]* 26.2 Write property test for cache hit performance
    - **Property 30: Cache Hit Performance**
    - **Validates: Requirements 20.6**

  - [ ]* 26.3 Write unit tests for caching
    - Test memory cache hit
    - Test disk cache hit with promotion
    - Test cache miss
    - Test TTL expiration
    - _Requirements: 20.6_

- [ ] 27. Implement cross-platform path handling
  - [ ] 27.1 Create PathUtils class
    - Implement normalizePath() to handle forward/backslashes
    - Implement isWithinWorkspace() for security validation
    - Implement resolvePath() for cross-platform resolution
    - Use Node.js path module for platform-specific operations
    - _Requirements: 23.6, 23.7_

  - [ ]* 27.2 Write property test for path separator normalization
    - **Property 32: Path Separator Normalization**
    - **Validates: Requirements 23.6**

  - [ ]* 27.3 Write unit tests for path handling
    - Test Windows paths (backslashes)
    - Test Unix paths (forward slashes)
    - Test mixed separators
    - Test relative vs absolute paths
    - _Requirements: 23.6, 23.7_

- [ ] 28. Implement error handling and recovery
  - [ ] 28.1 Create custom error classes
    - Create ValidationError with field and errors array
    - Create FileSystemError with operation and path
    - Create IntegrationError with service and operation
    - _Requirements: 21.1, 21.2, 21.3_

  - [ ] 28.2 Create ErrorRecovery utility class
    - Implement retry() with exponential backoff
    - Implement withTimeout() for operation timeouts
    - _Requirements: 21.4, 21.5, 21.7_

  - [ ]* 28.3 Write unit tests for error handling
    - Test ValidationError formatting
    - Test retry with eventual success
    - Test retry with max attempts exceeded
    - Test timeout handling
    - _Requirements: 21.1, 21.4, 21.7_

- [ ] 29. Add documentation and help system
  - [ ] 29.1 Create getting started guide
    - Write markdown guide for installation
    - Write quick start tutorial
    - Write first component tutorial
    - Make accessible from command palette
    - _Requirements: 24.1, 24.2_

  - [ ] 29.2 Add inline help and tooltips
    - Add JSDoc comments to all public APIs
    - Add tooltips to all UI elements
    - Add help links in error messages
    - _Requirements: 24.3, 24.5, 24.6_

  - [ ] 29.3 Create example projects
    - Create basic component library example
    - Create design system example
    - Include README with explanations
    - _Requirements: 24.4_

  - [ ] 29.4 Create troubleshooting guide
    - Document common issues and solutions
    - Include FAQ section
    - Make accessible from command palette
    - _Requirements: 24.7_

- [ ] 30. Final integration and polish
  - [ ] 30.1 Implement debouncing for token changes
    - Debounce propagation to avoid excessive updates
    - Use 500ms delay for token change debouncing
    - _Requirements: 20.7_

  - [ ] 30.2 Add progress indicators for long operations
    - Show progress for component generation
    - Show progress for propagation
    - Show progress for publishing
    - _Requirements: 20.2, 20.3, 20.4_

  - [ ] 30.3 Optimize extension activation time
    - Lazy load heavy dependencies
    - Defer non-critical initialization
    - Measure and ensure < 500ms activation
    - _Requirements: 20.1_

  - [ ]* 30.4 Run full integration test suite
    - Test complete workflow: create tokens → generate component → publish
    - Test token change propagation end-to-end
    - Test snapshot and rollback
    - Test all VS Code commands
    - _Requirements: All_

- [ ] 31. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end workflows
- The implementation follows a bottom-up approach: models → services → infrastructure → UI
