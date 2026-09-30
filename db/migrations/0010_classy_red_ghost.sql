CREATE TYPE "public"."merchant_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."payment_account_type" AS ENUM('bank', 'e_wallet', 'qris');--> statement-breakpoint
ALTER TYPE "public"."audit_entity" ADD VALUE 'merchant';--> statement-breakpoint
ALTER TYPE "public"."audit_entity" ADD VALUE 'payment_account';--> statement-breakpoint
ALTER TYPE "public"."role" ADD VALUE 'merchant';--> statement-breakpoint
CREATE TABLE "merchant_info" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"store_name" varchar(255) NOT NULL,
	"description" text,
	"phone" varchar(255),
	"address" text,
	"status" "merchant_status" DEFAULT 'PENDING' NOT NULL,
	"rejection_reason" text,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "merchant_info_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "payment_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "payment_account_type" NOT NULL,
	"bank_name" varchar(255) NOT NULL,
	"account_number" varchar(255),
	"account_owner" varchar(255) NOT NULL,
	"qris_img_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "merch_products" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "merchant_info" ADD CONSTRAINT "merchant_info_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant_info" ADD CONSTRAINT "merchant_info_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_accounts" ADD CONSTRAINT "payment_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merch_products" ADD CONSTRAINT "merch_products_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;