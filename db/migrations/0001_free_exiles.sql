CREATE TYPE "public"."availability_type" AS ENUM('ready', 'out_of_stock', 'preorder');--> statement-breakpoint
CREATE TABLE "merch_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "merch_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "merch_product_sizes" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"size_name" varchar(50) NOT NULL,
	"stock" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merch_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer,
	"name" varchar(255) NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"image" text NOT NULL,
	"has_sizes" boolean DEFAULT false NOT NULL,
	"stock" integer,
	"availability_type" "availability_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "merch_product_sizes" ADD CONSTRAINT "merch_product_sizes_product_id_merch_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."merch_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merch_products" ADD CONSTRAINT "merch_products_category_id_merch_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."merch_categories"("id") ON DELETE set null ON UPDATE no action;