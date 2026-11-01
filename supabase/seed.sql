-- Categories
insert into public.categories (id, name, slug, parent_id, sort_order) values
  ('c1000000-0000-0000-0000-000000000001', 'Plumbing', 'plumbing', null, 1),
  ('c1000000-0000-0000-0000-000000000002', 'Electrical', 'electrical', null, 2),
  ('c2000000-0000-0000-0000-000000000001', 'Pipes & Fittings', 'pipes-fittings', 'c1000000-0000-0000-0000-000000000001', 1),
  ('c2000000-0000-0000-0000-000000000002', 'Taps & Valves', 'taps-valves', 'c1000000-0000-0000-0000-000000000001', 2),
  ('c2000000-0000-0000-0000-000000000003', 'Solvents & Glues', 'solvents-glues', 'c1000000-0000-0000-0000-000000000001', 3),
  ('c2000000-0000-0000-0000-000000000004', 'Water Tanks', 'water-tanks', 'c1000000-0000-0000-0000-000000000001', 4),
  ('c2000000-0000-0000-0000-000000000005', 'Lighting', 'lighting', 'c1000000-0000-0000-0000-000000000002', 1),
  ('c2000000-0000-0000-0000-000000000006', 'Fans', 'fans', 'c1000000-0000-0000-0000-000000000002', 2),
  ('c2000000-0000-0000-0000-000000000007', 'Switches & Sockets', 'switches-sockets', 'c1000000-0000-0000-0000-000000000002', 3),
  ('c2000000-0000-0000-0000-000000000008', 'Wires & Cables', 'wires-cables', 'c1000000-0000-0000-0000-000000000002', 4)
on conflict do nothing;

-- 20 Products (10 Plumbing, 10 Electrical)
insert into public.products (id, name, slug, category_id, brand, price, unit, stock_qty, low_stock_threshold, description, specs, featured, active) values
  -- Plumbing: Pipes & Fittings
  ('a0000000-0000-0000-0000-000000000001', 'Ashirvad CPVC Pipe 1 inch (3m)', 'ashirvad-cpvc-pipe-1-inch-3m', 'c2000000-0000-0000-0000-000000000001', 'Ashirvad', 450, 'piece', 50, 10, 'High-grade Chlorinated Polyvinyl Chloride pipe for hot and cold water distribution.', '{"size": "1 inch", "length": "3 metres", "material": "CPVC", "pressure_rating": "SDR 11"}', true, true),
  ('a0000000-0000-0000-0000-000000000002', 'Astral PVC Conduit Pipe 25mm (3m)', 'astral-pvc-conduit-pipe-25mm-3m', 'c2000000-0000-0000-0000-000000000001', 'Astral', 120, 'piece', 120, 20, 'Rigid PVC conduit pipe for surface and concealed electrical wiring.', '{"outer_diameter": "25mm", "length": "3 metres", "material": "Rigid PVC"}', false, true),
  ('a0000000-0000-0000-0000-000000000003', 'Supreme CPVC Elbow 90 Degree (1 inch)', 'supreme-cpvc-elbow-90-1-inch', 'c2000000-0000-0000-0000-000000000001', 'Supreme', 35, 'piece', 200, 30, 'Precision-moulded 90-degree elbow for directional pipe turns.', '{"size": "1 inch", "angle": "90 degrees", "material": "CPVC"}', false, true),
  ('a0000000-0000-0000-0000-000000000004', 'Prince CPVC Tee (1 inch)', 'prince-cpvc-tee-1-inch', 'c2000000-0000-0000-0000-000000000001', 'Prince', 48, 'piece', 150, 25, 'Equal tee fitting for three-way branch connections.', '{"size": "1 inch", "material": "CPVC"}', false, true),
  
  -- Plumbing: Taps & Valves
  ('a0000000-0000-0000-0000-000000000005', 'Jaquar Brass Bib Tap with Wall Flange', 'jaquar-brass-bib-tap-wall-flange', 'c2000000-0000-0000-0000-000000000002', 'Jaquar', 850, 'piece', 18, 5, 'Chrome-plated solid brass bib tap with smooth ceramic disc cartridge.', '{"material": "Brass", "finish": "Chrome", "inlet_size": "1/2 inch BSP"}', true, true),
  ('a0000000-0000-0000-0000-000000000006', 'Zoloto Brass Ball Valve (1 inch)', 'zoloto-brass-ball-valve-1-inch', 'c2000000-0000-0000-0000-000000000002', 'Zoloto', 620, 'piece', 25, 5, 'Heavy-duty forged brass full-bore ball valve for reliable flow control.', '{"size": "1 inch", "material": "Forged Brass", "handle": "Lever"}', false, true),
  ('a0000000-0000-0000-0000-000000000007', 'Cera Health Faucet with Hose & Hook', 'cera-health-faucet-with-hose', 'c2000000-0000-0000-0000-000000000002', 'Cera', 490, 'set', 35, 8, 'ABS body health faucet spray with 1.2m flexible stainless steel hose.', '{"hose_length": "1.2 metres", "material": "ABS + Stainless Steel"}', true, true),
  
  -- Plumbing: Solvents & Water Tanks
  ('a0000000-0000-0000-0000-000000000008', 'Weld-On 714 CPVC Solvent Cement (118ml)', 'weld-on-714-cpvc-solvent-cement-118ml', 'c2000000-0000-0000-0000-000000000003', 'Weld-On', 165, 'piece', 45, 10, 'Heavy-bodied, medium-setting solvent cement for all classes of CPVC pipe.', '{"volume": "118 ml", "type": "Heavy Bodied", "colour": "Orange"}', false, true),
  ('a0000000-0000-0000-0000-000000000009', 'Sintex Triple Layer Overhead Water Tank (1000L)', 'sintex-triple-layer-water-tank-1000l', 'c2000000-0000-0000-0000-000000000004', 'Sintex', null, 'piece', 3, 2, 'FDA approved 100% virgin food-grade plastic triple-layer overhead tank.', '{"capacity": "1000 Litres", "layers": "3 Layers (UV Stabilized)", "colour": "White"}', true, true),
  ('a0000000-0000-0000-0000-000000000010', 'Plumber PTFE Thread Seal Tape (12mm x 10m)', 'plumber-ptfe-thread-seal-tape', 'c2000000-0000-0000-0000-000000000003', 'Generic', 20, 'piece', 300, 50, 'Standard density Teflon thread tape for watertight threaded pipe joints.', '{"width": "12mm", "length": "10 metres", "material": "PTFE"}', false, true),

  -- Electrical: Lighting
  ('a0000000-0000-0000-0000-000000000011', 'Philips 9W B22 LED Bulb (Cool Day Light)', 'philips-9w-b22-led-bulb', 'c2000000-0000-0000-0000-000000000005', 'Philips', 110, 'piece', 80, 15, 'Energy-saving LED bulb with 6500K bright white light and 25,000 hour lifespan.', '{"wattage": "9W", "cap_type": "B22", "colour_temp": "6500K Cool White", "lumens": "825 lm"}', true, true),
  ('a0000000-0000-0000-0000-000000000012', 'Wipro 20W LED Batten Tube Light (4 Feet)', 'wipro-20w-led-batten-tube-light', 'c2000000-0000-0000-0000-000000000005', 'Wipro', 280, 'piece', 40, 8, 'Sleek polycarbonate LED batten with glare-free wide angle light distribution.', '{"wattage": "20W", "length": "4 Feet (1200mm)", "colour_temp": "6500K"}', true, true),
  ('a0000000-0000-0000-0000-000000000013', 'Havells 12W LED Concealed Panel Downlight', 'havells-12w-led-panel-downlight', 'c2000000-0000-0000-0000-000000000005', 'Havells', 360, 'piece', 30, 6, 'Ultra-slim round recessed ceiling panel light with integrated driver.', '{"wattage": "12W", "cutout_size": "150mm", "shape": "Round", "colour": "Warm White"}', false, true),

  -- Electrical: Fans
  ('a0000000-0000-0000-0000-000000000014', 'Crompton Hill Briz 1200mm Ceiling Fan (Brown)', 'crompton-hill-briz-1200mm-fan', 'c2000000-0000-0000-0000-000000000006', 'Crompton', 1850, 'piece', 12, 3, 'High-speed ceiling fan with 100% copper winding and double ball bearings.', '{"sweep": "1200mm (48 inch)", "speed": "380 RPM", "air_delivery": "210 CMM", "power": "72W"}', true, true),
  ('a0000000-0000-0000-0000-000000000015', 'Havells Ventil Air Exhaust Fan 200mm', 'havells-ventil-air-exhaust-fan-200mm', 'c2000000-0000-0000-0000-000000000006', 'Havells', 1250, 'piece', 8, 2, 'Lightweight engineering plastic exhaust fan with automatic back-shutters.', '{"sweep": "200mm (8 inch)", "speed": "1350 RPM", "material": "Plastic"}', false, true),

  -- Electrical: Switches & Sockets
  ('a0000000-0000-0000-0000-000000000016', 'Anchor Roma 10A 1-Way Modular Switch (White)', 'anchor-roma-10a-1-way-switch', 'c2000000-0000-0000-0000-000000000007', 'Anchor', 42, 'piece', 200, 30, 'Silver cadmium contacts for spark-free switching with smooth toggle action.', '{"current_rating": "10 Amp", "type": "1-Way Modular", "colour": "White"}', false, true),
  ('a0000000-0000-0000-0000-000000000017', 'Schneider Electric 6/16A Combined Socket with Switch', 'schneider-6-16a-combined-socket-switch', 'c2000000-0000-0000-0000-000000000007', 'Schneider', 230, 'piece', 60, 10, 'Heavy-duty combined power socket with safety shutters for appliances.', '{"rating": "6A / 16A Universal", "safety": "Child Protection Shutters"}', false, true),
  ('a0000000-0000-0000-0000-000000000018', 'Legrand 8-Module Cover Plate (White)', 'legrand-8-module-cover-plate', 'c2000000-0000-0000-0000-000000000007', 'Legrand', 180, 'piece', 45, 8, 'UV-resistant glossy cover plate with concealed screw design.', '{"modules": "8 Module", "finish": "Glossy White"}', false, true),

  -- Electrical: Wires & Cables
  ('a0000000-0000-0000-0000-000000000019', 'Polycab 1.5 sq mm Single Core FR Wire (90m, Red)', 'polycab-1-5-sq-mm-fr-wire-red', 'c2000000-0000-0000-0000-000000000008', 'Polycab', 1750, 'roll', 15, 4, 'Flame Retardant (FR) PVC insulated building wire with 100% electrolytic copper conductor.', '{"cross_section": "1.5 sq mm", "length": "90 metres", "colour": "Red", "conductor": "Copper"}', true, true),
  ('a0000000-0000-0000-0000-000000000020', 'Finolex 2.5 sq mm Single Core FRLS Wire (90m, Yellow)', 'finolex-2-5-sq-mm-frls-wire-yellow', 'c2000000-0000-0000-0000-000000000008', 'Finolex', 2850, 'roll', 2, 3, 'Flame Retardant Low Smoke (FRLS) wire for power circuits and heavy loads. LOW STOCK ALERT.', '{"cross_section": "2.5 sq mm", "length": "90 metres", "colour": "Yellow", "rating": "1100V"}', false, true)
on conflict do nothing;
