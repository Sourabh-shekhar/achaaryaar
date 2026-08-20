// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import cloudinary from "@/lib/cloudinary";

// export async function POST(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);
//     const role = (session?.user as { role?: string } | undefined)?.role;

//     if (role !== "admin") {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const data = await req.formData();

//     const file = data.get("file") as File;

//     if (!file) {
//       return NextResponse.json(
//         { success: false, message: "No file uploaded" },
//         { status: 400 }
//       );
//     }

//     if (!file.type.startsWith("image/")) {
//       return NextResponse.json(
//         { success: false, message: "Please upload an image file" },
//         { status: 400 }
//       );
//     }

//     if (file.size > 10 * 1024 * 1024) {
//       return NextResponse.json(
//         { success: false, message: "Each image must be 10 MB or smaller" },
//         { status: 400 }
//       );
//     }

//     const bytes = await file.arrayBuffer();
//     const buffer = Buffer.from(bytes);

//     const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

//     const uploaded = await cloudinary.uploader.upload(base64, {
//       folder: "achaaryaar-products",
//       resource_type: "image",
//     });

//     return NextResponse.json({
//       success: true,
//       url: uploaded.secure_url,
//     });
//   } catch (error) {
//     console.log(error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Upload failed",
//       },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import cloudinary from "@/lib/cloudinary";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB

export async function POST(req: Request) {
  try {
    // ADMIN CHECK
    const session = await getServerSession(authOptions);

    const role = (
      session?.user as { role?: string } | undefined
    )?.role;

    if (role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // GET FILE
    const data = await req.formData();

    const file = data.get("file") as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "No file uploaded",
        },
        { status: 400 }
      );
    }

    // CHECK FILE TYPE
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      return NextResponse.json(
        {
          success: false,
          message: "Please upload an image or video file",
        },
        { status: 400 }
      );
    }

    // IMAGE SIZE LIMIT
    if (isImage && file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "Each image must be 10 MB or smaller",
        },
        { status: 400 }
      );
    }

    // VIDEO SIZE LIMIT
    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "Each video must be 100 MB or smaller",
        },
        { status: 400 }
      );
    }

    // CONVERT FILE TO BUFFER
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // CONVERT TO BASE64
    const base64 = `data:${file.type};base64,${buffer.toString(
      "base64"
    )}`;

    // UPLOAD TO CLOUDINARY
    const uploaded = await cloudinary.uploader.upload(base64, {
      folder: "achaaryaar-products",
      resource_type: isVideo ? "video" : "image",
    });

    // SUCCESS RESPONSE
    return NextResponse.json({
      success: true,
      url: uploaded.secure_url,

      // Extra fields for compatibility
      ...(isImage
        ? { image: uploaded.secure_url }
        : { video: uploaded.secure_url }),

      resourceType: isVideo ? "video" : "image",
    });
  } catch (error) {
    console.error("Upload error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Upload failed",
      },
      { status: 500 }
    );
  }
}