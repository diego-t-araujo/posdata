"""Arma el informe N° 01 de Posdata: a partir de los datos y las piezas.

Uso (desde esta carpeta):
    python armar.py            # escribe ../../<nombre de esta carpeta>.html (acá, 01.html)
    python armar.py salida.html

Qué hace:
1. Lee los CSV de datos/ (IPC, empleo SIPA, remuneración SIPA, SMVM y canastas).
2. Calcula las series que usan los gráficos (salario real, variaciones interanuales,
   índices de empleo, brecha promedio/mediana, SMVM real y canastas) y las guarda
   como JSON dentro de la página.
3. Une cabeza.html + cuerpo.html + datos + graficos.js en un solo HTML.

Requiere pandas.
"""
import json
import sys
from pathlib import Path

import pandas as pd

AQUI = Path(__file__).resolve().parent
DATOS = AQUI / "datos"
PIEZAS = AQUI / "piezas"

# Parámetros del informe. Al actualizar los datos, cambiar MES_PRECIOS al último mes con salario.
MES_PRECIOS = "2026-08-01"   # los salarios reales se expresan en pesos de este mes
BASE_EMPLEO = "2023-11-01"   # índice de empleo = 100 en este mes
INICIO_EMPLEO = "2017-01-01" # primer mes de las series de empleo

TIPOS = {
    "Empleo asalariado en el sector privado": "priv",
    "Empleo asalariado en el sector público": "pub",
    "Empleo en casas particulares": "casas",
    "Trabajo Independientes Monotributo": "mono",
    "Trabajo Independientes Autónomos": "auto",
    "Trabajo Independientes Monotributo Social": "monosoc",
    "Total": "total",
}


def leer():
    ipc = pd.read_csv(DATOS / "ipc.csv", parse_dates=["fecha"]).set_index("fecha").sort_index()
    emp = pd.read_csv(DATOS / "emp.csv", parse_dates=["fecha"])
    rem = pd.read_csv(DATOS / "rem.csv", parse_dates=["fecha"])
    smvm = pd.read_csv(DATOS / "smvm.csv", parse_dates=["fecha"]).set_index("fecha")["smvm"]
    can = pd.read_csv(DATOS / "canastas.csv", parse_dates=["fecha"]).set_index("fecha")
    return ipc, emp, rem, smvm, can


def series(ipc, emp, rem, smvm, can):
    r = rem.pivot(index="fecha", columns="medida", values="corr").sort_index()
    r.columns = ["med", "prom"]  # Remuneración mediana, Remuneración promedio
    base = ipc.ipc.loc[MES_PRECIOS]
    f = base / ipc.ipc.reindex(r.index)
    real = r.mul(f, axis=0)
    ia = real.pct_change(12) * 100
    ratio = r.prom / r.med

    e = emp.pivot(index="fecha", columns="tipo", values="cant").sort_index()
    e = e.loc[INICIO_EMPLEO:].rename(columns=TIPOS)
    b = e.loc[BASE_EMPLEO]

    sm = smvm.reindex(r.index)
    out = {
        "emp": {
            "d": [d.strftime("%Y-%m") for d in e.index],
            **{k: [round(v, 1) for v in e[k]] for k in TIPOS.values()},
            **{k + "_i": [round(v, 2) for v in (e[k] / b[k] * 100)] for k in ["priv", "pub", "casas", "mono", "auto"]},
        },
        "rem": {
            "d": [d.strftime("%Y-%m") for d in real.index],
            "med": [round(v) for v in real.med],
            "prom": [round(v) for v in real.prom],
            "med_n": [round(v) for v in r.med],
            "prom_n": [round(v) for v in r.prom],
            "med_ia": [None if pd.isna(v) else round(v, 1) for v in ia.med],
            "prom_ia": [None if pd.isna(v) else round(v, 1) for v in ia.prom],
            "ratio": [round(v, 3) for v in ratio],
            "smvm": [round(v) for v in sm * f],
            "smvm_n": [int(v) for v in sm],
            "cba": [round(v, 2) for v in can.cba_ae.reindex(r.index)],
            "cbt": [round(v, 2) for v in can.cbt_ae.reindex(r.index)],
        },
    }
    return out


def armar(salida):
    datos = series(*leer())
    html = (
        (PIEZAS / "cabeza.html").read_text(encoding="utf-8")
        + (PIEZAS / "cuerpo.html").read_text(encoding="utf-8")
        + '<script type="application/json" id="data">\n'
        + json.dumps(datos, separators=(",", ":"), ensure_ascii=True)
        + "</script><script>\n"
        + (PIEZAS / "graficos.js").read_text(encoding="utf-8")
        + "\n</script></body></html>\n"
    )
    Path(salida).write_text(html, encoding="utf-8")
    return salida


if __name__ == "__main__":
    destino = sys.argv[1] if len(sys.argv) > 1 else str(AQUI.parent.parent / f"{AQUI.name}.html")
    print("Escrito:", armar(destino))
