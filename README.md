# PROJECT BUILD

Portafolio público de los sitios web que creamos y publicamos para negocios
locales de Hopelchén y la región. Cada tarjeta abre un sitio independiente que
está funcionando en línea.

**En línea:** https://project-build.pages.dev

## Qué hay aquí

- `index.html` — página del portafolio. Sin build: HTML + CSS + JS estáticos.
- `styles.css` — estilos
- `script.js` — buscador, filtros por categoría, marquee, animaciones
- `thumbs/` — 17 miniaturas móviles (390×844) de cada sitio

## Los 17 sitios

| Proyecto | Categoría | URL |
|---|---|---|
| Coctelería El Pescadito | Mariscos | https://cocteler-a-el-pescadito.pages.dev |
| El Rey del Peperoni | Pizzería | https://el-rey-del-peperoni.pages.dev |
| HoolKuum | Restaurante | https://hoolkuum.pages.dev |
| Don Bonelito | Restaurante | https://don-bonelito.pages.dev |
| La Palapa | Restaurante | https://la-palapa.pages.dev |
| La Capilla | Restaurante | https://la-capilla-8p4.pages.dev |
| El Camarón Feliz | Mariscos | https://el-camaron-feliz.pages.dev |
| Monster Delicacies | Restaurante | https://monster-delicacies.pages.dev |
| Asadero El Pollo | Asadero | https://demo1-3d3.pages.dev |
| Menú con carrito (demo) | Demo | https://demo2-2ow.pages.dev |
| Cafetería del Parque | Cafetería | https://cafeteria-del-parque.pages.dev |
| Sendero's | Panadería | https://sendero-s.pages.dev |
| Hotel Los Chenes | Hotel | https://hotelchenes.pages.dev |
| Odentica Hopelchén | Odontología | https://odentica-hopelchen.pages.dev |
| UMyR | Clínica | https://umyr.pages.dev |
| CYGR | Grabados láser | https://cygr.pages.dev |
| Bonishop | Tienda | https://bonishop.pages.dev |

## Notas técnicas

- Los mockups de teléfono respetan la proporción real de pantalla (390/844).
- Las miniaturas usan `loading="lazy"`; si una falla, la tarjeta muestra el
  gradiente de color en su lugar.
- Las URLs con sufijo (`demo1-3d3`, `demo2-2ow`, `la-capilla-8p4`) existen
  porque el nombre corto ya estaba tomado a nivel global en Cloudflare Pages.
- `prefers-reduced-motion` está respetado: sin animaciones si el usuario las
  desactivó en su sistema.

## Publicación

Cloudflare Pages, proyecto `project-build`. Sin comando de build: se publica el
directorio raíz.

```bash
npx wrangler@4 pages deploy . --project-name=project-build --branch=main
```

## Contacto

Las llamadas a la acción apuntan a <https://excepcional-build.pages.dev>.
Para poner un número de WhatsApp propio, busca `excepcional-build.pages.dev`
en `index.html` y reemplázalo por un enlace `https://wa.me/<tu-numero>`.
