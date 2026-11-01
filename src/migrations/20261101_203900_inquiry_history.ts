import {sql,type MigrateUpArgs,type MigrateDownArgs} from '@payloadcms/db-postgres'
export async function up({db}:MigrateUpArgs){await db.execute(sql`ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS history jsonb;`)}
export async function down({db}:MigrateDownArgs){await db.execute(sql`ALTER TABLE inquiries DROP COLUMN history;`)}
