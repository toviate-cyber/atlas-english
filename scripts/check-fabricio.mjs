import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://uxpqtlppygdheimjtmkl.supabase.co',
  'pansinqueso1'
)

async function checkData() {
  console.log('📊 Revisando datos de Supabase...\n')
  
  // 1. Ver todos los estudiantes
  const { data: students, error: err1 } = await supabase
    .from('students')
    .select('*')
  
  if (err1) {
    console.log('❌ Error en students:', err1)
  } else {
    console.log('✅ ESTUDIANTES REGISTRADOS:')
    console.log(JSON.stringify(students, null, 2))
  }
  
  console.log('\n---\n')
  
  // 2. Ver resultados de exámenes
  const { data: results, error: err2 } = await supabase
    .from('exam_results')
    .select('*')
  
  if (err2) {
    console.log('❌ Error en exam_results:', err2)
  } else {
    console.log('✅ RESULTADOS DE EXÁMENES:')
    console.log(JSON.stringify(results, null, 2))
  }
  
  console.log('\n---\n')
  
  // 3. Buscar específicamente a Fabricio
  const { data: fabricio, error: err3 } = await supabase
    .from('students')
    .select('*')
    .ilike('email', '%fabricio%')
  
  if (err3) {
    console.log('❌ Error buscando Fabricio:', err3)
  } else {
    if (fabricio && fabricio.length > 0) {
      console.log('✅ FABRICIO ENCONTRADO EN STUDENTS:')
      console.log(JSON.stringify(fabricio, null, 2))
    } else {
      console.log('⚠️ Fabricio NO está en la tabla de students')
    }
  }
}

checkData()
