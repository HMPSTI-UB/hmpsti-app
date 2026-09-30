CREATE TABLE "merch_product_variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"name" varchar(50) NOT NULL,
	"price" integer,
	"stock" integer NOT NULL,
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "merch_order_items" ADD COLUMN "variant_id" integer;--> statement-breakpoint
ALTER TABLE "merch_order_items" ADD COLUMN "variant_name_snapshot" varchar;--> statement-breakpoint
ALTER TABLE "merch_products" ADD COLUMN "has_variants" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "merch_product_variants" ADD CONSTRAINT "merch_product_variants_product_id_merch_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."merch_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merch_order_items" ADD CONSTRAINT "merch_order_items_variant_id_merch_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."merch_product_variants"("id") ON DELETE set null ON UPDATE no action;