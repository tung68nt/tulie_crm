'use client'

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { ComponentPropsWithoutRef } from 'react'

interface PriceInputProps extends Omit<ComponentPropsWithoutRef<'input'>, 'onChange' | 'value'> {
    value?: number
    onChange?: (value: number) => void
}

export function PriceInput({ value, onChange, ...props }: PriceInputProps) {
    const [displayValue, setDisplayValue] = useState('')

    useEffect(() => {
        if (value !== undefined && value !== null) {
            const formatted = new Intl.NumberFormat('vi-VN').format(value)
            if (formatted !== displayValue.replace(/\./g, '').replace(/,/g, '')) {
                setDisplayValue(formatted)
            }
        } else {
            setDisplayValue('')
        }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, '')
        const numericValue = rawValue ? parseInt(rawValue, 10) : 0

        // Update display value with formatting
        const formatted = numericValue ? new Intl.NumberFormat('vi-VN').format(numericValue) : ''
        setDisplayValue(formatted)

        // Propagate numeric value
        if (onChange) {
            onChange(numericValue)
        }
    }

    return (
        <Input
            {...props}
            type="text"
            value={displayValue}
            onChange={handleChange}
        />
    )
}
