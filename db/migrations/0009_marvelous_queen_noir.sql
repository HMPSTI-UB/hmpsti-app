ALTER TABLE "merch_orders" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "merch_orders" ADD CONSTRAINT "merch_orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;