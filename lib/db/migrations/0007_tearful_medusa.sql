CREATE TABLE IF NOT EXISTS "ManagedFile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"blobUrl" text NOT NULL,
	"blobDownloadUrl" text NOT NULL,
	"mimeType" varchar(255) NOT NULL,
	"size" integer NOT NULL,
	"aiSummary" text,
	"tags" json,
	"uploadedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"userId" uuid NOT NULL,
	"isEmbedded" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ManagedFile" ADD CONSTRAINT "ManagedFile_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "managedFile_userId_idx" ON "ManagedFile" USING btree ("userId");