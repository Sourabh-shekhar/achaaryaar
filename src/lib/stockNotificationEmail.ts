import { Resend } from "resend";
import { connectDB } from "@/lib/mongodb";
import StockNotification from "@/models/StockNotification";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://achaaryaar.com";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBackInStockNotifications({
  productId,
  productName,
  variant,
}: {
  productId: string;
  productName: string;
  variant: string;
}) {
  await connectDB();

  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is missing");
  }

  const notifications = await StockNotification.find({
    productId,
    variant,
    notified: false,
  });

  if (notifications.length === 0) {
    return {
      total: 0,
      sent: 0,
      failed: 0,
    };
  }

  let sent = 0;
  let failed = 0;

  const productUrl = `${SITE_URL}/products/${productId}`;

  for (const notification of notifications) {
    try {
      const { error } = await resend.emails.send({
        from:
          process.env.EMAIL_FROM ||
          "AchaarYaar <orders@achaaryaar.com>",

        to: notification.email,

        subject: `🎉 ${productName} is back in stock!`,

        text: `Good news! ${productName} (${variant}) is back in stock at AchaarYaar. Order now before it sells out again: ${productUrl}`,

        html: `
          <div style="font-family:Arial,sans-serif;background:#FBF7F1;padding:30px;color:#2D2A26;">
            <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:16px;padding:32px;border:1px solid #E8DDD1;">
              
              <h1 style="margin-top:0;color:#3D5640;">
                🎉 It's Back in Stock!
              </h1>

              <p style="font-size:16px;line-height:1.6;">
                Good news! The product you were waiting for is now available.
              </p>

              <div style="background:#FBF7F1;border-radius:12px;padding:18px;margin:20px 0;">
                <div style="font-size:20px;font-weight:bold;">
                  ${productName}
                </div>

                <div style="margin-top:6px;color:#7A6F65;">
                  ${variant}
                </div>
              </div>

              <p style="font-size:16px;">
                Hurry — order now before it goes out of stock again!
              </p>

              <a
                href="${productUrl}"
                style="display:inline-block;background:#3D5640;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:10px;font-weight:bold;margin-top:10px;"
              >
                Shop Now
              </a>

              <p style="margin-top:30px;color:#7A6F65;font-size:13px;">
                Thank you for shopping with AchaarYaar — Har Niwale Ka Yaar.
              </p>

            </div>
          </div>
        `,
      });

      if (error) {
        throw new Error(error.message);
      }

      notification.notified = true;
      notification.notifiedAt = new Date();

      await notification.save();

      sent++;
    } catch (error) {
      console.error(
        `Failed to send back-in-stock email to ${notification.email}:`,
        error
      );

      // Keep notification pending if sending fails.
      failed++;
    }
  }

  return {
    total: notifications.length,
    sent,
    failed,
  };
}