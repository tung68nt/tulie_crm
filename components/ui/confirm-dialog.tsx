'use client'

import { useState, useCallback, createContext, useContext, ReactNode } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Trash2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConfirmOptions {
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: 'default' | 'destructive'
}

interface ConfirmContextValue {
    confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

export function useConfirm() {
    const ctx = useContext(ConfirmContext)
    if (!ctx) {
        // Fallback to native confirm if provider not mounted
        return {
            confirm: (options: ConfirmOptions) =>
                Promise.resolve(window.confirm(options.description))
        }
    }
    return ctx
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<{
        open: boolean
        options: ConfirmOptions
        resolve: ((value: boolean) => void) | null
    }>({
        open: false,
        options: { title: '', description: '' },
        resolve: null,
    })

    const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
        return new Promise<boolean>((resolve) => {
            setState({ open: true, options, resolve })
        })
    }, [])

    const handleClose = (value: boolean) => {
        state.resolve?.(value)
        setState((prev) => ({ ...prev, open: false, resolve: null }))
    }

    const isDestructive = state.options.variant === 'destructive'
    const IconComponent = isDestructive ? Trash2 : Info

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            <Dialog open={state.open} onOpenChange={(open) => { if (!open) handleClose(false) }}>
                <DialogContent className="sm:max-w-[420px] p-0 gap-0 rounded-2xl overflow-hidden">
                    <div className={cn(
                        "flex items-center gap-4 p-6 pb-4",
                    )}>
                        <div className={cn(
                            "shrink-0 w-11 h-11 rounded-xl flex items-center justify-center",
                            isDestructive
                                ? "bg-red-50 text-red-600"
                                : "bg-blue-50 text-blue-600"
                        )}>
                            <IconComponent className="h-5 w-5" />
                        </div>
                        <DialogHeader className="text-left space-y-1">
                            <DialogTitle className="text-base font-semibold">
                                {state.options.title}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                                {state.options.description}
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className="flex items-center justify-end gap-2 px-6 py-4 bg-zinc-50/80 border-t">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 px-4 rounded-lg font-medium"
                            onClick={() => handleClose(false)}
                        >
                            {state.options.cancelText || 'Hủy'}
                        </Button>
                        <Button
                            variant={isDestructive ? 'destructive' : 'default'}
                            size="sm"
                            className="h-9 px-4 rounded-lg font-medium"
                            onClick={() => handleClose(true)}
                        >
                            {state.options.confirmText || (isDestructive ? 'Xóa' : 'Xác nhận')}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </ConfirmContext.Provider>
    )
}
