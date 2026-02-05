import { NextResponse } from "next/server";
import { groq } from "next-sanity";
import { sanityClient } from "@/sanity/lib/sanity";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Discount code is required" }, { status: 400 });
    }

    // Fetch the discount code from Sanity
    const discountQuery = groq`
      *[_type == "discount" && code == $code][0] {
        _id,
        code,
        discountPercentage,
        validFrom,
        validUntil,
        maxUsage,
        usageCount,
        active
      }
    `;

    const discount = await sanityClient.fetch(discountQuery, { code });

    if (!discount) {
      return NextResponse.json({ error: "Invalid discount code" }, { status: 400 });
    }

    const now = new Date();

    // Validate discount conditions
    if (!discount.active) {
      return NextResponse.json({ error: "This discount code is not active" }, { status: 400 });
    }

    if (discount.validFrom && new Date(discount.validFrom) > now) {
      return NextResponse.json({ error: "This discount code is not yet valid" }, { status: 400 });
    }

    if (discount.validUntil && new Date(discount.validUntil) < now) {
      return NextResponse.json({ error: "This discount code has expired" }, { status: 400 });
    }

    if (discount.usageCount >= discount.maxUsage) {
      return NextResponse.json({ error: "This discount code has reached its usage limit" }, { status: 400 });
    }

    return NextResponse.json({ discountPercentage: discount.discountPercentage });

  } catch (error) {
    console.error("Error validating discount code:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
