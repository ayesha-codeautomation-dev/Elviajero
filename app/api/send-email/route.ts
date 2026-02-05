import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received body:", body);

    const { paymentIntent, bookingDetails } = body;

    if (!paymentIntent || !bookingDetails || !bookingDetails.email) {
      console.error("Invalid payload received:", { paymentIntent, bookingDetails });
      return NextResponse.json(
        { error: "Missing paymentIntent or bookingDetails.email" },
        { status: 400 }
      );
    }

    // Configure NodeMailer
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    // Helper function to format duration
    const formatDuration = (duration: string | number, pricingType: string) => {
      if (pricingType === "Hourly") {
        const hours = Number(duration) || 1;
        return `${hours} hour${hours > 1 ? 's' : ''}`;
      } else if (pricingType === "Half Day") {
        return "4 hours";
      } else if (pricingType === "Full Day") {
        return "8 hours";
      }
      return "N/A";
    };

    // Reusable booking details table
    const bookingTable = `
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; border: 1px solid #ddd;">
        <tr style="background-color: #004080; color: white;">
          <th colspan="2" style="padding: 12px; text-align: center; font-size: 1.2em;">Booking Details</th>
        </tr>
        <tr><td style="padding:10px;font-weight:bold;color:#004080;border-bottom:1px solid #eee;">Booking ID:</td><td style="padding:10px;border-bottom:1px solid #eee;">${bookingDetails.bookingId}</td></tr>
        <tr><td style="padding:10px;font-weight:bold;color:#004080;border-bottom:1px solid #eee;">Pickup Location:</td><td style="padding:10px;border-bottom:1px solid #eee;">${bookingDetails.pickupName || "N/A"}</td></tr>
        <tr><td style="padding:10px;font-weight:bold;color:#004080;border-bottom:1px solid #eee;">Destination:</td><td style="padding:10px;border-bottom:1px solid #eee;">${bookingDetails.destinationName || "N/A"}</td></tr>
        <tr><td style="padding:10px;font-weight:bold;color:#004080;border-bottom:1px solid #eee;">Distance:</td><td style="padding:10px;border-bottom:1px solid #eee;">${bookingDetails.distance ? bookingDetails.distance.toFixed(2) : 0} km</td></tr>
        <tr><td style="padding:10px;font-weight:bold;color:#004080;border-bottom:1px solid #eee;">Pricing Type:</td><td style="padding:10px;border-bottom:1px solid #eee;">${bookingDetails.pricingType || "N/A"}</td></tr>
        ${bookingDetails.boatRentalCount > 0 ? `<tr><td style="padding:10px;font-weight:bold;color:#004080;border-bottom:1px solid #eee;">Boat Duration:</td><td style="padding:10px;border-bottom:1px solid #eee;">${formatDuration(bookingDetails.hourlyDuration, bookingDetails.pricingType)}</td></tr>` : ''}
        ${bookingDetails.jetSkisCount > 0 ? `<tr><td style="padding:10px;font-weight:bold;color:#004080;border-bottom:1px solid #eee;">Jet Ski Duration:</td><td style="padding:10px;border-bottom:1px solid #eee;">${formatDuration(bookingDetails.hourlyDurationJetSki, bookingDetails.pricingType)}</td></tr>` : ''}
        <tr><td style="padding:10px;font-weight:bold;color:#004080;border-bottom:1px solid #eee;">Waiting Time:</td><td style="padding:10px;border-bottom:1px solid #eee;">${bookingDetails.waitingTime || 0} hour${bookingDetails.waitingTime > 1 ? 's' : ''}</td></tr>
        <tr><td style="padding:10px;font-weight:bold;color:#004080;border-bottom:1px solid #eee;">People:</td><td style="padding:10px;border-bottom:1px solid #eee;">${bookingDetails.people}</td></tr>
        <tr><td style="padding:10px;font-weight:bold;color:#004080;border-bottom:1px solid #eee;">Water Sports:</td><td style="padding:10px;border-bottom:1px solid #eee;">${bookingDetails.waterSport?.join(", ") || "None"}</td></tr>
        <tr><td style="padding:10px;font-weight:bold;color:#004080;border-bottom:1px solid #eee;">Boat Rentals:</td><td style="padding:10px;border-bottom:1px solid #eee;">${bookingDetails.boatRentalCount}</td></tr>
        <tr><td style="padding:10px;font-weight:bold;color:#004080;border-bottom:1px solid #eee;">Jet Skis:</td><td style="padding:10px;border-bottom:1px solid #eee;">${bookingDetails.jetSkisCount}</td></tr>
        <tr><td style="padding:10px;font-weight:bold;color:#004080;border-bottom:1px solid #eee;">Booking Date:</td><td style="padding:10px;border-bottom:1px solid #eee;">${bookingDetails.bookingDate}</td></tr>
        <tr><td style="padding:10px;font-weight:bold;color:#004080;border-bottom:1px solid #eee;">Pickup Time:</td><td style="padding:10px;border-bottom:1px solid #eee;">${bookingDetails.pickupTime}</td></tr>
        <tr><td style="padding:10px;font-weight:bold;color:#004080;border-bottom:1px solid #eee;">Rental Option:</td><td style="padding:10px;border-bottom:1px solid #eee;">${bookingDetails.rentalOption || "N/A"}</td></tr>
        <tr style="background-color: #f8f9fa;">
          <td style="padding:10px;font-weight:bold;color:#004080;border-bottom:1px solid #ddd;">Total Cost:</td>
          <td style="padding:10px;font-weight:bold;color:#d9534f;border-bottom:1px solid #ddd;">$${bookingDetails.totalCost.toFixed(2)}</td>
        </tr>
      </table>
    `;

    // Important Information Section
    const importantInfo = `
      <div style="margin: 20px 0; padding: 15px; background-color: #fff8e1; border-left: 4px solid #ffc107; border-radius: 4px;">
        <h3 style="color: #856404; margin-top: 0;">📋 Important Information</h3>
        <ul style="color: #856404; padding-left: 20px; margin-bottom: 0;">
          <li style="margin-bottom: 8px;">All bookings can be customized to your needs and to many other destinations as long as there is availability and all safety regulations are abided by at all times.</li>
          <li style="margin-bottom: 8px;"><strong>Jet skis to be returned by sunset</strong>. Boat will only navigate in waves up to 5ft, winds up to 20mph.</li>
          <li style="margin-bottom: 8px;">We recommend island hopping jet ski tours to be taken with more than 1 jet ski.</li>
          ${bookingDetails.totalCost > 650 ?
        `<li style="margin-bottom: 8px;"><strong>🎉 COMPLIMENTARY AMENITIES INCLUDED!</strong> Your booking exceeds $650, so you'll receive: water, sodas, beer, floaties, snorkelling gear, fishing gear, underwater GoPro and drone photos/videos.</li>` :
        ''}
          <li style="margin-bottom: 8px;">Boat has 10 passengers capacity, however, we'll only take up to 6 paying passengers.</li>
        </ul>
      </div>
    `;

    // Working Hours Section
    const workingHours = `
      <div style="margin: 20px 0; padding: 15px; background-color: #e7f3ff; border-left: 4px solid #004080; border-radius: 4px;">
        <h3 style="color: #004080; margin-top: 0;">🕐 Working Hours</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background-color: #004080; color: white;">
            <th style="padding: 8px; text-align: left;">Days</th>
            <th style="padding: 8px; text-align: left;">Hours</th>
          </tr>
          <tr style="background-color: #f0f8ff;">
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">Monday - Thursday</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">9:00 AM - 5:00 PM</td>
          </tr>
          <tr style="background-color: #ffffff;">
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">Friday - Sunday</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">9:00 AM - 6:00 PM</td>
          </tr>
        </table>
      </div>
    `;

    // Prepare for Departure Section
    const preparationTips = `
      <div style="margin: 20px 0; padding: 15px; background-color: #d4edda; border-left: 4px solid #28a745; border-radius: 4px;">
        <h3 style="color: #155724; margin-top: 0;">✅ Prepare for Your Adventure</h3>
        <ul style="color: #155724; padding-left: 20px; margin-bottom: 0;">
          <li style="margin-bottom: 8px;">Please arrive at least <strong>15 minutes before</strong> your scheduled pickup time</li>
          <li style="margin-bottom: 8px;">Bring sunscreen, hats, and appropriate swimwear</li>
          <li style="margin-bottom: 8px;">All safety equipment will be provided</li>
          <li style="margin-bottom: 8px;">Stay hydrated - water will be available onboard</li>
          <li style="margin-bottom: 0;">Have your booking ID ready for check-in</li>
        </ul>
      </div>
    `;

    // 1. Customer Email
    const customerMailOptions = {
      from: `"EL VIAJERO" <${process.env.GMAIL_USER}>`,
      to: bookingDetails.email,
      subject: `Your Booking Confirmation #${bookingDetails.bookingId} - EL VIAJERO`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmation</title>
          <style>
            @media only screen and (max-width: 600px) {
              .container {
                width: 100% !important;
              }
              .header {
                padding: 15px !important;
              }
              .content {
                padding: 15px !important;
              }
            }
          </style>
        </head>
        <body style="margin:0;padding:0;font-family:Arial,sans-serif;color:#333;background-color:#f7f7f7;">
          <div class="container" style="max-width:600px;margin:auto;background-color:#ffffff;">
            <!-- Header -->
            <div class="header" style="background: linear-gradient(135deg, #004080 0%, #0066cc 100%);color:white;padding:30px 20px;text-align:center;">
              <h1 style="margin:0 0 10px 0;font-size:2em;">EL VIAJERO</h1>
              <p style="margin:0;font-size:1.1em;opacity:0.9;">Your Caribbean Adventure Awaits!</p>
              <div style="margin-top:15px;padding:10px;background-color:rgba(255,255,255,0.1);border-radius:5px;display:inline-block;">
                <p style="margin:0;font-size:1.2em;font-weight:bold;">Booking Confirmed!</p>
              </div>
            </div>
            
            <!-- Main Content -->
            <div class="content" style="padding:25px;">
              <div style="text-align:center;margin-bottom:25px;">
                <p style="color:#004080;font-size:1.1em;margin-bottom:20px;">Thank you for choosing EL VIAJERO! Your adventure in the Caribbean is confirmed.</p>
                <div style="background-color:#e7f3ff;padding:12px;border-radius:5px;display:inline-block;">
                  <p style="margin:0;color:#004080;font-weight:bold;">
                    📅 ${bookingDetails.bookingDate} at ${bookingDetails.pickupTime}<br>
                    📍 ${bookingDetails.pickupName} → ${bookingDetails.destinationName || "Various Locations"}
                  </p>
                </div>
              </div>
              
              ${bookingTable}
              
              ${importantInfo}
              
              ${workingHours}
              
              ${preparationTips}
              
              <!-- Contact Information -->
              <div style="margin:25px 0;padding:20px;background-color:#f8f9fa;border-radius:5px;text-align:center;">
                <h3 style="color:#004080;margin-top:0;">📞 Need Assistance?</h3>
                <p style="margin-bottom:10px;">For any questions or changes to your booking:</p>
                <p style="margin:5px 0;"><strong>Email:</strong> eduard@elviajeropr.com</p>
                <p style="margin:5px 0;"><strong>Phone:</strong> +1 787 988-9321</p>
                <p style="margin:5px 0;"><strong>Booking Reference:</strong> ${bookingDetails.bookingId}</p>
              </div>
              
              <div style="text-align:center;margin-top:30px;padding-top:20px;border-top:1px solid #eee;">
                <p style="color:#666;font-size:0.9em;margin-bottom:10px;">We look forward to providing you with an unforgettable experience!</p>
                <p style="color:#004080;font-weight:bold;margin:0;">The EL VIAJERO Team</p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color:#004080;color:white;padding:20px;text-align:center;font-size:0.9em;">
              <p style="margin:0 0 10px 0;">EL VIAJERO Boat & Jet Ski Rentals</p>
              <p style="margin:0;opacity:0.8;">© ${new Date().getFullYear()} EL VIAJERO. All rights reserved.</p>
              <p style="margin:10px 0 0 0;opacity:0.8;">For your safety, please follow all instructions from our crew.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(customerMailOptions);
    console.log("Customer email sent ✅");

    // 2. Admin Email (Simplified version)
    const ownerMailOptions = {
      from: `"Booking Notifier" <${process.env.GMAIL_USER}>`,
      to: [
        "eduard@elviajeropr.com",
        "info@elviajeropr.com",
        "eduard.olan@yahoo.com",
      ],
      subject: `🚤 NEW BOOKING: ${bookingDetails.bookingId} - $${bookingDetails.totalCost}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .header { background-color: #004080; color: white; padding: 15px; text-align: center; }
            .highlight { background-color: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin: 15px 0; }
            .total { font-size: 1.5em; color: #d9534f; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>🚤 NEW BOOKING RECEIVED</h2>
            <p>${bookingDetails.bookingId} | ${bookingDetails.bookingDate} at ${bookingDetails.pickupTime}</p>
          </div>
          
          <div style="padding: 20px;">
            <h3>📋 Booking Summary</h3>
            ${bookingTable}
            
            <div class="highlight">
              <p><strong>Customer Email:</strong> ${bookingDetails.email}</p>
              <p><strong>Payment Status:</strong> Paid ($${bookingDetails.totalCost.toFixed(2)})</p>
              <p><strong>Rental:</strong> ${bookingDetails.boatRentalCount > 0 ? `${bookingDetails.boatRentalCount} Boat(s)` : ''} ${bookingDetails.jetSkisCount > 0 ? `${bookingDetails.jetSkisCount} Jet Ski(s)` : ''}</p>
              <p><strong>People:</strong> ${bookingDetails.people}</p>
            </div>
            
            <p><em>This email was automatically generated by your booking system.</em></p>
            
            <div style="margin-top: 20px; padding: 10px; background-color: #f8f9fa; border-radius: 5px;">
              <p><strong>Action Required:</strong> Please prepare the equipment for ${bookingDetails.bookingDate}.</p>
              ${bookingDetails.totalCost > 650 ? '<p style="color: #155724; font-weight: bold;">⚠️ Includes complimentary amenities (booking > $650)</p>' : ''}
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(ownerMailOptions);
    console.log("Owner notification sent ✅");

    return NextResponse.json({ message: "Emails sent successfully!" });

  } catch (error) {
    console.error("Error in /api/send-email:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}