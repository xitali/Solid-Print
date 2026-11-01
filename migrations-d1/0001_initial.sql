CREATE TABLE `users_sessions` (
  	`_order` integer NOT NULL,
  	`_parent_id` integer NOT NULL,
  	`id` text PRIMARY KEY NOT NULL,
  	`created_at` text,
  	`expires_at` text NOT NULL,
  	FOREIGN KEY (`_parent_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
  );
  ;
CREATE INDEX `users_sessions_order_idx` ON `users_sessions` (`_order`);;
CREATE INDEX `users_sessions_parent_id_idx` ON `users_sessions` (`_parent_id`);;
CREATE TABLE `users` (
  	`id` integer PRIMARY KEY NOT NULL,
  	`name` text,
  	`role` text DEFAULT 'owner' NOT NULL,
  	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	`email` text NOT NULL,
  	`reset_password_token` text,
  	`reset_password_expiration` text,
  	`salt` text,
  	`hash` text,
  	`reset_password_requested_at` text,
  	`login_attempts` numeric DEFAULT 0,
  	`lock_until` text
  );
  ;
CREATE INDEX `users_updated_at_idx` ON `users` (`updated_at`);;
CREATE INDEX `users_created_at_idx` ON `users` (`created_at`);;
CREATE UNIQUE INDEX `users_email_idx` ON `users` (`email`);;
CREATE TABLE `media` (
  	`id` integer PRIMARY KEY NOT NULL,
  	`alt` text NOT NULL,
  	`prefix` text DEFAULT 'public-media',
  	`_objectkey` text,
  	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	`url` text,
  	`thumbnail_u_r_l` text,
  	`filename` text,
  	`mime_type` text,
  	`filesize` numeric,
  	`width` numeric,
  	`height` numeric,
  	`focal_x` numeric,
  	`focal_y` numeric
  );
  ;
CREATE INDEX `media_updated_at_idx` ON `media` (`updated_at`);;
CREATE INDEX `media_created_at_idx` ON `media` (`created_at`);;
CREATE UNIQUE INDEX `media_filename_idx` ON `media` (`filename`);;
CREATE TABLE `products_applications` (
  	`_order` integer NOT NULL,
  	`_parent_id` integer NOT NULL,
  	`id` text PRIMARY KEY NOT NULL,
  	`value` text NOT NULL,
  	FOREIGN KEY (`_parent_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
  );
  ;
CREATE INDEX `products_applications_order_idx` ON `products_applications` (`_order`);;
CREATE INDEX `products_applications_parent_id_idx` ON `products_applications` (`_parent_id`);;
CREATE TABLE `products_variants` (
  	`_order` integer NOT NULL,
  	`_parent_id` integer NOT NULL,
  	`id` text PRIMARY KEY NOT NULL,
  	`name` text NOT NULL,
  	`color` text,
  	FOREIGN KEY (`_parent_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
  );
  ;
CREATE INDEX `products_variants_order_idx` ON `products_variants` (`_order`);;
CREATE INDEX `products_variants_parent_id_idx` ON `products_variants` (`_parent_id`);;
CREATE TABLE `products_images` (
  	`_order` integer NOT NULL,
  	`_parent_id` integer NOT NULL,
  	`id` text PRIMARY KEY NOT NULL,
  	`image_id` integer NOT NULL,
  	`caption` text,
  	FOREIGN KEY (`image_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (`_parent_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
  );
  ;
CREATE INDEX `products_images_order_idx` ON `products_images` (`_order`);;
CREATE INDEX `products_images_parent_id_idx` ON `products_images` (`_parent_id`);;
CREATE INDEX `products_images_image_idx` ON `products_images` (`image_id`);;
CREATE TABLE `products` (
  	`id` integer PRIMARY KEY NOT NULL,
  	`title` text NOT NULL,
  	`slug` text NOT NULL,
  	`description` text NOT NULL,
  	`category` text,
  	`material` text,
  	`dimensions` text,
  	`layer_height` text,
  	`price_from` numeric,
  	`lead_time` text,
  	`personalization` text,
  	`available` integer DEFAULT true,
  	`featured` integer,
  	`published` integer DEFAULT false,
  	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  ;
CREATE UNIQUE INDEX `products_slug_idx` ON `products` (`slug`);;
CREATE INDEX `products_updated_at_idx` ON `products` (`updated_at`);;
CREATE INDEX `products_created_at_idx` ON `products` (`created_at`);;
CREATE TABLE `materials_applications` (
  	`_order` integer NOT NULL,
  	`_parent_id` integer NOT NULL,
  	`id` text PRIMARY KEY NOT NULL,
  	`value` text NOT NULL,
  	FOREIGN KEY (`_parent_id`) REFERENCES `materials`(`id`) ON UPDATE no action ON DELETE cascade
  );
  ;
CREATE INDEX `materials_applications_order_idx` ON `materials_applications` (`_order`);;
CREATE INDEX `materials_applications_parent_id_idx` ON `materials_applications` (`_parent_id`);;
CREATE TABLE `materials` (
  	`id` integer PRIMARY KEY NOT NULL,
  	`title` text NOT NULL,
  	`slug` text NOT NULL,
  	`description` text NOT NULL,
  	`limitations` text,
  	`colors` text,
  	`group` text,
  	`available` integer DEFAULT true,
  	`published` integer DEFAULT false,
  	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  ;
CREATE UNIQUE INDEX `materials_slug_idx` ON `materials` (`slug`);;
CREATE INDEX `materials_updated_at_idx` ON `materials` (`updated_at`);;
CREATE INDEX `materials_created_at_idx` ON `materials` (`created_at`);;
CREATE TABLE `services` (
  	`id` integer PRIMARY KEY NOT NULL,
  	`title` text NOT NULL,
  	`slug` text NOT NULL,
  	`description` text NOT NULL,
  	`body` text,
  	`applications` text,
  	`kind` text DEFAULT 'print' NOT NULL,
  	`published` integer DEFAULT false,
  	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  ;
CREATE UNIQUE INDEX `services_slug_idx` ON `services` (`slug`);;
CREATE INDEX `services_updated_at_idx` ON `services` (`updated_at`);;
CREATE INDEX `services_created_at_idx` ON `services` (`created_at`);;
CREATE TABLE `services_rels` (
  	`id` integer PRIMARY KEY NOT NULL,
  	`order` integer,
  	`parent_id` integer NOT NULL,
  	`path` text NOT NULL,
  	`projects_id` integer,
  	FOREIGN KEY (`parent_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (`projects_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
  );
  ;
CREATE INDEX `services_rels_order_idx` ON `services_rels` (`order`);;
CREATE INDEX `services_rels_parent_idx` ON `services_rels` (`parent_id`);;
CREATE INDEX `services_rels_path_idx` ON `services_rels` (`path`);;
CREATE INDEX `services_rels_projects_id_idx` ON `services_rels` (`projects_id`);;
CREATE TABLE `projects` (
  	`id` integer PRIMARY KEY NOT NULL,
  	`title` text NOT NULL,
  	`slug` text NOT NULL,
  	`problem` text NOT NULL,
  	`solution` text NOT NULL,
  	`result` text NOT NULL,
  	`image_id` integer,
  	`material` text,
  	`dimensions` text,
  	`published` integer DEFAULT false,
  	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (`image_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null
  );
  ;
CREATE UNIQUE INDEX `projects_slug_idx` ON `projects` (`slug`);;
CREATE INDEX `projects_image_idx` ON `projects` (`image_id`);;
CREATE INDEX `projects_updated_at_idx` ON `projects` (`updated_at`);;
CREATE INDEX `projects_created_at_idx` ON `projects` (`created_at`);;
CREATE TABLE `articles` (
  	`id` integer PRIMARY KEY NOT NULL,
  	`title` text NOT NULL,
  	`slug` text NOT NULL,
  	`description` text NOT NULL,
  	`body` text NOT NULL,
  	`image_id` integer,
  	`published` integer DEFAULT false,
  	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (`image_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null
  );
  ;
CREATE UNIQUE INDEX `articles_slug_idx` ON `articles` (`slug`);;
CREATE INDEX `articles_image_idx` ON `articles` (`image_id`);;
CREATE INDEX `articles_updated_at_idx` ON `articles` (`updated_at`);;
CREATE INDEX `articles_created_at_idx` ON `articles` (`created_at`);;
CREATE TABLE `faqs` (
  	`id` integer PRIMARY KEY NOT NULL,
  	`question` text NOT NULL,
  	`answer` text NOT NULL,
  	`order` numeric DEFAULT 0,
  	`published` integer DEFAULT false,
  	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  ;
CREATE INDEX `faqs_updated_at_idx` ON `faqs` (`updated_at`);;
CREATE INDEX `faqs_created_at_idx` ON `faqs` (`created_at`);;
CREATE TABLE `inquiries` (
  	`id` integer PRIMARY KEY NOT NULL,
  	`number` text,
  	`idempotency_key` text,
  	`session_id` text,
  	`type` text,
  	`status` text DEFAULT 'new',
  	`name` text,
  	`email` text,
  	`phone` text,
  	`company` text,
  	`nip` text,
  	`material` text,
  	`color` text,
  	`unit` text,
  	`deadline` text,
  	`delivery` text,
  	`quantity` numeric,
  	`description` text,
  	`product_snapshot` text,
  	`notes` text,
  	`closed_at` text,
  	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  ;
CREATE UNIQUE INDEX `inquiries_number_idx` ON `inquiries` (`number`);;
CREATE UNIQUE INDEX `inquiries_idempotency_key_idx` ON `inquiries` (`idempotency_key`);;
CREATE UNIQUE INDEX `inquiries_session_id_idx` ON `inquiries` (`session_id`);;
CREATE INDEX `inquiries_updated_at_idx` ON `inquiries` (`updated_at`);;
CREATE INDEX `inquiries_created_at_idx` ON `inquiries` (`created_at`);;
CREATE TABLE `inquiries_rels` (
  	`id` integer PRIMARY KEY NOT NULL,
  	`order` integer,
  	`parent_id` integer NOT NULL,
  	`path` text NOT NULL,
  	`quote_files_id` integer,
  	FOREIGN KEY (`parent_id`) REFERENCES `inquiries`(`id`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (`quote_files_id`) REFERENCES `quote_files`(`id`) ON UPDATE no action ON DELETE cascade
  );
  ;
CREATE INDEX `inquiries_rels_order_idx` ON `inquiries_rels` (`order`);;
CREATE INDEX `inquiries_rels_parent_idx` ON `inquiries_rels` (`parent_id`);;
CREATE INDEX `inquiries_rels_path_idx` ON `inquiries_rels` (`path`);;
CREATE INDEX `inquiries_rels_quote_files_id_idx` ON `inquiries_rels` (`quote_files_id`);;
CREATE TABLE `quote_files` (
  	`id` integer PRIMARY KEY NOT NULL,
  	`name` text NOT NULL,
  	`size` numeric NOT NULL,
  	`kind` text NOT NULL,
  	`session_id` text,
  	`object_key` text,
  	`content_hash` text,
  	`status` text DEFAULT 'pending',
  	`scan_message` text,
  	`inquiry_id` text,
  	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  ;
CREATE INDEX `quote_files_session_id_idx` ON `quote_files` (`session_id`);;
CREATE INDEX `quote_files_inquiry_id_idx` ON `quote_files` (`inquiry_id`);;
CREATE INDEX `quote_files_updated_at_idx` ON `quote_files` (`updated_at`);;
CREATE INDEX `quote_files_created_at_idx` ON `quote_files` (`created_at`);;
CREATE TABLE `upload_sessions` (
  	`id` integer PRIMARY KEY NOT NULL,
  	`token_hash` text,
  	`expires_at` text,
  	`ip_hash` text,
  	`inquiry_id` text,
  	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  ;
CREATE INDEX `upload_sessions_token_hash_idx` ON `upload_sessions` (`token_hash`);;
CREATE INDEX `upload_sessions_ip_hash_idx` ON `upload_sessions` (`ip_hash`);;
CREATE INDEX `upload_sessions_updated_at_idx` ON `upload_sessions` (`updated_at`);;
CREATE INDEX `upload_sessions_created_at_idx` ON `upload_sessions` (`created_at`);;
CREATE TABLE `outbox` (
  	`id` integer PRIMARY KEY NOT NULL,
  	`to` text NOT NULL,
  	`subject` text NOT NULL,
  	`text` text NOT NULL,
  	`state` text DEFAULT 'pending',
  	`attempts` numeric DEFAULT 0,
  	`next_attempt_at` text,
  	`last_error` text,
  	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  ;
CREATE INDEX `outbox_updated_at_idx` ON `outbox` (`updated_at`);;
CREATE INDEX `outbox_created_at_idx` ON `outbox` (`created_at`);;
CREATE TABLE `rate_limits` (
  	`id` integer PRIMARY KEY NOT NULL,
  	`key` text,
  	`expires_at` text,
  	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  ;
CREATE INDEX `rate_limits_key_idx` ON `rate_limits` (`key`);;
CREATE INDEX `rate_limits_updated_at_idx` ON `rate_limits` (`updated_at`);;
CREATE INDEX `rate_limits_created_at_idx` ON `rate_limits` (`created_at`);;
CREATE TABLE `payload_kv` (
  	`id` integer PRIMARY KEY NOT NULL,
  	`key` text NOT NULL,
  	`data` text NOT NULL
  );
  ;
CREATE UNIQUE INDEX `payload_kv_key_idx` ON `payload_kv` (`key`);;
CREATE TABLE `payload_locked_documents` (
  	`id` integer PRIMARY KEY NOT NULL,
  	`global_slug` text,
  	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  ;
CREATE INDEX `payload_locked_documents_global_slug_idx` ON `payload_locked_documents` (`global_slug`);;
CREATE INDEX `payload_locked_documents_updated_at_idx` ON `payload_locked_documents` (`updated_at`);;
CREATE INDEX `payload_locked_documents_created_at_idx` ON `payload_locked_documents` (`created_at`);;
CREATE TABLE `payload_locked_documents_rels` (
  	`id` integer PRIMARY KEY NOT NULL,
  	`order` integer,
  	`parent_id` integer NOT NULL,
  	`path` text NOT NULL,
  	`users_id` integer,
  	`media_id` integer,
  	`products_id` integer,
  	`materials_id` integer,
  	`services_id` integer,
  	`projects_id` integer,
  	`articles_id` integer,
  	`faqs_id` integer,
  	`inquiries_id` integer,
  	`quote_files_id` integer,
  	`upload_sessions_id` integer,
  	`outbox_id` integer,
  	`rate_limits_id` integer,
  	FOREIGN KEY (`parent_id`) REFERENCES `payload_locked_documents`(`id`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (`users_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (`products_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (`materials_id`) REFERENCES `materials`(`id`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (`services_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (`projects_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (`articles_id`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (`faqs_id`) REFERENCES `faqs`(`id`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (`inquiries_id`) REFERENCES `inquiries`(`id`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (`quote_files_id`) REFERENCES `quote_files`(`id`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (`upload_sessions_id`) REFERENCES `upload_sessions`(`id`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (`outbox_id`) REFERENCES `outbox`(`id`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (`rate_limits_id`) REFERENCES `rate_limits`(`id`) ON UPDATE no action ON DELETE cascade
  );
  ;
CREATE INDEX `payload_locked_documents_rels_order_idx` ON `payload_locked_documents_rels` (`order`);;
CREATE INDEX `payload_locked_documents_rels_parent_idx` ON `payload_locked_documents_rels` (`parent_id`);;
CREATE INDEX `payload_locked_documents_rels_path_idx` ON `payload_locked_documents_rels` (`path`);;
CREATE INDEX `payload_locked_documents_rels_users_id_idx` ON `payload_locked_documents_rels` (`users_id`);;
CREATE INDEX `payload_locked_documents_rels_media_id_idx` ON `payload_locked_documents_rels` (`media_id`);;
CREATE INDEX `payload_locked_documents_rels_products_id_idx` ON `payload_locked_documents_rels` (`products_id`);;
CREATE INDEX `payload_locked_documents_rels_materials_id_idx` ON `payload_locked_documents_rels` (`materials_id`);;
CREATE INDEX `payload_locked_documents_rels_services_id_idx` ON `payload_locked_documents_rels` (`services_id`);;
CREATE INDEX `payload_locked_documents_rels_projects_id_idx` ON `payload_locked_documents_rels` (`projects_id`);;
CREATE INDEX `payload_locked_documents_rels_articles_id_idx` ON `payload_locked_documents_rels` (`articles_id`);;
CREATE INDEX `payload_locked_documents_rels_faqs_id_idx` ON `payload_locked_documents_rels` (`faqs_id`);;
CREATE INDEX `payload_locked_documents_rels_inquiries_id_idx` ON `payload_locked_documents_rels` (`inquiries_id`);;
CREATE INDEX `payload_locked_documents_rels_quote_files_id_idx` ON `payload_locked_documents_rels` (`quote_files_id`);;
CREATE INDEX `payload_locked_documents_rels_upload_sessions_id_idx` ON `payload_locked_documents_rels` (`upload_sessions_id`);;
CREATE INDEX `payload_locked_documents_rels_outbox_id_idx` ON `payload_locked_documents_rels` (`outbox_id`);;
CREATE INDEX `payload_locked_documents_rels_rate_limits_id_idx` ON `payload_locked_documents_rels` (`rate_limits_id`);;
CREATE TABLE `payload_preferences` (
  	`id` integer PRIMARY KEY NOT NULL,
  	`key` text,
  	`value` text,
  	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  ;
CREATE INDEX `payload_preferences_key_idx` ON `payload_preferences` (`key`);;
CREATE INDEX `payload_preferences_updated_at_idx` ON `payload_preferences` (`updated_at`);;
CREATE INDEX `payload_preferences_created_at_idx` ON `payload_preferences` (`created_at`);;
CREATE TABLE `payload_preferences_rels` (
  	`id` integer PRIMARY KEY NOT NULL,
  	`order` integer,
  	`parent_id` integer NOT NULL,
  	`path` text NOT NULL,
  	`users_id` integer,
  	FOREIGN KEY (`parent_id`) REFERENCES `payload_preferences`(`id`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (`users_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
  );
  ;
CREATE INDEX `payload_preferences_rels_order_idx` ON `payload_preferences_rels` (`order`);;
CREATE INDEX `payload_preferences_rels_parent_idx` ON `payload_preferences_rels` (`parent_id`);;
CREATE INDEX `payload_preferences_rels_path_idx` ON `payload_preferences_rels` (`path`);;
CREATE INDEX `payload_preferences_rels_users_id_idx` ON `payload_preferences_rels` (`users_id`);;
CREATE TABLE `payload_migrations` (
  	`id` integer PRIMARY KEY NOT NULL,
  	`name` text,
  	`batch` numeric,
  	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  ;
CREATE INDEX `payload_migrations_updated_at_idx` ON `payload_migrations` (`updated_at`);;
CREATE INDEX `payload_migrations_created_at_idx` ON `payload_migrations` (`created_at`);;
CREATE TABLE `website_workshop_images` (
  	`_order` integer NOT NULL,
  	`_parent_id` integer NOT NULL,
  	`id` text PRIMARY KEY NOT NULL,
  	`image_id` integer NOT NULL,
  	FOREIGN KEY (`image_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (`_parent_id`) REFERENCES `website`(`id`) ON UPDATE no action ON DELETE cascade
  );
  ;
CREATE INDEX `website_workshop_images_order_idx` ON `website_workshop_images` (`_order`);;
CREATE INDEX `website_workshop_images_parent_id_idx` ON `website_workshop_images` (`_parent_id`);;
CREATE INDEX `website_workshop_images_image_idx` ON `website_workshop_images` (`image_id`);;
CREATE TABLE `website` (
  	`id` integer PRIMARY KEY NOT NULL,
  	`hero_title` text DEFAULT 'Od pomysłu do gotowego wydruku 3D',
  	`hero_description` text DEFAULT 'Projektowanie i druk 3D dla Twojego pomysłu. Od pojedynczej części po gotowy produkt — porozmawiajmy o tym, czego potrzebujesz.',
  	`hero_image_id` integer,
  	`hero_material` text,
  	`hero_layer` text,
  	`about_title` text DEFAULT 'Za każdym wydrukiem stoi człowiek.',
  	`about_text` text,
  	`owner_image_id` integer,
  	`phone` text,
  	`email` text,
  	`hours` text,
  	`area` text,
  	`address` text,
  	`seller_name` text,
  	`nip` text,
  	`pickup_enabled` integer,
  	`instagram` text,
  	`facebook` text,
  	`privacy_text` text,
  	`terms_text` text,
  	`cookies_text` text,
  	`launch_ready` integer DEFAULT false,
  	`updated_at` text,
  	`created_at` text,
  	FOREIGN KEY (`hero_image_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (`owner_image_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null
  );
  ;
CREATE INDEX `website_hero_image_idx` ON `website` (`hero_image_id`);;
CREATE INDEX `website_owner_image_idx` ON `website` (`owner_image_id`);;
