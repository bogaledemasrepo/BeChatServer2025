CREATE TYPE "public"."requestStatus" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "friendRequest" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from" uuid NOT NULL,
	"to" uuid NOT NULL,
	"status" "requestStatus" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "friendRequest" ADD CONSTRAINT "friendRequest_from_users_id_fk" FOREIGN KEY ("from") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendRequest" ADD CONSTRAINT "friendRequest_to_users_id_fk" FOREIGN KEY ("to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;