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
}


export async function createProduct(product: Partial<Product>) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single()

    if (error) throw error
    return data
}

export async function updateProduct(id: string, product: Partial<Product>) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function deleteProduct(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

    if (error) throw error
    return true
}
