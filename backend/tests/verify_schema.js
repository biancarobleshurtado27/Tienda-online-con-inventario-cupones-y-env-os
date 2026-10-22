import Database from 'better-sqlite3';

const db = new Database('./data/tienda.db');
db.pragma('foreign_keys = ON');

let tests = 0;
let passed = 0;

function assertThrows(desc, fn) {
  tests++;
  try {
    fn();
    console.error(`❌ FAIL: ${desc} no lanzó error`);
  } catch (e) {
    passed++;
    console.log(`✅ PASS: ${desc} -> Error capturado correctamente: ${e.message}`);
  }
}

// 1. Email único en clientes
assertThrows('Email único en clientes', () => {
  db.prepare('INSERT INTO clientes (nombre, email, ciudad) VALUES (?, ?, ?)').run(
    'Duplicado', 'carlos.mora@example.com', 'San José'
  );
});

// 2. Código de cupón único
assertThrows('Código de cupón único', () => {
  db.prepare('INSERT INTO cupones (codigo, porcentaje, vigente_hasta, usos_maximos) VALUES (?, ?, ?, ?)').run(
    'BIENVENIDO10', 10, '2026-12-31', 10
  );
});

// 3. CHECK de estado en ordenes
assertThrows('CHECK estado válido en ordenes', () => {
  db.prepare('INSERT INTO ordenes (cliente_id, estado, fecha, subtotal, total) VALUES (?, ?, ?, ?, ?)').run(
    1, 'estado_invalido', '2026-10-22 10:00:00', 50, 50
  );
});

// 4. CHECK precio producto > 0
assertThrows('CHECK precio producto > 0', () => {
  db.prepare('INSERT INTO productos (nombre, precio, stock, categoria) VALUES (?, ?, ?, ?)').run(
    'Invalido', 0, 10, 'Periféricos'
  );
});

// 5. CHECK stock producto >= 0
assertThrows('CHECK stock producto >= 0', () => {
  db.prepare('INSERT INTO productos (nombre, precio, stock, categoria) VALUES (?, ?, ?, ?)').run(
    'Invalido', 10, -1, 'Periféricos'
  );
});

// 6. Foreign Key de cliente en ordenes
assertThrows('Foreign Key cliente_id inexistente', () => {
  db.prepare('INSERT INTO ordenes (cliente_id, estado, fecha, subtotal, total) VALUES (?, ?, ?, ?, ?)').run(
    999, 'nueva', '2026-10-22 10:00:00', 50, 50
  );
});

// 7. CHECK cantidad > 0 en orden_items
assertThrows('CHECK cantidad > 0 en orden_items', () => {
  db.prepare('INSERT INTO orden_items (orden_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)').run(
    1, 1, 0, 65.00
  );
});

console.log(`\n========================================`);
console.log(`🎯 Pruebas de restricciones SQL: ${passed}/${tests} superadas con éxito`);
console.log(`========================================\n`);

if (passed !== tests) {
  process.exit(1);
}
