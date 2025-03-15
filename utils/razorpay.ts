import Razorpay from "razorpay";
import { Subscription } from "@prisma/client";
import dayjs from "dayjs";

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID ?? "",
  key_secret: process.env.RAZORPAY_KEY_SECRET ?? "",
});

export const getPayingStatus = (subscription: Subscription | null): boolean => {
  return (
    !!subscription &&
    !!subscription.razorpayCurrentPeriodEnd &&
    dayjs(subscription.razorpayCurrentPeriodEnd).isAfter(dayjs())
  );
};
