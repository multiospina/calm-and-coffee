-- ============================================================
-- CEA — Datos de prueba v2
-- Contraseña de todos los usuarios: Test1234!
-- ============================================================

INSERT INTO usuarios (id, nombre, email, password_hash, municipio, telefono, activo, cuestionario_completado) VALUES
  ('00000001-0000-0000-0000-000000000001', 'Carlos Herrera', 'caficultor@cea.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Pasca',      '3111111111', true, false),
  ('00000002-0000-0000-0000-000000000002', 'María García',   'cliente@cea.com',    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Fusagasugá', '3122222222', true, true),
  ('00000003-0000-0000-0000-000000000003', 'Juan Barista',   'barista@cea.com',    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Silvania',   '3133333333', true, false),
  ('00000004-0000-0000-0000-000000000004', 'Laura Gerente',  'gerente@cea.com',    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Silvania',   '3144444444', true, false),
  ('00000005-0000-0000-0000-000000000005', 'Pedro Admin',    'admin@cea.com',      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Bogotá',     '3155555555', true, false),
  ('00000006-0000-0000-0000-000000000006', 'Sofia Catadora', 'catador@cea.com',    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Bogotá',     '3166666666', true, false);

-- rol_id: 1=admin 2=gerente 3=barista 4=caficultor 5=catador 6=cliente
INSERT INTO usuario_roles (usuario_id, rol_id, asignado_por) VALUES
  ('00000001-0000-0000-0000-000000000001', 4, '00000005-0000-0000-0000-000000000005'),
  ('00000002-0000-0000-0000-000000000002', 6, '00000005-0000-0000-0000-000000000005'),
  ('00000003-0000-0000-0000-000000000003', 3, '00000005-0000-0000-0000-000000000005'),
  ('00000004-0000-0000-0000-000000000004', 2, '00000005-0000-0000-0000-000000000005'),
  ('00000005-0000-0000-0000-000000000005', 1, '00000005-0000-0000-0000-000000000005'),
  ('00000006-0000-0000-0000-000000000006', 5, '00000005-0000-0000-0000-000000000005');

INSERT INTO fincas (id, caficultor_id, nombre, municipio, departamento, altitud_msnm, area_hectareas, num_arboles, historia, temporada_cosecha, proceso_principal, temp_promedio, precipitacion_mm, tipo_suelo, activa) VALUES
  ('00000001-0001-0001-0001-000000000001',
   '00000001-0000-0000-0000-000000000001',
   'Finca El Paraíso', 'Pasca', 'Cundinamarca', 1950, 4.20, 8400,
   'Finca familiar fundada en 1978. Cultivamos café de especialidad en las laderas del Páramo del Sumapaz.',
   'Octubre – Enero', 'Lavado', 18.0, 1800, 'Arcilloso-volcánico', true);

INSERT INTO lotes_siembra (id, finca_id, nombre, variedad, proceso_base, fecha_siembra, num_arboles, area_hectareas, parcela_ubicacion, estado, notas_siembra) VALUES
  ('00000001-0002-0002-0002-000000000001',
   '00000001-0001-0001-0001-000000000001',
   'Lote Norte', 'Geisha', 'lavado', '2021-03-15', 1200, 0.60,
   'Parcela Norte de la finca', 'produccion',
   'Siembra de Geisha en suelo volcánico preparado con abono orgánico.'),
  ('00000002-0002-0002-0002-000000000002',
   '00000001-0001-0001-0001-000000000001',
   'Lote Sur', 'Bourbon Amarillo', 'honey', '2019-01-10', 800, 0.40,
   'Parcela Sur de la finca', 'produccion',
   'Bourbon Amarillo de alta calidad. 6 años produciendo.');

INSERT INTO cosechas (id, finca_id, lote_id, variedad, proceso, lote_nombre, fecha_inicio, estado, kg_estimados, kg_producidos, qr_codigo) VALUES
  ('00000001-0003-0003-0003-000000000001',
   '00000001-0001-0001-0001-000000000001',
   '00000001-0002-0002-0002-000000000001',
   'Geisha', 'lavado', 'Cosecha Otoño 2025',
   '2025-10-15', 'cerrada', 850.00, 820.00,
   'CEA-QR-GEISHA-2025-001'),
  ('00000002-0003-0003-0003-000000000002',
   '00000001-0001-0001-0001-000000000001',
   '00000002-0002-0002-0002-000000000002',
   'Bourbon Amarillo', 'honey', 'Cosecha Nov 2025',
   '2025-11-01', 'activa', 400.00, NULL,
   NULL);

INSERT INTO etapas_cosecha (id, cosecha_id, tipo_etapa, fecha, descripcion, fotos_urls, datos_extra) VALUES
  ('00000001-0004-0004-0004-000000000001',
   '00000001-0003-0003-0003-000000000001',
   'recoleccion', '2025-10-15',
   'Cosecha selectiva manual. Fruto rojo al 95% de madurez.',
   ARRAY['https://res.cloudinary.com/cea/image/upload/recoleccion1.jpg'],
   '{"kg": 820, "recolectores": 4, "pct_madurez": 95, "metodo": "selectiva_manual"}'::jsonb),

  ('00000002-0004-0004-0004-000000000002',
   '00000001-0003-0003-0003-000000000001',
   'beneficio', '2025-10-15',
   'Despulpado el mismo día. Fermentación sumergida 36 horas. Agua del nacedero.',
   ARRAY['https://res.cloudinary.com/cea/image/upload/beneficio1.jpg'],
   '{"proceso": "lavado", "horas_ferm": 36, "ph_agua": 6.2, "temp_agua": 18, "num_lavadas": 3, "tipo_agua": "nacedero"}'::jsonb),

  ('00000003-0004-0004-0004-000000000003',
   '00000001-0003-0003-0003-000000000001',
   'secado', '2025-10-16',
   'Secado solar en camas africanas durante 18 días. Humedad final 11.2%.',
   ARRAY['https://res.cloudinary.com/cea/image/upload/secado1.jpg'],
   '{"metodo": "camas_africanas", "dias": 18, "hr_final": 11.2, "temp_prom": 28}'::jsonb),

  ('00000004-0004-0004-0004-000000000004',
   '00000001-0003-0003-0003-000000000001',
   'tostion', '2026-01-10',
   'Tostión perfil medio-alto. Temperatura máxima 195°C. Tiempo 12 minutos.',
   ARRAY['https://res.cloudinary.com/cea/image/upload/tostion1.jpg'],
   '{"tostador": "Café del Sumapaz", "perfil": "medio_alto", "temp_max": 195, "tiempo_min": 12, "temp_carga": 200, "temp_crack": 185, "ror": 8.5, "merma_pct": 15}'::jsonb),

  ('00000005-0004-0004-0004-000000000005',
   '00000001-0003-0003-0003-000000000001',
   'despacho', '2026-01-15',
   'Despacho a El Origen Silvania. 50 kg empacados en bolsa válvula.',
   ARRAY['https://res.cloudinary.com/cea/image/upload/despacho1.jpg'],
   '{"kg_despachados": 50, "empaque": "bolsa_valvula", "lote_empaque": "GS-2025-001"}'::jsonb);

INSERT INTO cafeterias (id, gerente_id, nombre, direccion, municipio, descripcion, activa) VALUES
  ('00000001-0005-0005-0005-000000000001',
   '00000004-0000-0000-0000-000000000004',
   'El Origen', 'Calle 5 # 3-20', 'Silvania',
   'Cafetería especialidad con vista al Páramo del Sumapaz.', true);

INSERT INTO cosecha_cafeteria (cosecha_id, cafeteria_id, asignado_por) VALUES
  ('00000001-0003-0003-0003-000000000001',
   '00000001-0005-0005-0005-000000000001',
   '00000005-0000-0000-0000-000000000005');

INSERT INTO menu_items (id, cafeteria_id, cosecha_id, nombre, tipo, descripcion, precio, stock, activo) VALUES
  ('00000001-0006-0006-0006-000000000001',
   '00000001-0005-0005-0005-000000000001',
   '00000001-0003-0003-0003-000000000001',
   'Geisha Sumapaz V60', 'bebida_cafe',
   'Café de especialidad Geisha. Notas de jazmín y durazno. Proceso lavado.',
   12000.00, 50, true);

INSERT INTO turnos (id, cafeteria_id, nombre, fecha, hora_inicio, hora_fin, estado, creado_por) VALUES
  ('00000001-0007-0007-0007-000000000001',
   '00000001-0005-0005-0005-000000000001',
   'Turno Mañana', '2026-03-22', '07:00', '14:00', 'activo',
   '00000004-0000-0000-0000-000000000004');

INSERT INTO turno_baristas (turno_id, barista_id) VALUES
  ('00000001-0007-0007-0007-000000000001',
   '00000003-0000-0000-0000-000000000003');

INSERT INTO pedidos (id, cliente_id, barista_id, cafeteria_id, turno_id, menu_item_id, mesa, estado, qr_pocillo) VALUES
  ('00000001-0008-0008-0008-000000000001',
   '00000002-0000-0000-0000-000000000002',
   '00000003-0000-0000-0000-000000000003',
   '00000001-0005-0005-0005-000000000001',
   '00000001-0007-0007-0007-000000000001',
   '00000001-0006-0006-0006-000000000001',
   'Mesa 3', 'entregado',
   'CEA-POCILLO-001-20260322');

INSERT INTO pagos (id, pedido_id, monto, metodo, estado, confirmado_por) VALUES
  ('00000001-0009-0009-0009-000000000001',
   '00000001-0008-0008-0008-000000000001',
   12000.00, 'efectivo', 'confirmado',
   '00000003-0000-0000-0000-000000000003');

INSERT INTO cataciones (id, cosecha_id, catador_id, tipo, fragancia_aroma, sabor, post_gusto, acidez, cuerpo, balance, dulzor, uniformidad, taza_limpia, impresion_global, puntaje_total, notas_narrativas, notas_sabor, fecha_catacion) VALUES
  ('00000001-0010-0010-0010-000000000001',
   '00000001-0003-0003-0003-000000000001',
   '00000006-0000-0000-0000-000000000006',
   'profesional',
   8.5, 8.75, 8.5, 8.75, 7.75, 8.5, 10.0, 10.0, 10.0, 8.5, 87.25,
   'Café de excepcional limpieza. Fragancia floral muy pronunciada. Jazmín y bergamota en nariz. Acidez brillante de maracuyá.',
   ARRAY['jasmin','durazno','miel','bergamota'],
   '2026-01-20');

INSERT INTO valoraciones (id, pedido_id, cliente_id, cafe_aroma, cafe_sabor, cafe_cuerpo, cafe_balance, cafe_experiencia, barista_atencion, tienda_ambiente, precio_justo, notas_sabor, comentario) VALUES
  ('00000001-0011-0011-0011-000000000001',
   '00000001-0008-0008-0008-000000000001',
   '00000002-0000-0000-0000-000000000002',
   5, 5, 4, 5, 5, 5, 4, 'justo',
   ARRAY['jasmin','durazno','miel'],
   '¡Increíble café Don Carlos! El jazmín es espectacular.');

INSERT INTO pasaporte_cafetero (id, cliente_id, puntos, nivel, cafes_catados, cafeterias_visitadas, procesos_catados, variedades_catadas) VALUES
  ('00000001-0012-0012-0012-000000000001',
   '00000002-0000-0000-0000-000000000002',
   43, 0, 1, 1,
   ARRAY['lavado'],
   ARRAY['Geisha']);

INSERT INTO preferencias_usuario (id, cliente_id, sabores_favoritos, intensidad, momentos_favoritos, es_inicial) VALUES
  ('00000001-0013-0013-0013-000000000001',
   '00000002-0000-0000-0000-000000000002',
   ARRAY['floral','frutal','miel'],
   'medio_pronunciado',
   ARRAY['manana','tarde'],
   true);

INSERT INTO historial_catas (id, cliente_id, cosecha_id, cafeteria_id, tipo_qr, puntos_ganados) VALUES
  ('00000001-0014-0014-0014-000000000001',
   '00000002-0000-0000-0000-000000000002',
   '00000001-0003-0003-0003-000000000001',
   '00000001-0005-0005-0005-000000000001',
   'pocillo', 15);

-- ============================================================
-- Verificación rápida — ejecuta esto para confirmar:
-- SELECT COUNT(*) FROM usuarios;        → 6
-- SELECT COUNT(*) FROM etapas_cosecha;  → 5
-- SELECT COUNT(*) FROM cataciones;      → 1
-- SELECT COUNT(*) FROM valoraciones;    → 1
-- ============================================================
