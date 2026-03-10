import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

/**
 * FormField — Standard form field wrapper
 *
 * Provides consistent label + input + error message layout.
 * Based on shadcn/ui form patterns.
 *
 * Usage:
 * ```tsx
 * <FormField label="Tên khách hàng" required>
 *   <Input placeholder="Nhập tên..." />
 * </FormField>
 *
 * <FormField label="Email" error="Email không hợp lệ">
 *   <Input type="email" aria-invalid />
 * </FormField>
 * ```
 */

interface FormFieldProps {
    label: string
    htmlFor?: string
    required?: boolean
    error?: string
    description?: string
    children: React.ReactNode
    className?: string
}

export function FormField({
    label,
    htmlFor,
    required,
    error,
    description,
    children,
    className,
}: FormFieldProps) {
    return (
        <div className={cn('space-y-2', className)}>
            <Label htmlFor={htmlFor} className="text-sm font-medium">
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {children}
            {description && !error && (
                <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {error && (
                <p className="text-xs text-destructive">{error}</p>
            )}
        </div>
    )
}

/**
 * FormSection — Groups related form fields with a title
 *
 * Usage:
 * ```tsx
 * <FormSection title="Thông tin cơ bản" description="Điền thông tin khách hàng">
 *   <FormField label="Tên">...</FormField>
 *   <FormField label="Email">...</FormField>
 * </FormSection>
 * ```
 */

interface FormSectionProps {
    title: string
    description?: string
    children: React.ReactNode
    className?: string
}

export function FormSection({
    title,
    description,
    children,
    className,
}: FormSectionProps) {
    return (
        <div className={cn('space-y-4', className)}>
            <div className="space-y-1">
                <h3 className="text-lg font-semibold">{title}</h3>
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
            </div>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    )
}
