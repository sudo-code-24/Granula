# Page and Component Creation Scripts

This directory contains scripts to quickly generate new Next.js pages and React components with different layouts and templates.

## Basic Page Creation

Create a simple page with basic layout:

```bash
npm run create-page <page-name>
```

**Example:**
```bash
npm run create-page login
```

This will create:
- `app/login/page.tsx` - A basic page with centered content

## Advanced Page Creation

Create pages with different templates and layouts:

```bash
npm run create-page-advanced <page-name> [page-type]
```

**Available page types:**
- `basic` - Simple centered page with title and description (default)
- `form` - Page with a basic form layout
- `dashboard` - Dashboard-style layout with header and content area
- `blank` - Minimal blank page for custom layouts

**Examples:**
```bash
# Create a login page with form layout
npm run create-page-advanced login form

# Create a dashboard page
npm run create-page-advanced dashboard dashboard

# Create a contact page with basic layout
npm run create-page-advanced contact

# Create a blank page for custom layout
npm run create-page-advanced custom blank
```

## What Gets Created

Each script will:
1. Create a new folder in `app/<page-name>/`
2. Generate a `page.tsx` file with the appropriate template
3. Use kebab-case for folder names (e.g., "userProfile" becomes "user-profile")
4. Include proper TypeScript and React imports
5. Use Tailwind CSS classes for styling

## Templates

### Basic Template
- Centered content with title and description
- Clean, minimal design
- Good for simple informational pages

### Form Template
- Form layout with email and password fields
- Styled with Tailwind CSS
- Ready for form handling logic

### Dashboard Template
- Header with page title
- Large content area for widgets/components
- Professional dashboard appearance

### Blank Template
- Minimal structure
- Perfect for custom layouts
- Just the basic React component structure

## Customization

After creating a page, you can:
- Modify the component logic
- Add more components
- Customize the styling
- Add routing logic
- Include additional files (components, styles, etc.)

## Notes

- Pages are automatically accessible at `http://localhost:3000/<page-name>`
- The scripts check for existing pages to avoid conflicts
- All templates use modern React patterns and TypeScript
- Styling is done with Tailwind CSS classes

## Component Creation

Create React components with different templates and functionality:

```bash
npm run create-component <component-name> [component-type]
```

**Available component types:**
- `basic` - Simple component with children and className props (default)
- `form` - Form component with state management and handlers
- `card` - Card component with title and content areas
- `button` - Button component with variants and sizes
- `modal` - Modal component with overlay and close functionality
- `blank` - Minimal component structure for custom implementations

**Examples:**
```bash
# Create a basic button component
npm run create-component Button

# Create a user card component
npm run create-component UserCard card

# Create a login form component
npm run create-component LoginForm form

# Create a modal component
npm run create-component Modal modal

# Create a custom component
npm run create-component CustomComponent blank
```

**What Gets Created:**
- Components are placed in `app/components/` directory
- Files are named in PascalCase (e.g., `Button.tsx`)
- Includes proper TypeScript interfaces and React patterns
- Uses Tailwind CSS for styling
- Ready-to-use component templates

**Component Templates:**

### Basic Template
- Simple wrapper component with children and className props
- Perfect for layout components or simple wrappers

### Form Template
- Form component with state management
- Includes form submission and change handlers
- Ready for form field customization

### Card Template
- Card component with title and content areas
- Includes click handler support
- Styled with shadows and rounded corners

### Button Template
- Button component with multiple variants (primary, secondary, outline, ghost)
- Different sizes (sm, md, lg)
- Includes disabled state and type support

### Modal Template
- Modal component with overlay and close functionality
- ESC key support and body scroll locking
- Responsive design with proper z-index

### Blank Template
- Minimal component structure
- Perfect for custom implementations
- Just the basic React component boilerplate

**Usage After Creation:**
```tsx
import Button from '@/components/Button';
import UserCard from '@/components/UserCard';

// Use in your components
<Button variant="primary" size="lg">Click me</Button>
<UserCard title="User Info">Content here</UserCard>
```
