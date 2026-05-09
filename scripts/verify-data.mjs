import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://uxpqtlppygdheimjtmkl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4cHF0bHBweWdkaGVpbWp0bWtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ5MjI1NiwiZXhwIjoyMDkzMDY4MjU2fQ._KzGP3AF_1zuoRV3gCDjRzrLyEC32tp16QZLinwgIS8'
)

async function verifyData() {
  console.log('🔍 Verificando datos en Supabase...\n')
  
  // 1. Ver Fabricio
  const { data: fabricio } = await supabase
    .from('students')
    .select('*')
    .eq('email', 'fabricioenglishtutoring@gmail.com')
  
  console.log('✅ Fabricio en students:')
  console.log(JSON.stringify(fabricio, null, 2))
  
  console.log('\n')
  
  // 2. Ver teacher_students
  const { data: teacherStudents, error: err1 } = await supabase
    .from('teacher_students')
    .select('*')
  
  if (err1) {
    console.log('❌ Error en teacher_students:', err1.message)
  } else {
    console.log('✅ teacher_students:')
    console.log(JSON.stringify(teacherStudents, null, 2))
  }
  
  console.log('\n')
  
  // 3. Ver exam_results
  const { data: results, error: err2 } = await supabase
    .from('exam_results')
    .select('*')
  
  if (err2) {
    console.log('❌ Error en exam_results:', err2.message)
  } else {
    console.log('✅ exam_results:')
    console.log(JSON.stringify(results, null, 2))
  }
}

verifyData()
