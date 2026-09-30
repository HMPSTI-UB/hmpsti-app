CREATE TABLE "merch_product_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"image_url" text NOT NULL,
	"display_order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "merch_product_images" ADD CONSTRAINT "merch_product_images_product_id_merch_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."merch_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merch_products" DROP COLUMN "image";