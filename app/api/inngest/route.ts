import { inngest } from "@/lib/inngest/client";
import { serve } from "inngest/next";
import {
  userWelcomeEmail,
  guestTemporaryPasswordEmail,
  orderConfirmationEmails,
  orderCancellationEmail,
  orderRefundEmail,
  shippingStatusNotification,
  orderReadyToShipEmail,
  orderAdminCancellationEmail,
  orderVendorCancellationEmail,
  paymentFailureEmail,
  sendInactiveUserEmails,
} from "@/lib/inngest/functions";

console.log("INNGEST ENV CHECK:", {
  eventKey: !!process.env.INNGEST_EVENT_KEY,
  signingKey: !!process.env.INNGEST_SIGNING_KEY,
});


export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    userWelcomeEmail,
    guestTemporaryPasswordEmail,
    orderConfirmationEmails,
    orderCancellationEmail,
    orderRefundEmail,
    orderReadyToShipEmail,
    orderAdminCancellationEmail,
    orderVendorCancellationEmail,
    paymentFailureEmail,
    sendInactiveUserEmails,
    shippingStatusNotification,
  ],
});
