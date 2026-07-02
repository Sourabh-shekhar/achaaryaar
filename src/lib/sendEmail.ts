import nodemailer from "nodemailer";

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

await transporter.sendMail({
  from: `"AchaarYaar" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "Order Confirmation - AchaarYaar",

  html: `
    <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:20px;">

      <div style="text-align:center;">

        <img
          src="https://achaaryaar-git-main-sourabh-shekhars-projects.vercel.app/image/logo.png"
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
        <strong>Team Achaaraar</strong>
      </p>

    </div>
  `,
});
}