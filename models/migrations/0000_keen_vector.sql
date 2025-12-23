CREATE TYPE "public"."orderStatus" AS ENUM('PENDING', 'ORDERED', 'SHIPPED', 'DELIVERED');--> statement-breakpoint
CREATE TYPE "public"."requestStatus" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."userRole" AS ENUM('ADMIN', 'CUSTOMER');--> statement-breakpoint
CREATE TABLE "friendRequest" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from" uuid NOT NULL,
	"to" uuid NOT NULL,
	"status" "requestStatus" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text,
	"file_url" varchar(255)[],
	"sender_id" uuid NOT NULL,
	"receiver_id" uuid NOT NULL,
	"unread" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"birthDate" date NOT NULL,
	"photos" text[],
	"userId" uuid PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"avator" varchar(255),
	"password" varchar(255) NOT NULL,
	"userRole" "userRole" DEFAULT 'CUSTOMER',
	"is_online" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "friendRequest" ADD CONSTRAINT "friendRequest_from_users_id_fk" FOREIGN KEY ("from") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendRequest" ADD CONSTRAINT "friendRequest_to_users_id_fk" FOREIGN KEY ("to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;