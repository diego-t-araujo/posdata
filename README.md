# Posdata:

**Ah, y una cosa más: el dato.**

Sitio de Posdata:, informes mensuales de sociología con datos, por Diego Tomás Araujo Poumé.

## Cómo está organizado

- `index.html`: la página principal (presentación, informes, servicios, sobre mí, contacto).
- `assets/posdata.css`: colores, tipografías y estilos de la marca. Todas las páginas lo usan.
- `informes/plantilla.html`: la plantilla de un informe. No se publica en el menú.
- `informes/01.html`, `02.html`…: un archivo por informe.
- `tecnica/`: piezas didácticas sobre cómo se hace un trabajo con datos (por ejemplo, `modelo-predictivo.html`). Van en el archivo de informes con la etiqueta "Técnica", sin número.
- `informes/img/`: los gráficos de los informes.
- `informes/fuentes/NN/`: datos, piezas y script (`armar.py`) de cada informe interactivo. Cada carpeta tiene su README con los pasos.

## Cómo publicar un informe nuevo

Los informes interactivos (desde el N° 01) se arman con `informes/fuentes/NN/armar.py`: copiá la carpeta del informe anterior y seguí su README. Para un informe simple, sin gráficos interactivos:

1. Copiá `informes/plantilla.html` con el número que sigue, por ejemplo `informes/02.html`.
2. Reemplazá todo lo que está entre corchetes.
3. Subí los gráficos a `informes/img/`.
4. En `index.html`, actualizá el bloque "Último informe" y sumá una línea en "Todos los informes".

## Paleta

Abismo #013440 · Petróleo #234D68 · Pizarra #566B81 · Rosa #F66C89 · Rosa texto #C7375A · Papel #F5F3F0.

Regla: una sola cosa en rosa por pieza, el dato.
