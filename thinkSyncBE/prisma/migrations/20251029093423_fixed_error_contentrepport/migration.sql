-- AddForeignKey
ALTER TABLE "public"."Contentreport" ADD CONSTRAINT "Contentreport_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Contentreport" ADD CONSTRAINT "Contentreport_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "public"."Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
