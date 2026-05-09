import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://uxpqtlppygdheimjtmkl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4cHF0bHBweWdkaGVpbWp0bWtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ5MjI1NiwiZXhwIjoyMDkzMDY4MjU2fQ._KzGP3AF_1zuoRV3gCDjRzrLyEC32tp16QZLinwgIS8'
)

async function fixFabricioData() {
  console.log('🔍 Analizando el problema de Fabricio...\n')
  
  // 1. Ver todos los estudiantes
  const { data: students, error: err1 } = await supabase
    .from('students')
    .select('*')
  
  if (err1) {
    console.log('❌ Error en students:', err1.message)
  } else {
    console.log('✅ ESTUDIANTES EN BD:')
    if (students.length === 0) {
      console.log('   (vacío - tabla existe pero sin datos)')
    } else {
      students.forEach(s => {
        console.log(`   - ${s.name || s.email} (${s.email})`)
      })
    }
  }
  
  console.log('\n')
  
  // 2. Ver estructura de la tabla
  const { data: columns, error: err2 } = await supabase
    .from('students')
    .select('*')
    .limit(0)
  
  if (err2) {
    console.log('⚠️ No puedo ver columnas:', err2.message)
  } else {
    console.log('✅ ESTRUCTURA de tabla "students":', Object.keys(students[0] || {}))
  }
  
  console.log('\n')
  
  // 3. Buscar resultados de exámenes de Fabricio
  const { data: results, error: err3 } = await supabase
    .from('exam_results')
    .select('*')
    .ilike('email', '%fabricio%')
  
  if (err3) {
    console.log('❌ Error buscando exam_results:', err3.message)
  } else {
    console.log('✅ RESULTADOS de Fabricio:')
    if (results.length === 0) {
      console.log('   (vacío - sus resultados no se guardaron)')
    } else {
      console.log(JSON.stringify(results, null, 2))
    }
  }
  
  console.log('\n')
  
  // 4. Ver TODAS las tablas disponibles
  const { data: allTables, error: err4 } = await supabase
    .query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `)
  
  if (err4) {
    console.log('⚠️ No puedo listar tablas con query')
  } else {
    console.log('✅ TABLAS en la BD:', allTables.map(t => t.table_name).join(', '))
  }
}

fixFabricioData()
