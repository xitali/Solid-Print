import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs) {
  await db.execute(sql`
    ALTER TABLE projects ADD COLUMN card_image_id integer;
    ALTER TABLE projects ADD CONSTRAINT projects_card_image_id_media_id_fk
      FOREIGN KEY (card_image_id) REFERENCES media(id) ON DELETE SET NULL;
    CREATE INDEX projects_card_image_idx ON projects (card_image_id);
  `)
}

export async function down({ db }: MigrateDownArgs) {
  await db.execute(sql`ALTER TABLE projects DROP COLUMN card_image_id;`)
}
