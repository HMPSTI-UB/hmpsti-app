CREATE TYPE "public"."merch_order_status" AS ENUM('MENUNGGU_VERIFIKASI', 'TERVERIFIKASI', 'DITOLAK');--> statement-breakpoint
CREATE TABLE "merch_order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer,
	"product_name_snapshot" varchar NOT NULL,
	"product_price_snapshot" integer NOT NULL,
	"size_id" integer,
	"size_name_snapshot" varchar,
	"quantity" integer NOT NULL,
	"subtotal" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merch_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_code" varchar NOT NULL,
	"buyer_name" varchar NOT NULL,
	"buyer_contact" varchar NOT NULL,
	"buyer_address" text NOT NULL,
	"buyer_note" text,
	"total_amount" integer NOT NULL,
	"payment_proof_url" text NOT NULL,
	"status" "merch_order_status" DEFAULT 'MENUNGGU_VERIFIKASI' NOT NULL,
	"rejection_reason" text,
	"verified_by" text,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "merch_orders_order_code_unique" UNIQUE("order_code")
);
--> statement-breakpoint
ALTER TABLE "merch_order_items" ADD CONSTRAINT "merch_order_items_order_id_merch_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."merch_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merch_order_items" ADD CONSTRAINT "merch_order_items_product_id_merch_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."merch_products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merch_order_items" ADD CONSTRAINT "merch_order_items_size_id_merch_product_sizes_id_fk" FOREIGN KEY ("size_id") REFERENCES "public"."merch_product_sizes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merch_orders" ADD CONSTRAINT "merch_orders_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;