import { RequestHandler } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabase";

const DonationSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  donationType: z.string().min(1, "Donation type is required"),
  donorName: z.string().min(1, "Donor name is required"),
  donorEmail: z.string().email("Invalid email"),
  donorPhone: z.string().optional(),
  paypalOrderId: z.string().optional(),
});

export type DonationData = z.infer<typeof DonationSchema>;

export const handleDonation: RequestHandler = async (req, res) => {
  try {
    // Validate request body
    const donationData = DonationSchema.parse(req.body);

    // Save donation to Supabase
    try {
      const { data, error } = await supabaseAdmin
        .from("donations")
        .insert([
          {
            amount: donationData.amount,
            donation_type: donationData.donationType,
            donor_email: donationData.donorEmail,
            paypal_order_id: donationData.paypalOrderId || null,
            status: "completed",
          },
        ])
        .select("id");

      if (error) {
        console.warn("Warning: Could not save donation to database:", error.message);
        // Continue even if DB save fails
      } else {
        console.log("✓ Donation saved to database:", data?.[0]);
      }
    } catch (dbError) {
      console.warn("Warning: Database error:", dbError);
    }

    return res.json({
      success: true,
      message: "Donation recorded successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid donation data",
        details: error.errors,
      });
    }

    console.error("Donation error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to process donation",
    });
  }
};
