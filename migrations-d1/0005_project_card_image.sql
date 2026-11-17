ALTER TABLE projects ADD COLUMN card_image_id integer REFERENCES media(id) ON DELETE SET NULL;
CREATE INDEX projects_card_image_idx ON projects (card_image_id);
