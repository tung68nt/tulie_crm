'use server'
import { createClient } from '../server'
import { Product } from '@/types'

export async function getProducts() {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('name', { ascending: true })

        if (error) {
            console.error('Error fetching products:', error)
            return []
        }

        return data as Product[]
    } catch (err) {
        console.error('Fatal error in getProducts:', err)
        return []
    }
}

export async function getProductById(id: string) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching product by id:', error)
            return null
        }

        return data as Product
    } catch (err) {
        console.error('Fatal error in getProductById:', err)
        return null
    }
}


export async function createProduct(product: Partial<Product>) {
    try {
        const supabase = await createClient()
        // Map unit_price to price for database schema compatibility if needed
        const dbProduct = {
            ...product,
            price: product.price || (product as any).unit_price
        }
        delete (dbProduct as any).unit_price

        const { data, error } = await supabase
            .from('products')
            .insert([dbProduct])
            .select()
            .single()

        if (error) {
            console.error('Error creating product:', error)
            throw error
        }
        return data
    } catch (err) {
        console.error('Fatal error in createProduct:', err)
        throw err
    }
}

export async function updateProduct(id: string, product: Partial<Product>) {
    try {
        const supabase = await createClient()
        // Only send fields that exist in the DB table
        const dbFields: Record<string, any> = {}
        const allowedKeys = ['name', 'sku', 'brand', 'category', 'description', 'unit', 'price', 'cost_price', 'is_active', 'default_templates']
        for (const key of allowedKeys) {
            if (key in product) {
                dbFields[key] = (product as any)[key]
            }
        }
        const { data, error } = await supabase
            .from('products')
            .update(dbFields)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating product:', error)
            throw error
        }
        return data
    } catch (err) {
        console.error('Fatal error in updateProduct:', err)
        throw err
    }
}

export async function deleteProduct(id: string) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting product:', error)
            throw error
        }
        return true
    } catch (err) {
        console.error('Fatal error in deleteProduct:', err)
        throw err
    }
}
