import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://uxpqtlppygdheimjtmkl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4cHF0bHBweWdkaGVpbWp0bWtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ5MjI1NiwiZXhwIjoyMDkzMDY4MjU2fQ._KzGP3AF_1zuoRV3gCDjRzrLyEC32tp16QZLinwgIS8'
)

async function linkTeacherStudent() {
  console.log('🔗 Vinculando profesor a estudiante...\n')
  
  // Crear tabla teacher_students (registro de profesor-estudiante)
  // Primero intentamos insertar - si la tabla no existe, veremos el error
  
  const { data: fabricio } = await supabase
    .from('students')
    .select('id')
    .eq('email', 'fabricioenglishtutoring@gmail.com')
    .single()
  
  if (!fabricio) {
    console.log('❌ Fabricio no encontrado')
    return
  }
  
  console.log('✅ Fabricio encontrado (ID:', fabricio.id + ')')
  
  // Intentar crear vínculo
  const { data, error } = await supabase
    .from('teacher_students')
    .insert([
      {
        teacher_email: 'victorjamesjordan@gmail.com',
        student_id: fabricio.id
      }
    ])
  
  if (error) {
    if (error.message.includes('teacher_students')) {
      console.log('⚠️  Tabla teacher_students no existe.')
      console.log('    Necesito crearla en Supabase Dashboard con SQL.')
    } else {
      console.log('❌ Error:', error.message)
    }
  } else {
    console.log('✅ Vínculo creado')
  }
}

linkTeacherStudent()
