import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Review from "@/models/Review";

function cleanUrls(values: unknown) {
  if (!Array.isArray(values)) return [];

  return values.filter(
    (value): value is string =>
      typeof value === "string" &&
      value.trim().length > 0
  );
}

// GET ALL APPROVED REVIEWS FOR A PRODUCT
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await context.params;

    const reviews = await Review.find({
      productId: id,
      approved: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("Failed to fetch reviews:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch reviews",
      },
      { status: 500 }
    );
  }
}

// ADD A PUBLIC REVIEW
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await context.params;
    const body = await req.json();

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    const name = String(body.name || "").trim();
    const title = String(body.title || "").trim();
    const comment = String(body.comment || "").trim();
    const rating = Number(body.rating);

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter your name",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select a rating from 1 to 5",
        },
        { status: 400 }
      );
    }

    if (!comment) {
      return NextResponse.json(
        {
          success: false,
          message: "Please write a review",
        },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Name is too long",
        },
        { status: 400 }
      );
    }

    if (title.length > 150) {
      return NextResponse.json(
        {
          success: false,
          message: "Review title is too long",
        },
        { status: 400 }
      );
    }

    if (comment.length > 2000) {
      return NextResponse.json(
        {
          success: false,
          message: "Review is too long",
        },
        { status: 400 }
      );
    }

    const images = cleanUrls(body.images);
    const videos = cleanUrls(body.videos);

    const review = await Review.create({
      productId: product._id,
      name,
      rating,
      title,
      comment,
      images,
      videos,

      // Public reviews appear immediately
      approved: true,
    });

    // RECALCULATE PRODUCT RATING
    const ratingData = await Review.aggregate([
      {
        $match: {
          productId: product._id,
          approved: true,
        },
      },
      {
        $group: {
          _id: null,
          averageRating: {
            $avg: "$rating",
          },
          reviewsCount: {
            $sum: 1,
          },
        },
      },
    ]);

    const averageRating =
      ratingData.length > 0
        ? Math.round(ratingData[0].averageRating * 10) / 10
        : 0;

    const reviewsCount =
      ratingData.length > 0
        ? ratingData[0].reviewsCount
        : 0;

    product.rating = averageRating;
    product.reviewsCount = reviewsCount;

    await product.save();

    return NextResponse.json(
      {
        success: true,
        message: "Review submitted successfully",
        review,
        rating: averageRating,
        reviewsCount,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to submit review:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit review",
      },
      { status: 500 }
    );
  }
}