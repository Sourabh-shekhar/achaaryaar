import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Review from "@/models/Review";

// ============================================================
// CREATE REVIEW
// ============================================================

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const {
      productId,
      name,
      rating,
      title = "",
      comment,
      images = [],
      videos = [],
    } = body;

    // Validate required fields
    if (!productId || !name || !rating || !comment) {
      return NextResponse.json(
        {
          success: false,
          message: "Product, name, rating and comment are required",
        },
        { status: 400 }
      );
    }

    // Validate rating
    const numericRating = Number(rating);

    if (
      !Number.isFinite(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Rating must be between 1 and 5",
        },
        { status: 400 }
      );
    }

    // Create review
    // Images and videos are completely optional
    const review = await Review.create({
      productId,
      name: String(name).trim(),
      rating: numericRating,
      title: String(title).trim(),
      comment: String(comment).trim(),
      images: Array.isArray(images) ? images : [],
      videos: Array.isArray(videos) ? videos : [],
    });

    return NextResponse.json(
      {
        success: true,
        message: "Review submitted successfully",
        review,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create review error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit review",
      },
      { status: 500 }
    );
  }
}

// ============================================================
// GET APPROVED REVIEWS FOR A PRODUCT
// ============================================================

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID is required",
        },
        { status: 400 }
      );
    }

    const reviews = await Review.find({
      productId,
      approved: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    const reviewsCount = reviews.length;

    const averageRating =
      reviewsCount > 0
        ? reviews.reduce(
            (sum, review) => sum + Number(review.rating),
            0
          ) / reviewsCount
        : 0;

    return NextResponse.json({
      success: true,
      reviews,
      reviewsCount,
      averageRating,
    });
  } catch (error) {
    console.error("Get reviews error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch reviews",
      },
      { status: 500 }
    );
  }
}