import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://uxpqtlppygdheimjtmkl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4cHF0bHBweWdkaGVpbWp0bWtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ5MjI1NiwiZXhwIjoyMDkzMDY4MjU2fQ._KzGP3AF_1zuoRV3gCDjRzrLyEC32tp16QZLinwgIS8'
)

async function addFabricioToDatabase() {
  console.log('🛠️  Añadiendo Fabricio a la base de datos...\n')
  
  // Intentar con columnas básicas
  const { data, error } = await supabase
    .from('students')
    .insert([
      {
        name: 'Fabricio Veliz',
        email: 'fabricioenglishtutoring@gmail.com'
      }
    ])
    .select()
  
  if (error) {
    console.log('❌ Error al insertar:', error.message)
    console.log('\nIntentando con diferentes columnas...')
    
    // Si falla, intentar descubrir las columnas
    const { data: existing, error: err2 } = await supabase
      .from('students')
      .select('*')
      .limit(1)
    
    if (!err2 && existing.length > 0) {
      console.log('Columnas de tabla students:', Object.keys(existing[0]))
    }
  } else {
    console.log('✅ Fabricio añadido correctamente:')
    console.log(JSON.stringify(data, null, 2))
  }
  
  // Ver estado final
  console.log('\n📋 Estado actual de estudiantes:')
  const { data: students } = await supabase
    .from('students')
    .select('*')
  
  if (students) {
    console.log(`Total: ${students.length} estudiante(s)`)
    students.forEach(s => {
      console.log(`  - ${s.name} (${s.email})`)
    })
  }
}

addFabricioToDatabase()
