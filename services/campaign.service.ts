
// import { WelcomeEmailData } from "@/lib/workflows/emails/shared/types";
// import { wrapEmailTemplate } from "@/lib/workflows/emails/shared/templates";


// export const sendCampaignEmails = async () => {
//   try {
//     console.log("========== CAMPAIGN STARTED ==========");

//     const totalUsers = await User.countDocuments();
// console.log("TOTAL USERS IN DATABASE:", totalUsers);



// const users = await User.find({
//   emailValid: true,
//   $or: [
//     { campaignSentAt: null },
//     { campaignSentAt: { $exists: false } }
//   ]
// });

//     console.log("TOTAL USERS FOUND:", users.length);

//     let sent = 0;
//     let failed = 0;

//     for (const user of users) {
//       try {
//         console.log("--------------------------------");
//         console.log("SENDING TO:", user.email);

//         const info = await transporter.sendMail({
//           from: process.env.SMTP_FROM,
//           to: user.email,
//           subject: " mukesh We Miss You at The Gujarat Store mukesh",
//           html: `
//             <p>Dear ${user.name},</p>
//             <p>We noticed you haven't logged in for a while. We miss you! Come back and check out our latest products and offers.</p>
//             <p>As a token of our appreciation, here's a special discount code just for you: <strong>WELCOME10</strong></p>
//           `,
//         });

//         console.log("EMAIL SENT:", user.email);
//         console.log("MESSAGE ID:", info.messageId);

//         await User.findByIdAndUpdate(user._id, {
//           campaignSentAt: new Date(),
//         });

//         console.log("campaignSentAt UPDATED");

//         sent++;

//         await new Promise((resolve) =>
//           setTimeout(resolve, 1000)
//         );

//       } catch (error) {
//         failed++;

//         console.log("FAILED EMAIL:", user.email);
//         console.log("ERROR:", error);
//       }
//     }

//     console.log("========== CAMPAIGN FINISHED ==========");
//     console.log("SENT:", sent);
//     console.log("FAILED:", failed);

//     return {
//       success: true,
//       sent,
//       failed,
//       message: "Campaign completed",
//     };

//   } catch (error) {
//     console.log("CAMPAIGN ERROR:", error);

//     return {
//       success: false,
//       error: String(error),
//     };
//   }
// };


export const sendCampaignEmails = async () => {
  return {
    success: true,
    sent: 0,
    failed: 0,
    message: "Campaign disabled",
  };
};
