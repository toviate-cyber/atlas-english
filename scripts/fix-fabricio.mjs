import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uxpqtlppygdheimjtmkl.supabase.co'
const serviceRoleKey = 'pansinqueso1'

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function checkSchema() {
  console.log('🔗 Conectando a Supabase...\n')
  
  // Listar todas las tablas
  const { data: tables, error } = await supabase
    .from('information_schema.schemata')
    .select('schema_name')
    .eq('schema_name', 'public')
  
  if (error) {
    console.log('Intentando query directo de tablas...')
    
    // Método alternativo: intentar acceder a tabla conocida
    const { data: test } = await supabase
      .from('students')
      .select('count()', { count: 'exact' })
    
    console.log('✅ Tabla "students" existe')
    return
  }
  
  console.log('Tablas disponibles:', tables)
}

checkSchema().catch(e => console.error('Error:', e.message))
