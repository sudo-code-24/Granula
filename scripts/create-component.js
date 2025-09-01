#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get command line arguments
const args = process.argv.slice(2);
const componentName = args[0];
const componentType = args[1] || 'basic'; // basic, form, card, button, modal, blank

if (!componentName) {
  console.error('❌ Please provide a component name!');
  console.log('Usage: npm run create-component <component-name> [component-type]');
  console.log('Component types: basic, form, card, button, modal, blank');
  console.log('Examples:');
  console.log('  npm run create-component Button');
  console.log('  npm run create-component UserCard card');
  console.log('  npm run create-component LoginForm form');
  console.log('  npm run create-component Modal modal');
  process.exit(1);
}

// Convert component name to PascalCase if it's not already
const pascalCaseName = componentName.charAt(0).toUpperCase() + componentName.slice(1);

// Create components directory if it doesn't exist
const componentsDir = path.join(__dirname, '..', 'app', 'components');
if (!fs.existsSync(componentsDir)) {
  try {
    fs.mkdirSync(componentsDir, { recursive: true });
    console.log('✅ Created components directory');
  } catch (error) {
    console.error('❌ Failed to create components directory:', error.message);
    process.exit(1);
  }
}

const componentFile = path.join(componentsDir, `${pascalCaseName}.tsx`);

// Check if component already exists
if (fs.existsSync(componentFile)) {
  console.error(`❌ Component "${pascalCaseName}" already exists!`);
  process.exit(1);
}

// Component templates based on type
const templates = {
  basic: `import React from 'react';

interface ${pascalCaseName}Props {
  children?: React.ReactNode;
  className?: string;
}

export default function ${pascalCaseName}({ children, className = '' }: ${pascalCaseName}Props) {
  return (
    <div className={\`\${className}\`}>
      {children}
    </div>
  );
}`,

  form: `import React, { useState } from 'react';

interface ${pascalCaseName}Props {
  onSubmit?: (data: any) => void;
  className?: string;
}

export default function ${pascalCaseName}({ onSubmit, className = '' }: ${pascalCaseName}Props) {
  const [formData, setFormData] = useState({
    // Add your form fields here
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className={\`\${className}\`}>
      {/* Add your form fields here */}
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Submit
      </button>
    </form>
  );
}`,

  card: `import React from 'react';

interface ${pascalCaseName}Props {
  title?: string;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function ${pascalCaseName}({ 
  title, 
  children, 
  className = '', 
  onClick 
}: ${pascalCaseName}Props) {
  return (
    <div 
      className={\`bg-white rounded-lg shadow-md p-6 \${className}\`}
      onClick={onClick}
    >
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <div className="text-gray-700">
        {children}
      </div>
    </div>
  );
}`,

  button: `import React from 'react';

interface ${pascalCaseName}Props {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export default function ${pascalCaseName}({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  type = 'button'
}: ${pascalCaseName}Props) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const classes = \`\${baseClasses} \${variantClasses[variant]} \${sizeClasses[size]} \${className}\`;

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}`,

  modal: `import React, { useEffect } from 'react';

interface ${pascalCaseName}Props {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function ${pascalCaseName}({
  isOpen,
  onClose,
  title,
  children,
  className = ''
}: ${pascalCaseName}Props) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>
        
        <div className={\`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full \${className}\`}>
          {title && (
            <div className="bg-gray-50 px-4 py-3 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {title}
              </h3>
            </div>
          )}
          
          <div className="px-4 py-5 sm:p-6">
            {children}
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}`,

  blank: `import React from 'react';

interface ${pascalCaseName}Props {
  // Add your props here
}

export default function ${pascalCaseName}({}: ${pascalCaseName}Props) {
  return (
    <div>
      {/* Your component content goes here */}
    </div>
  );
}`
};

// Get the template based on component type
const componentTemplate = templates[componentType] || templates.basic;

try {
  fs.writeFileSync(componentFile, componentTemplate);
  console.log(`✅ Created component: ${pascalCaseName}.tsx`);
} catch (error) {
  console.error('❌ Failed to create component file:', error.message);
  process.exit(1);
}

console.log(`\n🎉 Successfully created ${pascalCaseName} component!`);
console.log(`📁 Location: app/components/${pascalCaseName}.tsx`);
console.log(`📝 Component type: ${componentType}`);
console.log('\n💡 You can now customize the component and import it in your pages.');
console.log('\n📚 Available component types:');
console.log('  - basic: Simple component with children and className props');
console.log('  - form: Form component with state management and handlers');
console.log('  - card: Card component with title and content areas');
console.log('  - button: Button component with variants and sizes');
console.log('  - modal: Modal component with overlay and close functionality');
console.log('  - blank: Minimal component structure for custom implementations');
console.log('\n📖 Usage example:');
console.log(`  import ${pascalCaseName} from '@/components/${pascalCaseName}';`);
