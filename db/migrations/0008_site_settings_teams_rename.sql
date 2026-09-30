ALTER TABLE "public"."iot_teams" RENAME TO "teams";
--> statement-breakpoint
ALTER TABLE "public"."teams" RENAME CONSTRAINT "iot_teams_pkey" TO "teams_pkey";
--> statement-breakpoint
ALTER TABLE "public"."teams" RENAME CONSTRAINT "iot_teams_code_unique" TO "teams_code_unique";
--> statement-breakpoint
ALTER TABLE "public"."teams" RENAME CONSTRAINT "iot_teams_session_id_vote_sessions_id_fk" TO "teams_session_id_vote_sessions_id_fk";
--> statement-breakpoint
ALTER SEQUENCE "public"."iot_teams_id_seq" RENAME TO "teams_id_seq";
--> statement-breakpoint
ALTER TABLE "public"."votes" DROP CONSTRAINT "votes_team_id_iot_teams_id_fk";
--> statement-breakpoint
ALTER TABLE "public"."votes" ADD CONSTRAINT "votes_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"show_pameran" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);