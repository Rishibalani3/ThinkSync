import { prisma } from "../config/db.js";
import { analyzeContentModeration } from "./aiRecommendation.service.js";
import { sendNotification } from "../utils/notification.js";
import { io, userSocketMap } from "../app.js";
import nodemailer from "nodemailer";
import { sendMailToUser } from "../utils/SendEmail.js";
import { log } from "../utils/Logger.js";

// In-memory queue for pending moderation jobs
const moderationQueue = [];

/**
 * Schedule content for moderation after a delay
 */
export const scheduleModerationCheck = (
  contentId,
  contentType,
  delay = 60000
) => {
  // delay in milliseconds, default 1 minute
  const job = {
    contentId,
    contentType,
    scheduledAt: Date.now(),
    executeAt: Date.now() + delay,
  };

  moderationQueue.push(job);

  // Schedule the job execution
  setTimeout(() => {
    processModeration(contentId, contentType);
  }, delay);
};

/**
 * Process moderation for a specific content
 */
const processModeration = async (contentId, contentType) => {
  try {
    log(`Processing moderation for ${contentType} ${contentId}`);

    // Fetch the content
    let content, userId;
    if (contentType === "post") {
      const post = await prisma.post.findUnique({
        where: { id: contentId },
        include: { author: true },
      });

      if (!post) {
        log(`Post ${contentId} not found, skipping moderation`);
      }

      // Skip if already flagged or achieved
      if (post.status !== "okay" && post.status !== "under_review") {
        log(`Post ${contentId} already moderated with status: ${post.status}`);
        return;
      }

      content = post.content;
      userId = post.authorId;
    } else if (contentType === "comment") {
      const comment = await prisma.comment.findUnique({
        where: { id: contentId },
        include: { author: true },
      });

      if (!comment) {
        log(`Comment ${contentId} not found, skipping moderation`);
        return;
      }

      // Skip if already flagged or achieved
      if (comment.status !== "okay" && comment.status !== "under_review") {
        log(
          `Comment ${contentId} already moderated with status: ${comment.status}`
        );
        return;
      }

      content = comment.content;
      userId = comment.authorId;
    } else {
      console.error(`Unknown content type: ${contentType}`);
      return;
    }

    // Analyze content with AI
    const moderationResult = await analyzeContentModeration(
      content,
      contentType
    );

    if (!moderationResult) {
      log(`No moderation result for ${contentType} ${contentId}, skipping`);
      return;
    }

    log(`Moderation result for ${contentType} ${contentId}:`, {
      flagged: moderationResult.flagged,
      confidence: moderationResult.confidence,
      severity: moderationResult.severity,
      action: moderationResult.action,
    });

    // Only take action if content is flagged with medium or high severity
    if (moderationResult.flagged && moderationResult.confidence >= 0.4) {
      // Update content status to "flagged"
      if (contentType === "post") {
        await prisma.post.update({
          where: { id: contentId },
          data: { status: "flagged" },
        });

        // Emit real-time update to remove post from feeds
        io.emit("postFlagged", {
          postId: contentId,
          reason: moderationResult.reasons.join(", "),
        });
      } else {
        await prisma.comment.update({
          where: { id: contentId },
          data: { status: "flagged" },
        });
      }

      // Log AI moderation to AdminAuditLog
      try {
        // Find an admin user to associate with the log (or use system)
        const adminUser = await prisma.user.findFirst({
          where: { details: { role: "admin" } },
          select: { id: true },
        });

        if (adminUser) {
          await prisma.adminAuditLog.create({
            data: {
              adminId: adminUser.id,
              action: `ai_moderation_${contentType}_flagged`,
              targetType: contentType,
              targetId: contentId,
              metadata: {
                userId,
                confidence: moderationResult.confidence,
                severity: moderationResult.severity,
                reasons: moderationResult.reasons,
                categories: moderationResult.categories,
              },
            },
          });
        }
      } catch (error) {
        console.error("Error logging AI moderation to audit log:", error);
      }

      // Increment user warning count
      const userDetails = await prisma.userDetails.findUnique({
        where: { userId },
      });

      if (userDetails) {
        await prisma.userDetails.update({
          where: { userId },
          data: {
            warningCount: (userDetails.warningCount || 0) + 1,
          },
        });
      }

      // Send notification
      try {
        await sendNotification(
          {
            receiverId: userId,
            content: `Your ${contentType} has been flagged for review: ${moderationResult.reasons.join(
              ", "
            )}`,
            senderId: userId, // System notification
          },
          io,
          userSocketMap
        );
      } catch (error) {
        console.error("Error sending notification:", error);
      }

      // Send email
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: { details: true },
        });

        if (user && user.email && user.details?.Mailnotification) {
          await sendModerationEmail(user.email, {
            username: user.username || user.displayName,
            contentType,
            reason: moderationResult.reasons.join(", "),
            severity: moderationResult.severity,
            categories: moderationResult.categories,
          });

          log(`Email sent to ${user.email} for ${contentType} ${contentId}`);
        }
      } catch (error) {
        console.error("Error sending email:", error);
      }

      // If high severity, mark as "achieved" for archival
      if (moderationResult.confidence >= 0.7) {
        if (contentType === "post") {
          await prisma.post.update({
            where: { id: contentId },
            data: { status: "achieved" },
          });
        } else {
          await prisma.comment.update({
            where: { id: contentId },
            data: { status: "achieved" },
          });
        }

        log(
          `${contentType} ${contentId} marked as achieved due to high severity`
        );
      }
    } else {
      if (contentType === "post") {
        await prisma.post.update({
          where: { id: contentId },
          data: { status: "okay" },
        });
      } else {
        await prisma.comment.update({
          where: { id: contentId },
          data: { status: "okay" },
        });
      }
    }

    // Remove from queue
    const index = moderationQueue.findIndex(
      (job) => job.contentId === contentId && job.contentType === contentType
    );
    if (index > -1) {
      moderationQueue.splice(index, 1);
    }
  } catch (error) {
    console.error(
      `Error processing moderation for ${contentType} ${contentId}:`,
      error
    );
  }
};

const sendModerationEmail = async (email, data) => {
  try {
    sendMailToUser({
      to: email,
      subject: "Content Moderation Warning - ThinkSync",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff6b6b;">Content Moderation Warning</h2>
          <p>Hello ${data.username},</p>
          <p>Your ${
            data.contentType
          } has been flagged by our AI moderation system for review.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #ff6b6b; margin: 20px 0;">
            <p><strong>Severity:</strong> ${data.severity}</p>
            <p><strong>Reason:</strong> ${data.reason}</p>
            <p><strong>Categories:</strong> ${data.categories.join(", ")}</p>
          </div>
          
          <p>Please review our community guidelines to ensure your future content complies with our policies.</p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending moderation email:", error);
    throw error;
  }
};

export const getPendingModerations = () => {
  return moderationQueue.map((job) => ({
    ...job,
    remainingTime: Math.max(0, job.executeAt - Date.now()),
  }));
};
