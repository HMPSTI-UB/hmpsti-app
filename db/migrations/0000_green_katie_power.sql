CREATE TYPE "public"."role" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TABLE "iot_teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(20) NOT NULL,
	"class_name" varchar(10) NOT NULL,
	"group_number" integer NOT NULL,
	"title" text NOT NULL,
	"team_members" text NOT NULL,
	"banner_image_url" text,
	"project_image_url" text,
	"session_id" integer NOT NULL,
	CONSTRAINT "iot_teams_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vote_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"session_id" integer NOT NULL,
	"voter_name" varchar(255),
	"message" text,
	"voted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "iot_teams" ADD CONSTRAINT "iot_teams_session_id_vote_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."vote_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_team_id_iot_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."iot_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_session_id_vote_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."vote_sessions"("id") ON DELETE no action ON UPDATE no action;