import React from 'react';

export interface FormField {
    id: string;
    name: string;
    type: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number' | 'textarea';
    label: string;
    placeholder?: string;
    required?: boolean;
    autoComplete?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    validation?: {
        pattern?: string;
        minLength?: number;
        maxLength?: number;
        min?: number;
        max?: number;
    };
}

export interface FormProps {
    action: ((formData: FormData) => Promise<void>) | string; // Can be server action or client function
    children?: React.ReactNode;
    type?: 'login' | 'register' | 'custom';
    title?: string;
    description?: string;
    fields?: FormField[];
    defaultFields?: boolean; // Whether to show default email/password fields
    className?: string;
    formClassName?: string;
    showLabels?: boolean;
    errors?: Record<string, string[]>;
    onSubmit?: (e: React.FormEvent) => void;
}

export function Form({
    action,
    children,
    type = 'login',
    title,
    description,
    fields = [],
    defaultFields = true,
    className = "flex flex-col space-y-4 bg-gray-50 px-4 py-8 sm:px-16",
    formClassName = "",
    showLabels = true,
    errors = {},
    onSubmit,
}: FormProps) {
    // Default fields for login/register
    const defaultFormFields: FormField[] = [
        {
            id: "email",
            name: "email",
            type: "email",
            label: "Email Address",
            placeholder: "user@acme.com",
            autoComplete: "email",
            required: true,
        },
        {
            id: "password",
            name: "password",
            type: "password",
            label: "Password",
            required: true,
            autoComplete: type === 'login' ? 'current-password' : 'new-password',
        }
    ];

    // Use custom fields if provided, otherwise use default fields
    const formFields = fields.length > 0 ? fields : (defaultFields ? defaultFormFields : []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (onSubmit) {
            onSubmit(e);
            return;
        }

        // Handle server actions
        if (typeof action === 'function') {
            const formData = new FormData(e.currentTarget);
            await action(formData);
        }
    };

    return (
        <form
            action={action}
            onSubmit={handleSubmit}
            className={`${className} ${formClassName}`}
        >
            {/* Custom title and description */}
            {(title || description) && (
                <div className="text-center mb-6">
                    {title && <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>}
                    {description && <p className="text-gray-600">{description}</p>}
                </div>
            )}

            {/* Form fields */}
            {formFields.map((field) => (
                <div key={field.id} className="space-y-2 mb-6">
                    {showLabels && (
                        <label
                            htmlFor={field.id}
                            className="block text-xs text-gray-600 uppercase font-medium"
                        >
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                    )}

                    {field.type === 'textarea' ? (
                        <textarea
                            id={field.id}
                            name={field.name}
                            placeholder={field.placeholder}
                            required={field.required}
                            autoComplete={field.autoComplete}
                            onChange={field.onChange}
                            rows={4}
                            className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm resize-none"
                            {...field.validation}
                        />
                    ) : (
                        <input
                            id={field.id}
                            name={field.name}
                            type={field.type}
                            placeholder={field.placeholder}
                            autoComplete={field.autoComplete}
                            required={field.required}
                            onChange={field.onChange}
                            className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
                            {...field.validation}
                        />
                    )}

                    {/* Field-specific error display */}
                    {errors[field.name] && (
                        <div className="text-red-500 text-sm">
                            {errors[field.name].map((error, index) => (
                                <p key={index} className="text-red-500 text-sm">{error}</p>
                            ))}
                        </div>
                    )}
                </div>
            ))}

            {/* Custom children (like submit buttons, links, etc.) */}
            {children}
        </form>
    );
}
