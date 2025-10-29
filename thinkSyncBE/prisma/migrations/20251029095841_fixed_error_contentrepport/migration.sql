-- AddForeignKey
ALTER TABLE "public"."Contentreport" ADD CONSTRAINT "Contentreport_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
