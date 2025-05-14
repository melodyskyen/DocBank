CREATE TABLE IF NOT EXISTS "Tag" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(64) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Tag_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "ManagedFile" ALTER COLUMN "blobDownloadUrl" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ManagedFile" ALTER COLUMN "mimeType" SET DATA TYPE text;