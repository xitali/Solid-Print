ALTER TABLE materials ADD COLUMN glass_fiber integer;
ALTER TABLE materials ADD COLUMN carbon_fiber integer;
ALTER TABLE materials ADD COLUMN display_order numeric;

CREATE TABLE materials_color_samples (
  _order integer NOT NULL,
  _parent_id integer NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  id text PRIMARY KEY NOT NULL,
  name text NOT NULL,
  hex text,
  image_id integer REFERENCES media(id) ON DELETE SET NULL
);
CREATE INDEX materials_color_samples_order_idx ON materials_color_samples (_order);
CREATE INDEX materials_color_samples_parent_id_idx ON materials_color_samples (_parent_id);
CREATE INDEX materials_color_samples_image_idx ON materials_color_samples (image_id);

ALTER TABLE services ADD COLUMN requirements text;
ALTER TABLE services ADD COLUMN additional_info text;
ALTER TABLE services ADD COLUMN display_order numeric;
