CREATE TYPE "public"."audit_action" AS ENUM('CREATE', 'UPDATE', 'DELETE', 'VERIFY', 'REJECT');--> statement-breakpoint
CREATE TYPE "public"."audit_entity" AS ENUM('category', 'product', 'order');--> statement-breakpoint
CREATE TABLE "merch_audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_id" text,
	"entity" "audit_entity" NOT NULL,
	"entity_id" integer,
	"action" "audit_action" NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "merch_audit_logs" ADD CONSTRAINT "merch_audit_logs_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;