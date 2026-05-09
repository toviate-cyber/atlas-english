import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://uxpqtlppygdheimjtmkl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4cHF0bHBweWdkaGVpbWp0bWtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ5MjI1NiwiZXhwIjoyMDkzMDY4MjU2fQ._KzGP3AF_1zuoRV3gCDjRzrLyEC32tp16QZLinwgIS8'
)

async function setupAndRegister() {
  console.log('🛠️  Creando tablas y registrando datos de Fabricio...\n')
  
  // 1. Intentar crear tabla teacher_students
  console.log('📋 Creando tabla teacher_students...')
  const sqlTeacher = `
    CREATE TABLE IF NOT EXISTS teacher_students (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      teacher_email VARCHAR(255) NOT NULL,
      student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      added_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(teacher_email, student_id)
    );
  `
  
  const { error: err1 } = await supabase.rpc('exec_sql', { sql: sqlTeacher })
  
  if (err1) {
    console.log('⚠️  No puedo ejecutar SQL directo (RPC no disponible)')
    console.log('    Necesitarás ejecutarlo manualmente en Supabase Dashboard')
  } else {
    console.log('✅ Tabla teacher_students creada')
  }
  
  // 2. Crear tabla exam_results
  console.log('📝 Creando tabla exam_results...')
  const sqlExam = `
    CREATE TABLE IF NOT EXISTS exam_results (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      student_email VARCHAR(255),
      score VARCHAR(10),
      level VARCHAR(10),
      answers JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `
  
  const { error: err2 } = await supabase.rpc('exec_sql', { sql: sqlExam })
  
  if (err2) {
    console.log('⚠️  Usando inserción directa para crear exam_results...')
    
    // Obtener ID de Fabricio
    const { data: fabricio } = await supabase
      .from('students')
      .select('id')
      .eq('email', 'fabricioenglishtutoring@gmail.com')
      .single()
    
    if (fabricio) {
      // Intentar insertar resultado (si tabla no existe, obtendremos error claro)
      const { error: insertErr } = await supabase
        .from('exam_results')
        .insert([
          {
            student_id: fabricio.id,
            student_email: 'fabricioenglishtutoring@gmail.com',
            score: 'A2',
            level: 'A2',
            answers: { placement_test: true }
          }
        ])
      
      if (insertErr && insertErr.message.includes('exam_results')) {
        console.log('❌ Tabla exam_results no existe - necesito SQL manual')
      } else if (insertErr) {
        console.log('Error:', insertErr.message)
      } else {
        console.log('✅ Resultado de Fabricio registrado')
      }
    }
  } else {
    console.log('✅ Tabla exam_results creada')
  }
  
  // 3. Actualizar perfil de Fabricio
  console.log('\n📊 Actualizando perfil de Fabricio...')
  const { error: updateErr } = await supabase
    .from('students')
    .update({ level_index: 1 }) // A2 = nivel 1
    .eq('email', 'fabricioenglishtutoring@gmail.com')
  
  if (updateErr) {
    console.log('❌ Error al actualizar:', updateErr.message)
  } else {
    console.log('✅ Nivel de Fabricio actualizado a A2')
  }
  
  // Ver estado final
  console.log('\n✅ Estado final de Fabricio:')
  const { data: fabricio } = await supabase
    .from('students')
    .select('*')
    .eq('email', 'fabricioenglishtutoring@gmail.com')
    .single()
  
  if (fabricio) {
    console.log(JSON.stringify(fabricio, null, 2))
  }
}

setupAndRegister()
