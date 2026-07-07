import nodemailer from "nodemailer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://achaaryaar.com";
const logoUrl = `${siteUrl}/image/logo.png`;

export async function sendOrderConfirmation(
  email: string,
  fullName: string,
  orderId: string
) {
  const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

const fromEmail = process.env.EMAIL_FROM || "orders@achaaryaar.com";

await transporter.sendMail({
  from: `"AchaarYaar Orders" <${fromEmail}>`,
  to: email,
  subject: "Order Confirmation - AchaarYaar",

  html: `
    <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:20px;">

      <div style="text-align:center;">

        <img
          src="${logoUrl}"
          alt="AchaarYaar Logo"
          width="180"
        />

        <h1 style="color:#ea580c; margin-top:10px;">
          AchaarYaar
        </h1>

        <p style="color:#666;">
          Authentic Homemade Pickles
        </p>

      </div>

      <hr style="margin:30px 0;" />

      <h2>Thank you for your order, ${fullName}!</h2>

      <p>
        Your order has been received successfully.
      </p>

      <p>
        <strong>Order ID:</strong> ${orderId}
      </p>

      <p>
        We will process your order soon.
      </p>

      <br/>

      <p>
        Regards,<br/>
        <strong>Team AchaarYaar</strong>
      </p>

    </div>
  `,
});
}

export async function sendAdminOrderNotification(order: {
  _id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  total?: number;
  paymentMethod?: string;
}) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const fromEmail = process.env.EMAIL_FROM || "orders@achaaryaar.com";
  const adminEmail = process.env.ADMIN_ORDER_EMAIL || "orders@achaaryaar.com";

  await transporter.sendMail({
    from: `"AchaarYaar Orders" <${fromEmail}>`,
    to: adminEmail,
    subject: `New order received - ${order._id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:20px;">
        <div style="text-align:center; margin-bottom: 1rem;">
          <img src="${logoUrl}" alt="AchaarYaar Logo" width="120" />
        </div>
        <h2>New order received</h2>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Customer:</strong> ${order.fullName || "Customer"}</p>
        <p><strong>Email:</strong> ${order.email || "N/A"}</p>
        <p><strong>Phone:</strong> ${order.phone || "N/A"}</p>
        <p><strong>Payment:</strong> ${order.paymentMethod || "N/A"}</p>
        <p><strong>Total:</strong> ₹${order.total || 0}</p>
      </div>
    `,
  });
}