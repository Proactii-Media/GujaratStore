import nodemailer from "nodemailer";
import dns from "node:dns/promises";
import validator from "validator";

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Email format validation
const isValidEmailFormat = (email: string) => {
  return validator.isEmail(email);
};

// Strong email verification
const verifyEmail = async (email: string) => {
  try {
    // Check format
    if (!isValidEmailFormat(email)) {
      return {
        status: "invalid",
      };
    }

    const domain = email.split("@")[1];

    // Check MX records
    const mxRecords = await dns.resolveMx(domain);

    if (!mxRecords || mxRecords.length === 0) {
      return {
        status: "invalid",
      };
    }

    // Check if MX hosts actually exist
    for (const mx of mxRecords) {
      try {
        await dns.resolve(mx.exchange);
      } catch {
        return {
          status: "invalid",
        };
      }
    }

    return {
      status: "valid",
    };
  } catch (error) {
    return {
      status: "invalid",
    };
  }
};

export const sendEmailOTP = async (
  email: string,
  otp: string
) => {
  try {
    // Validate email
    const validation = await verifyEmail(email);

    if (validation.status !== "valid") {
      return {
        success: false,
        message: "Invalid or inactive email address",
      };
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Email template
    const emailTemplate = `
  <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification - The Gujarat Store</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 0;">
              <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header with Logo -->
                <tr>
                  <td style="text-align: center; padding: 20px 0; background-color: #FA7275;">
                    <img
                  src="https://gujarat-store.vercel.app/_next/image?url=%2Flogo.png&w=128&q=75"
                  alt="The Gujarat Store Logo"
                  style="max-width: 150px; height: auto; display: block; margin: 0 auto;"
                />
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h1 style="margin: 0 0 20px; color: #C93326; text-align: center; font-size: 24px;">Verify Your Email Address</h1>
                    <p style="margin: 0 0 15px; color: #666; text-align: center; font-size: 16px;">Thank you for choosing The Gujarat Store. Please use the verification code below to complete your email verification:</p>
                    
                    <!-- OTP Box -->
                    <div style="background-color: #efbbac; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
                      <p style="margin: 0; color: #C93326; font-size: 32px; font-weight: bold; letter-spacing: 8px;">${otp}</p>
                    </div>
                    
                    <p style="margin: 0 0 15px; color: #666; text-align: center; font-size: 14px;">This code will expire in 10 minutes. Please do not share this code with anyone.</p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #FF7474; padding: 20px 30px; text-align: center;">
                    <p style="margin: 0; color: white; font-size: 14px;">© ${new Date().getFullYear()} The Gujarat Store. All rights reserved.</p>
                    <p style="margin: 10px 0 0; color: white; font-size: 12px;">Experience the richness of Gujarat's cultural heritage</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Verify your email - The Gujarat Store",
      html: emailTemplate,
    });

    return {
      success: true,
      message: "OTP sent successfully",
    };

  } catch (error) {
    console.log("EMAIL ERROR:", error);

    return {
      success: false,
      message: "Failed to send email",
    };
  }
};