CREATE TYPE "public"."orderStatus" AS ENUM('PENDING', 'ORDERED', 'SHIPPED', 'DELIVERED');--> statement-breakpoint
CREATE TYPE "public"."userRole" AS ENUM('ADMIN', 'CUSTOMER');--> statement-breakpoint
CREATE TABLE "profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"birthDate" date NOT NULL,
	"photos" text[],
	"userId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"avator" varchar(255),
	"password" varchar(255) NOT NULL,
	"userRole" "userRole" DEFAULT 'CUSTOMER',
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;