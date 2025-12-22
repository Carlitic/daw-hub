-- Asegurar que la tabla contents tiene la FK correcta
ALTER TABLE contents
DROP CONSTRAINT IF EXISTS contents_unit_id_fkey;

ALTER TABLE contents
ADD CONSTRAINT contents_unit_id_fkey
FOREIGN KEY (unit_id)
REFERENCES units(id)
ON DELETE CASCADE;
