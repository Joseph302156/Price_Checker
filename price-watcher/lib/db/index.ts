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

export type Availability = 'in_stock' | 'out_of_stock' | 'unavailable'

export interface Product {
  id: string
  url: string
  name: string
  last_price: number | null
  last_checked_at: string | null
  on_sale: boolean | null
  category: string | null
  availability: Availability | null
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

export async function createProduct(input: {
  url: string
  name: string
  category?: string | null
}): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert({
      url: input.url,
      name: input.name,
      ...(input.category != null && input.category !== '' && { category: input.category }),
    })
    .select('*')
    .single()

  if (error) throw error
  return data as Product
}

export async function updateProductSync(
  id: string,
  data: {
    last_price: number
    on_sale?: boolean
    availability?: Availability
  }
): Promise<Product> {
  const now = new Date().toISOString()
  const { data: updated, error } = await supabase
    .from('products')
    .update({
      last_price: data.last_price,
      last_checked_at: now,
      ...(data.on_sale !== undefined && { on_sale: data.on_sale }),
      ...(data.availability !== undefined && { availability: data.availability }),
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return updated as Product
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

export async function updateProduct(
  id: string,
  data: { name?: string; category?: string | null }
): Promise<Product> {
  const payload: Record<string, unknown> = {}
  if (data.name !== undefined) payload.name = data.name.trim()
  if (data.category !== undefined) payload.category = data.category === '' ? null : data.category

  if (Object.keys(payload).length === 0) {
    const { data: existing } = await supabase.from('products').select('*').eq('id', id).single()
    if (!existing) throw new Error('Product not found')
    return existing as Product
  }

  const { data: updated, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return updated as Product
}

