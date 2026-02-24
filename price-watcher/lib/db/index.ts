import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL')
}
if (!supabaseKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface Product {
  id: string
  url: string
  name: string
  last_price: number | null
  last_checked_at: string | null
  created_at: string
  updated_at: string
}

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('last_checked_at', { ascending: false, nullsFirst: true })

  if (error) throw error
  return (data || []) as Product[]
}

export async function createProduct(input: { url: string; name: string }): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert({ url: input.url, name: input.name })
    .select('*')
    .single()

  if (error) throw error
  return data as Product
}

export async function updateProductPrice(id: string, price: number): Promise<Product> {
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('products')
    .update({ last_price: price, last_checked_at: now })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return data as Product
}
