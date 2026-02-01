# Web Application Architecture

## Editor Integration Options

### Option 1: Monaco Editor (Recommended for MVP)
- **Pros**: Lightweight, full VS Code editing experience, easy to integrate
- **Cons**: Need backend for file operations and preview bundling
- **Use when**: You want control over the backend and file system

```typescript
import Editor from '@monaco-editor/react';

<Editor
  height="100vh"
  defaultLanguage="typescript"
  defaultValue="// Start coding"
  theme="vs-dark"
  onChange={handleEditorChange}
/>
```

### Option 2: Sandpack (Best for Fully Client-Side)
- **Pros**: Full bundler in browser, built-in preview, no backend needed
- **Cons**: Less customizable than Monaco, larger bundle size
- **Use when**: You want everything to run client-side

```typescript
import { Sandpack } from '@codesandbox/sandpack-react';

<Sandpack
  template="react-ts"
  files={{
    '/App.tsx': componentCode,
    '/tokens.css': cssVariables,
  }}
  options={{
    showNavigator: true,
    showTabs: true,
  }}
/>
```

### Option 3: WebContainer (Most Powerful)
- **Pros**: Full Node.js in browser, can run npm, build tools
- **Cons**: Requires StackBlitz license, larger resource usage
- **Use when**: You need full development environment in browser

## Application Flow

### 1. User Authentication
- Sign up/login with email or OAuth (GitHub, Google)
- JWT tokens for API authentication
- Store user projects in database

### 2. Project Management
- Create new project (initializes file structure)
- Load existing project from database
- Auto-save changes to database
- Export project as zip or to GitHub

### 3. Token Management
- Visual token editor (color pickers, dimension inputs)
- Token list with search and filter
- Live preview of token changes
- Generate CSS variables automatically

### 4. Component Builder
- Visual component spec builder
- Prop editor with type selection
- Token selector for styling
- Generate component files on demand

### 5. Live Preview
- Real-time preview of components
- Storybook-like variant switching
- Responsive preview modes
- Hot reload on changes

### 6. Export/Publish
- Download as zip file
- Push to GitHub repository
- Generate npm package structure
- Include README and documentation

## State Management

### Global State (Zustand/Redux)
```typescript
interface AppState {
  // User & Auth
  user: User | null;
  isAuthenticated: boolean;
  
  // Current Project
  currentProject: Project | null;
  files: FileTree;
  
  // Tokens
  tokens: DesignToken[];
  selectedToken: DesignToken | null;
  
  // Components
  components: ComponentSpec[];
  selectedComponent: ComponentSpec | null;
  
  // Editor
  activeFile: string;
  editorContent: Record<string, string>;
  
  // Preview
  previewMode: 'desktop' | 'tablet' | 'mobile';
  previewComponent: string | null;
}
```

### Actions
- `loadProject(id)` - Load project from API
- `saveProject()` - Save current state to API
- `createToken(token)` - Add new token
- `updateToken(id, updates)` - Update token
- `deleteToken(id)` - Remove token
- `generateComponent(spec)` - Generate component files
- `updateFile(path, content)` - Update file content

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - List user projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/export` - Export as zip

### Tokens
- `GET /api/projects/:id/tokens` - List tokens
- `POST /api/projects/:id/tokens` - Create token
- `PUT /api/projects/:id/tokens/:tokenId` - Update token
- `DELETE /api/projects/:id/tokens/:tokenId` - Delete token

### Components
- `GET /api/projects/:id/components` - List components
- `POST /api/projects/:id/components` - Generate component
- `DELETE /api/projects/:id/components/:name` - Delete component

### Files
- `GET /api/projects/:id/files` - Get file tree
- `GET /api/projects/:id/files/*` - Get file content
- `PUT /api/projects/:id/files/*` - Update file content

## Database Schema

### Users
```typescript
{
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Projects
```typescript
{
  id: string;
  userId: string;
  name: string;
  description: string;
  files: Record<string, string>; // JSON blob or separate table
  tokens: DesignToken[];         // JSON blob
  components: ComponentSpec[];   // JSON blob
  createdAt: Date;
  updatedAt: Date;
}
```

## Security Considerations

- Validate all user input with Zod schemas
- Sanitize file paths to prevent directory traversal
- Rate limit API endpoints
- Use CORS for API protection
- Store passwords with bcrypt
- Use HTTPS in production
- Implement CSRF protection
- Validate JWT tokens on protected routes
