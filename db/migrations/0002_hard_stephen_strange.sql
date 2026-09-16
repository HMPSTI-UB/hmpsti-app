ALTER TABLE "merch_categories" DROP CONSTRAINT "merch_categories_slug_unique";--> statement-breakpoint
ALTER TABLE "merch_categories" ADD CONSTRAINT "merch_categories_name_unique" UNIQUE("name");