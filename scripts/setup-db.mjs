import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://uxpqtlppygdheimjtmkl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4cHF0bHBweWdkaGVpbWp0bWtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ5MjI1NiwiZXhwIjoyMDkzMDY4MjU2fQ._KzGP3AF_1zuoRV3gCDjRzrLyEC32tp16QZLinwgIS8'
)

async function setupDatabase() {
  console.log('🛠️  Configurando base de datos...\n')
  
  // 1. Registrar a Fabricio en students
  console.log('📝 Registrando a Fabricio Veliz...')
  const { data: fabricio, error: err1 } = await supabase
    .from('students')
    .insert([
      {
        name: 'Fabricio Veliz',
        email: 'fabricioenglishtutoring@gmail.com',
        level: null,
        score: 0,
        progress: 0,
        points: 0,
        last_activity: new Date().toISOString()
      }
    ])
    .select()
  
  if (err1) {
    console.log('❌ Error:', err1.message)
  } else {
    console.log('✅ Fabricio registrado:', fabricio)
  }
  
  console.log('\n')
  
  // 2. Crear tabla exam_results si no existe
  console.log('📊 Creando tabla exam_results...')
  const { error: err2 } = await supabase.rpc('create_exam_results_table')
  
  if (err2 && !err2.message.includes('already exists')) {
    console.log('⚠️  RPC no disponible, intentando insert directo...')
    
    // Intentar insert directo (fallará si tabla no existe, pero eso es OK)
    const { error: err3 } = await supabase
      .from('exam_results')
      .insert([{
        email: 'fabricioenglishtutoring@gmail.com',
        name: 'Fabricio Veliz',
        score: 0,
        level: 'A0',
        timestamp: new Date().toISOString()
      }])
    
    if (err3 && err3.message.includes('exam_results')) {
      console.log('⚠️  Tabla exam_results no existe aún')
      console.log('    (esto es normal - la crearemos manualmente después)')
    }
  } else {
    console.log('✅ Tabla exam_results lista')
  }
  
  console.log('\n')
  
  // 3. Ver estudiantes finales
  const { data: finalStudents, error: err4 } = await supabase
    .from('students')
    .select('*')
  
  if (!err4) {
    console.log('✅ ESTUDIANTES FINALES en BD:')
    finalStudents.forEach(s => {
      console.log(`   - ${s.name} (${s.email})`)
    })
  }
  
  console.log('\n✅ Base de datos configurada!')
}

setupDatabase().catch(e => console.error('❌ Error fatal:', e.message))
