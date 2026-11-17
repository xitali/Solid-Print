import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs) {
  await db.execute(sql`
    ALTER TABLE materials
      ADD COLUMN glass_fiber boolean,
      ADD COLUMN carbon_fiber boolean,
      ADD COLUMN display_order numeric;

    CREATE TABLE materials_color_samples (
      _order integer NOT NULL,
      _parent_id integer NOT NULL,
      id varchar PRIMARY KEY NOT NULL,
      name varchar NOT NULL,
      hex varchar,
      image_id integer,
      CONSTRAINT materials_color_samples_parent_id_fk
        FOREIGN KEY (_parent_id) REFERENCES materials(id) ON DELETE CASCADE,
      CONSTRAINT materials_color_samples_image_id_media_id_fk
        FOREIGN KEY (image_id) REFERENCES media(id) ON DELETE SET NULL
    );
    CREATE INDEX materials_color_samples_order_idx ON materials_color_samples (_order);
    CREATE INDEX materials_color_samples_parent_id_idx ON materials_color_samples (_parent_id);
    CREATE INDEX materials_color_samples_image_idx ON materials_color_samples (image_id);

    ALTER TABLE services
      ADD COLUMN requirements varchar,
      ADD COLUMN additional_info varchar,
      ADD COLUMN display_order numeric;
  `)
}

export async function down({ db }: MigrateDownArgs) {
  await db.execute(sql`
    DROP TABLE materials_color_samples;

    ALTER TABLE materials
      DROP COLUMN glass_fiber,
      DROP COLUMN carbon_fiber,
      DROP COLUMN display_order;

    ALTER TABLE services
      DROP COLUMN requirements,
      DROP COLUMN additional_info,
      DROP COLUMN display_order;
  `)
}
