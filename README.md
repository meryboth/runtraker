# runtrack.

Un diario de corridas que parece hecho a mano. Anotá cada día si corriste, dónde (🌳 afuera o 🏠 adentro), la distancia y el tiempo, y mirá tu año en un tablero verde estilo GitHub.

**Probala:** https://meryboth.github.io/runtraker/

> Prototipo web para validar la idea antes de armar la versión nativa para iOS en Swift.

## Qué hace

- **Hoy:** cargás el día directo desde el home: corriste o no, afuera o adentro, distancia y tiempo (el ritmo se calcula solo).
- **Esta semana:** siete círculos dibujados a mano, con los km y dónde corriste.
- **El tablero:** un cuadradito por día, más verde cuanto más corriste. Tocás cualquiera para editarlo.
- **Números:** totales, rachas, mejor ritmo, qué días de la semana corrés (y cuáles se te escapan) y cuánto corrés afuera vs. adentro.
- **Historial:** calendario mes a mes.
- **Sin scroll:** cada pantalla entra entera, en el celular y en la compu.
- **Local primero:** todo se guarda en el navegador; si iniciás sesión con tu mail, se sincroniza con Supabase.

## Stack

- [Next.js 15](https://nextjs.org) (App Router, export estático) + React 19 + TypeScript
- CSS propio: tipografías [Shantell Sans](https://fonts.google.com/specimen/Shantell+Sans) y [Caveat](https://fonts.google.com/specimen/Caveat), bordes con filtros SVG para el trazo a mano
- [Supabase](https://supabase.com) para cuentas (link mágico por mail) y sincronización, con Row Level Security
- GitHub Pages para el hosting

## Correrla en local

```bash
npm install
cp .env.example .env.local   # completá la URL y la anon key de Supabase (opcional)
npm run dev
```

Abrí http://localhost:3000. Sin las variables de Supabase la app funciona igual, guardando solo en el navegador.

## Estructura

```
app/            layout, metadatos, ícono, manifest y estilos globales
components/     pantallas y piezas de UI (TodayPanel, DayForm, Board, Numbers, History…)
lib/            lógica sin React: fechas, métricas, formato, store y cliente de Supabase
supabase/       migraciones SQL (tabla run_days + RLS)
design/         ilustraciones de exploración
```

La lógica de `lib/` no depende de React a propósito: es la que se traduce casi 1:1 a modelos de Swift para iOS.

## Base de datos

Una fila por día y por usuario en `public.run_days` (`day`, `ran`, `km`, `sec`, `place`). Cada usuario solo puede leer y escribir sus propios días (RLS). Las migraciones están en [`supabase/migrations`](supabase/migrations).

## Deploy

Cada push a `main` corre [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): build estático con `NEXT_PUBLIC_BASE_PATH=/runtraker` y publicación en GitHub Pages.

Además, [`.github/workflows/keepalive.yml`](.github/workflows/keepalive.yml) consulta la base una vez por día para que el plan gratis de Supabase no pause el proyecto por inactividad. Si la consulta falla, GitHub avisa por mail.

Para el login por mail en producción, la URL `https://meryboth.github.io/runtraker/` tiene que estar en Supabase → Authentication → URL Configuration → Redirect URLs.
