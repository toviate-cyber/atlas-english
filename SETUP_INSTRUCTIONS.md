# Atlas English - Opción 1 Setup

## 📋 Paso 1: Preparar la Base de Datos

### 1.1 Ir a Supabase

1. Abre: https://supabase.com
2. Entra a tu proyecto: `atlas-english`
3. Ve a **SQL Editor** (lado izquierdo)
4. Crea una nueva query

### 1.2 Ejecutar el Setup SQL

Copia TODO el contenido de `setup.sql` y pégalo en el SQL Editor de Supabase.

**Ubicación:** `/home/tovi/victor-english/setup.sql`

Luego:
1. Click **Run** (botón azul)
2. Espera a que se complete
3. Verifica que las 5 tablas se crearon

---

## 🔧 Paso 2: Variables de Entorno

Verifica que en `.env.local` tengas:

```
NEXT_PUBLIC_SUPABASE_URL=https://uxpqtlppygdheimjtmkl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_TKRzrwXWgWSlPKqN5UbS2g_q2chB7oo
SUPABASE_SERVICE_ROLE_KEY=xxxxx
```

**El `SUPABASE_SERVICE_ROLE_KEY` lo encuentras en:**
1. Supabase → Settings → API → `service_role` (llave secreta)
2. Cópiala y agrégala a `.env.local`

---

## 🚀 Paso 3: Deploy

```bash
cd /home/tovi/victor-english

# Install dependencies
npm install

# Build
npm run build

# Deploy
npx vercel deploy --prod
```

---

## 🎯 Paso 4: Probar

### Teacher Login
1. Abre: `https://tu-sitio.vercel.app/login`
2. Email: `victorjamesjordans@gmail.com`
3. Password: `123456`
4. Deberías ver el dashboard

### Student Access
1. Ve a `/platform.html` (o `/mvp.html`)
2. El estudiante ve la plataforma original
3. Los datos se sincronizan con la BD

---

## 📝 Cambios Realizados

### Nuevos Archivos:
- `pages/api/auth/login.js` - Login del profesor
- `pages/api/students.js` - CRUD estudiantes
- `pages/api/sessions.js` - CRUD sesiones
- `pages/api/comments.js` - CRUD comentarios
- `pages/api/progress.js` - CRUD progreso
- `pages/teacher.js` - Dashboard profesor
- `pages/login.js` - Página de login
- `setup.sql` - SQL para crear BD

### Modificados:
- `pages/index.js` - Redirige a login

---

## ✅ Checklist

- [ ] SQL ejecutado en Supabase
- [ ] `SUPABASE_SERVICE_ROLE_KEY` agregado
- [ ] Deploy completado
- [ ] Login funciona
- [ ] Profesor puede agregar estudiantes
- [ ] Profesor puede crear sesiones
- [ ] Estudiante ve los cambios en tiempo real

---

## 🐛 Debug

Si hay errores:

1. **Abre la consola del navegador** (F12)
2. Mira los errores en Network y Console
3. Reporta qué dice el error exacto

---

**¿Listo? Hazme saber cuando hayas completado los pasos.**
