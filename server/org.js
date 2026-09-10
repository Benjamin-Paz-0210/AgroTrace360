import { all, get, run } from "./db.js";

export const PRODUCTOS_MERCADO = [
  {
    id: "sem-ccn51",
    categoria: "semilla",
    nombre: "Plantón CCN-51 certificado",
    unidad: "plantón",
    precio: 4.8,
    precioSocio: 3.5,
    imagen: "/uploads/market/sem-ccn51.jpg",
    descripcion: "Vivero SENASA / INIA. Clon para selva alta. Precio referencial: se actualiza luego.",
  },
  {
    id: "sem-vrae99",
    categoria: "semilla",
    nombre: "Plantón VRAE-99 certificado",
    unidad: "plantón",
    precio: 5.2,
    precioSocio: 3.9,
    imagen: "/uploads/market/sem-vrae99.jpg",
    descripcion: "Material fino de aroma. Certificado de vivero. Precio referencial.",
  },
  {
    id: "sem-nativo",
    categoria: "semilla",
    nombre: "Nativo fino de aroma",
    unidad: "plantón",
    precio: 6.0,
    precioSocio: 4.4,
    imagen: "/uploads/market/sem-nativo.jpg",
    descripcion: "Lote diferenciado para mercado de aroma. Precio referencial.",
  },
  {
    id: "abo-compost",
    categoria: "abono",
    nombre: "Compost / bocashi",
    unidad: "saco 50 kg",
    precio: 38,
    precioSocio: 29,
    imagen: "/uploads/market/abo-compost.jpg",
    descripcion: "Materia orgánica para pH y llenado. Precio referencial.",
  },
  {
    id: "abo-guano",
    categoria: "abono",
    nombre: "Guano de isla",
    unidad: "saco 50 kg",
    precio: 85,
    precioSocio: 68,
    imagen: "/uploads/market/abo-guano.jpg",
    descripcion: "Nitrógeno y fósforo de origen orgánico. Precio referencial.",
  },
  {
    id: "abo-cal",
    categoria: "abono",
    nombre: "Cal agrícola",
    unidad: "saco 40 kg",
    precio: 32,
    precioSocio: 24,
    imagen: "/uploads/market/abo-cal.jpg",
    descripcion: "Corrige acidez en puntos de sensor. Precio referencial.",
  },
  {
    id: "abo-k",
    categoria: "abono",
    nombre: "Potasio de llenado",
    unidad: "kg",
    precio: 9.5,
    precioSocio: 7.2,
    imagen: "/uploads/market/abo-k.jpg",
    descripcion: "Etapa de mazorca. No seguir solo con nitrógeno. Precio referencial.",
  },
  {
    id: "qui-cobre",
    categoria: "quimico",
    nombre: "Hidróxido de cobre",
    unidad: "kg",
    precio: 42,
    precioSocio: 33,
    imagen: "/uploads/market/qui-cobre.jpg",
    descripcion: "Un solo activo. 50 g / mochila 20 L. Precio referencial.",
  },
  {
    id: "qui-bt",
    categoria: "quimico",
    nombre: "Bacillus thuringiensis",
    unidad: "litro",
    precio: 48,
    precioSocio: 36,
    imagen: "/uploads/market/qui-bt.jpg",
    descripcion: "Cogollero. 30 ml / mochila 20 L. Precio referencial.",
  },
  {
    id: "qui-maleza",
    categoria: "quimico",
    nombre: "Herbicida de contacto (malezas)",
    unidad: "litro",
    precio: 55,
    precioSocio: 41,
    imagen: "/uploads/market/qui-maleza.jpg",
    descripcion: "Solo entre surcos. Nunca sobre plantón. Precio referencial.",
  },
];

export async function migrateOrg() {
  await run(`
    CREATE TABLE IF NOT EXISTS acopios (
      id TEXT PRIMARY KEY,
      nombre TEXT,
      zona TEXT,
      exportadora_id TEXT
    )
  `);
  await run(`
    CREATE TABLE IF NOT EXISTS socios (
      id TEXT PRIMARY KEY,
      dni TEXT UNIQUE,
      nombre TEXT,
      acopio_id TEXT,
      user_id TEXT,
      created_at TEXT
    )
  `);
  await run(`
    CREATE TABLE IF NOT EXISTS market_productos (
      id TEXT PRIMARY KEY,
      categoria TEXT,
      nombre TEXT,
      unidad TEXT,
      precio DOUBLE PRECISION,
      precio_socio DOUBLE PRECISION,
      imagen TEXT,
      descripcion TEXT
    )
  `);
  await run("ALTER TABLE users ADD COLUMN IF NOT EXISTS dni TEXT");
  await run("ALTER TABLE users ADD COLUMN IF NOT EXISTS acopio_id TEXT");
  await run("ALTER TABLE lotes ADD COLUMN IF NOT EXISTS acopio_id TEXT");
  await run("ALTER TABLE lotes ADD COLUMN IF NOT EXISTS seleccion TEXT");

  if (!(await get("SELECT id FROM acopios LIMIT 1"))) {
    await run("INSERT INTO acopios VALUES (?,?,?,?)", [
      "acopio-huallaga",
      "Cooperativa Alto Huallaga",
      "Tingo María",
      "exp-claudia",
    ]);
    await run("INSERT INTO acopios VALUES (?,?,?,?)", [
      "acopio-aucayacu",
      "Acopio Aucayacu",
      "Aucayacu",
      "exp-claudia",
    ]);
  }

  await run("UPDATE users SET acopio_id = 'acopio-huallaga', dni = '40123456' WHERE id = 'prod-jose' AND (dni IS NULL OR dni = '')");
  await run("UPDATE users SET acopio_id = 'acopio-huallaga', dni = '40987654' WHERE id = 'prod-elena' AND (dni IS NULL OR dni = '')");
  await run("UPDATE users SET acopio_id = 'acopio-aucayacu', dni = '40777777' WHERE id = 'prod-pedro' AND (dni IS NULL OR dni = '')");
  await run("UPDATE users SET acopio_id = 'acopio-huallaga' WHERE id = 'acopio-maria'");
  await run("UPDATE lotes SET acopio_id = 'acopio-huallaga' WHERE id IN ('LOT-TM-001','LOT-TM-002') AND (acopio_id IS NULL OR acopio_id = '')");
  await run("UPDATE lotes SET acopio_id = 'acopio-aucayacu' WHERE id = 'LOT-TM-003' AND (acopio_id IS NULL OR acopio_id = '')");
  await run("UPDATE lotes SET seleccion = 'seleccionado' WHERE id = 'LOT-TM-001' AND (seleccion IS NULL OR seleccion = '')");
  await run("UPDATE lotes SET seleccion = 'pendiente' WHERE id = 'LOT-TM-002' AND (seleccion IS NULL OR seleccion = '')");
  await run("UPDATE lotes SET seleccion = 'seleccionado' WHERE id = 'LOT-TM-003' AND (seleccion IS NULL OR seleccion = '')");

  const luis = await get("SELECT id FROM users WHERE id = 'acopio-luis'");
  if (!luis) {
    const crypto = await import("crypto");
    const pass = crypto.createHash("sha256").update("demo123").digest("hex");
    await run(
      "INSERT INTO users (id,email,password_hash,nombre,role,lote_id,comunidad,dni,acopio_id) VALUES (?,?,?,?,?,?,?,?,?)",
      [
        "acopio-luis",
        "luis@agrotrace.pe",
        pass,
        "Luis Campos (acopio Aucayacu)",
        "acopio",
        null,
        "Acopio Aucayacu",
        null,
        "acopio-aucayacu",
      ],
    );
  }

  if (!(await get("SELECT id FROM socios LIMIT 1"))) {
    const now = new Date().toISOString();
    await run("INSERT INTO socios VALUES (?,?,?,?,?,?)", [
      "soc-jose",
      "40123456",
      "José Huamán Quispe",
      "acopio-huallaga",
      "prod-jose",
      now,
    ]);
    await run("INSERT INTO socios VALUES (?,?,?,?,?,?)", [
      "soc-elena",
      "40987654",
      "Elena Ríos Pinedo",
      "acopio-huallaga",
      "prod-elena",
      now,
    ]);
    await run("INSERT INTO socios VALUES (?,?,?,?,?,?)", [
      "soc-pedro",
      "40777777",
      "Pedro Vásquez Tello",
      "acopio-aucayacu",
      "prod-pedro",
      now,
    ]);
  }

  for (const p of PRODUCTOS_MERCADO) {
    await run(
      `INSERT INTO market_productos (id, categoria, nombre, unidad, precio, precio_socio, imagen, descripcion)
       VALUES (?,?,?,?,?,?,?,?)
       ON CONFLICT (id) DO UPDATE SET
         categoria = EXCLUDED.categoria,
         nombre = EXCLUDED.nombre,
         unidad = EXCLUDED.unidad,
         imagen = EXCLUDED.imagen,
         descripcion = EXCLUDED.descripcion`,
      [p.id, p.categoria, p.nombre, p.unidad, p.precio, p.precioSocio, p.imagen, p.descripcion],
    );
  }
}

export function precioVista(row, socio) {
  const lista = Number(row.precio);
  const especial = Number(row.precio_socio);
  return {
    id: row.id,
    categoria: row.categoria,
    nombre: row.nombre,
    unidad: row.unidad,
    imagen: row.imagen,
    descripcion: row.descripcion,
    precioLista: lista,
    precioSocio: especial,
    precio: socio ? especial : lista,
    socio,
  };
}

export async function listarProductos(socio) {
  const rows = await all("SELECT * FROM market_productos ORDER BY categoria, nombre");
  return rows.map((row) => precioVista(row, socio));
}
