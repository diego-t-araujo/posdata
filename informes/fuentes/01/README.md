# Fuentes del informe N° 01 — Empleo y salario real (noviembre 2026)

Todo lo necesario para volver a armar `informes/01.html` y para preparar el informe siguiente.

## Qué hay en esta carpeta

| Archivo | Qué es |
| --- | --- |
| `armar.py` | Arma el informe. Lee los datos, calcula las series y une las piezas en un solo HTML. |
| `piezas/cabeza.html` | Estilos de la página (identidad Posdata:). |
| `piezas/cuerpo.html` | Textos: cabecera, preguntas, títulos, cifras destacadas, análisis y P.D. |
| `piezas/graficos.js` | Código de los gráficos, segmentadores y botones. Incluye los datos de la EIL. |
| `datos/ipc.csv` | IPC nivel general (INDEC), dic-2016 a oct-2026. |
| `datos/emp.csv` | Empleo registrado por modalidad (SIPA), en miles, 2012 a ago-2026. |
| `datos/rem.csv` | Remuneración bruta mediana y promedio (SIPA), dic-2016 a ago-2026. |
| `datos/smvm.csv` | Salario mínimo, vital y móvil, dic-2016 a nov-2026. |
| `datos/canastas.csv` | CBA y CBT por adulto equivalente (INDEC), dic-2016 a oct-2026. |
| `datos/excel/` | Planillas limpias con fórmulas: ingresos y trabajo, y SMVM. |

## Cómo se arma

Desde esta carpeta:

```
python armar.py
```

Escribe `informes/01.html` (el nombre sale del nombre de la carpeta). Necesita `pandas`.

## Qué calcula `armar.py`

- Salario real: remuneración nominal llevada a pesos de `MES_PRECIOS` con el IPC.
- Variación interanual real de la mediana y el promedio.
- Índices de empleo con base `BASE_EMPLEO` = 100.
- Brecha: promedio / mediana − 1.
- SMVM real y nominal.
- Canastas por adulto equivalente. La página multiplica por las unidades de cada hogar (1; 2,46; 3,09; 3,25).

## Qué NO se actualiza solo

Estas cifras están escritas a mano en `piezas/cuerpo.html` y hay que revisarlas cada mes:

- La cabecera: título, texto de introducción y las seis cifras de arriba.
- Las tres cifras de los apartados de empleo, salario real y variación interanual.
- Las tres cifras de la EIL y los títulos de cada apartado.
- Todos los análisis desplegables.
- El P.D. del final.

Se calculan solas a partir de los datos: la ilustración de la cabecera, las cifras de canastas y de brecha, y todos los gráficos.

Los datos de la EIL (tabla por rama, tamaño y aglomerado) están dentro de `piezas/graficos.js`, en la constante `EIL`.

## Decisiones de método

- El período de comparación es desde noviembre de 2023. Se marca por la fecha, sin nombrar gestiones.
- Los segmentadores arrancan en "3 años".
- Los gráficos de salario excluyen junio y diciembre, que incluyen aguinaldo.
- La serie de empleo es original, no desestacionalizada: comparar siempre contra el mismo mes de otro año.
- Salario neto estimado = bruto × 0,83 (11% jubilación, 3% obra social, 3% PAMI). No descuenta Ganancias ni cuota sindical.
- La familia tipo es el hogar 2 del INDEC: 4 integrantes, 3,09 adultos equivalentes.
- Deflactor: IPC-INDEC, que sigue con ponderaciones de la ENGHo 2004/05.
- En la planilla original de SIPA, las filas de remuneración de 2021 a 2024 estaban fuera de orden y las fórmulas interanuales daban mal. Los CSV de acá ya están ordenados y el cálculo se hace por fecha.

## Cómo preparar el informe siguiente

1. Copiar esta carpeta como `informes/fuentes/02/`.
2. Actualizar los CSV de `datos/` con los meses nuevos (mismas columnas). Revisar que el SIPA venga en orden.
3. En `armar.py`, cambiar `MES_PRECIOS` al último mes con datos de salario.
4. Si hay EIL nueva, actualizar la constante `EIL` en `piezas/graficos.js`.
5. Revisar y reescribir las cifras y textos de `piezas/cuerpo.html` (lista de arriba). Cambiar "N° 01 · Noviembre de 2026" en la cabecera.
6. Correr `python armar.py` y abrir `informes/02.html` para revisarlo.
7. En `index.html`, actualizar el bloque "Último informe" (título, bajada, P.D. y fuente) y sumar una línea en "Todos los informes".
8. Subir los cambios a GitHub.

## Pendientes e ideas

- Pedir el anexo en Excel de la EIL para graficar la serie de entradas y salidas.
- Sumar una línea de sensibilidad con un IPC de canasta 2017/18 (González-Rozada o Equilibra).
- Completar el SMVM real de noviembre cuando salga el IPC de ese mes.
- Cruzar la brecha con percentiles de la EPH y sumar a los trabajadores informales.
- Simplificar los controles del apartado de canastas.
- Aclarar en los análisis que están escritos para la vista inicial de cada gráfico.
