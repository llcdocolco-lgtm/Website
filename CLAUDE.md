# CLAUDE.md — Docolco LLC · USA E-commerce

## Qué es este proyecto
Sitio web de e-commerce para **Docolco LLC**, empresa distribuidora
de productos de limpieza, packaging y protección en EE.UU.
El sitio está en inglés y procesa pagos en USD via Stripe.

## Empresa
- Nombre: Docolco LLC
- País: United States
- Tipo: Marketer / Distributor
- Email: info@docolco.com
- Wholesale: wholesale@docolco.com

## Stack
- HTML5 + CSS3 + JS vanilla (archivos separados)
- Stripe.js v3 (CDN) para pagos
- Google Fonts: Outfit
- Sin npm, sin bundler

## Paleta (NO cambiar)
| Variable    | Hex       | Uso                    |
|-------------|-----------|------------------------|
| --red       | #C8202A   | Acento, CTAs, badges   |
| --red-dark  | #A01820   | Hover states           |
| --blue      | #1A3FA8   | Hero, nav, modal       |
| --blue-dark | #122E80   | Hover states           |
| --gold      | #C8A020   | Logo sub, highlights   |
| --white     | #FFFFFF   | Fondos                 |
| --light     | #F8F8F6   | Fondos secundarios     |

## Tipografía
- Outfit (Google Fonts) — todo el sitio

## Productos (9 total)
1. Liquid Detergent        $8.99  — cleaning
2. Cloth Softener          $7.99  — cleaning
3. Floor Cleaner           $9.99  — cleaning
4. Dishwashing Liquid      $5.99  — cleaning
5. Soft Gloves             $4.99  — protection
6. Cling Wrap              $6.49  — packaging
7. Stretch Film            $14.99 — packaging
8. Garbage Bags            $8.49  — waste
9. Bright Steel Spiral     $3.99  — cleaning

## Imágenes requeridas
Colocar en img/productos/:
- liquid-detergent.jpg
- cloth-softener.jpg
- floor-cleaner.jpg
- dishwashing-liquid.jpg
- soft-gloves.jpg
- cling-wrap.jpg
- stretch-film.jpg
- garbage-bag.jpg
- bright-steel-spiral.jpg

Logo en img/logo/:
- docolco-logo.png  ← el original de 48KB

## Stripe
- Clave pública: reemplazar STRIPE_PUBLIC_KEY en assets/js/main.js
- Cuenta Bank of America del cliente ya configurada en Stripe
- Tarjeta de prueba: 4242 4242 4242 4242

## Estructura
docolco/
├── index.html
├── CLAUDE.md
├── assets/
│   ├── css/styles.css
│   └── js/main.js
└── img/
    ├── logo/docolco-logo.png
    ├── productos/[9 imágenes]
    └── placeholder.svg

## Reglas
1. Todo el texto en inglés
2. Precios en USD
3. Sin naranja — paleta rojo/azul/dorado
4. Mobile-first
5. Preview: npx serve . -p 3000
6. Dominio pendiente: docolco.com o similar

## Páginas legales pendientes (para producción)
- Privacy Policy (requerida para usuarios de California - CCPA)
- Terms of Service
- Shipping & Returns Policy
- Store Policy
- FAQ
