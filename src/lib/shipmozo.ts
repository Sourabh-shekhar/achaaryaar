/*
|--------------------------------------------------------------------------
| SHIPMOZO CONFIGURATION
|--------------------------------------------------------------------------
*/

const SHIPMOZO_BASE_URL = (
    process.env.SHIPMOZO_BASE_URL ||
    "https://shipping-api.com/app/api/v1"
).replace(/\/$/, "");

/*
|--------------------------------------------------------------------------
| GET SHIPMOZO HEADERS
|--------------------------------------------------------------------------
*/

function getHeaders(): HeadersInit {
    const publicKey = process.env.SHIPMOZO_PUBLIC_KEY;
    const privateKey = process.env.SHIPMOZO_PRIVATE_KEY;

    if (!publicKey || !privateKey) {
        throw new Error(
            "SHIPMOZO_PUBLIC_KEY or SHIPMOZO_PRIVATE_KEY is missing."
        );
    }

    return {
        "Content-Type": "application/json",
        Accept: "application/json",
        "public-key": publicKey,
        "private-key": privateKey,
    };
}

/*
|--------------------------------------------------------------------------
| PARSE RESPONSE
|--------------------------------------------------------------------------
*/

async function parseResponse(response: Response): Promise<any> {
    const responseText = await response.text();

    console.log("=================================");
    console.log("SHIPMOZO RESPONSE STATUS:", response.status);
    console.log("SHIPMOZO RESPONSE TEXT:", responseText);
    console.log("=================================");

    let data: any = {};

    try {
        data = responseText ? JSON.parse(responseText) : {};
    } catch {
        throw new Error(
            `Shipmozo returned an invalid response: ${responseText}`
        );
    }

    if (!response.ok) {
        throw new Error(
            `Shipmozo API failed (${response.status}): ${
                data?.data?.error ||
                data?.error ||
                data?.message ||
                data?.data?.message ||
                "Unknown error"
            }`
        );
    }

    if (
        data?.result !== undefined &&
        String(data.result) !== "1"
    ) {
        throw new Error(
            `Shipmozo API failed: ${
                data?.data?.error ||
                data?.error ||
                data?.message ||
                data?.data?.message ||
                "Unknown error"
            }`
        );
    }

    return data;
}

/*
|--------------------------------------------------------------------------
| ROUND CM
|--------------------------------------------------------------------------
|
| Shipmozo does not accept decimal dimensions.
|
| Example:
| 17.78 cm -> 18 cm
| 20.32 cm -> 21 cm
| 8.89 cm  -> 9 cm
|--------------------------------------------------------------------------
*/

function roundUpCm(value: number): number {
    return Math.ceil(value);
}

/*
|--------------------------------------------------------------------------
| INCH TO CM
|--------------------------------------------------------------------------
*/

function inchToCm(inches: number): number {
    return roundUpCm(inches * 2.54);
}

/*
|--------------------------------------------------------------------------
| CHECK COMBO
|--------------------------------------------------------------------------
*/

function isCombo(item: any): boolean {
    if (item?.isCombo === true) {
        return true;
    }

    const text = [
        item?.selectedVariant,
        item?.quantityType,
        item?.variant,
        item?.name,
        item?.productName,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    return text.includes("combo");
}

/*
|--------------------------------------------------------------------------
| GET JAR SIZE
|--------------------------------------------------------------------------
*/

function getItemWeight(item: any): string {
    const values = [
        item?.selectedVariant,
        item?.quantityType,
        item?.size,
        item?.weight,
        item?.variant,
        item?.name,
        item?.productName,
    ];

    for (const value of values) {
        const text = String(value || "")
            .toLowerCase()
            .replace(/\s+/g, "");

        if (text.includes("120g")) return "120g";
        if (text.includes("220g")) return "220g";
        if (text.includes("330g")) return "330g";
        if (text.includes("430g")) return "430g";
    }

    return "";
}

/*
|--------------------------------------------------------------------------
| GET COMBO JAR COUNT
|--------------------------------------------------------------------------
*/

function getComboSize(item: any): number {
    const directValues = [
        item?.comboSize,
        item?.comboQuantity,
        item?.jarCount,
    ];

    for (const value of directValues) {
        const numberValue = Number(value);

        if (
            Number.isFinite(numberValue) &&
            numberValue > 0
        ) {
            return Math.floor(numberValue);
        }
    }

    const text = [
        item?.selectedVariant,
        item?.quantityType,
        item?.variant,
        item?.name,
        item?.productName,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    /*
    |--------------------------------------------------------------------------
    | Examples:
    | 2 Jar Combo
    | 4 Jar Combo
    |--------------------------------------------------------------------------
    */

    const jarMatch = text.match(/(\d+)\s*jar[s]?/i);

    if (jarMatch?.[1]) {
        const value = Number(jarMatch[1]);

        if (
            Number.isFinite(value) &&
            value > 0
        ) {
            return Math.floor(value);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Examples:
    | Combo x 2
    | Combo × 2
    |--------------------------------------------------------------------------
    */

    const xMatch = text.match(/(?:x|×)\s*(\d+)/i);

    if (xMatch?.[1]) {
        const value = Number(xMatch[1]);

        if (
            Number.isFinite(value) &&
            value > 0
        ) {
            return Math.floor(value);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | COMBO ITEMS
    |--------------------------------------------------------------------------
    */

    if (
        Array.isArray(item?.comboItems) &&
        item.comboItems.length > 0
    ) {
        return item.comboItems.reduce(
            (
                total: number,
                comboItem: any
            ) => {
                const quantity = Number(
                    comboItem?.quantity || 1
                );

                return (
                    total +
                    (
                        Number.isFinite(quantity) &&
                        quantity > 0
                            ? quantity
                            : 1
                    )
                );
            },
            0
        );
    }

    /*
    |--------------------------------------------------------------------------
    | DEFAULT
    |--------------------------------------------------------------------------
    |
    | Normal combo = 2 jars
    |--------------------------------------------------------------------------
    */

    if (isCombo(item)) {
        return 2;
    }

    return 1;
}

/*
|--------------------------------------------------------------------------
| CALCULATE PACKED WEIGHT
|--------------------------------------------------------------------------
*/

function calculateTotalPackedWeight(order: any): number {
    if (
        !Array.isArray(order?.items) ||
        order.items.length === 0
    ) {
        throw new Error(
            "Cannot calculate shipping weight: order has no items."
        );
    }

    const jarCounts: Record<string, number> = {
        "120g": 0,
        "220g": 0,
        "330g": 0,
        "430g": 0,
    };

    for (const item of order.items) {
        const size = getItemWeight(item);

        if (!size) {
            throw new Error(
                `Weight/variant is missing for "${
                    item?.name ||
                    item?.productName ||
                    "Unknown product"
                }".`
            );
        }

        const quantity = Math.max(
            1,
            Math.floor(
                Number(item?.quantity || 1)
            )
        );

        const jarsPerItem = isCombo(item)
            ? getComboSize(item)
            : 1;

        const totalJars =
            quantity * jarsPerItem;

        jarCounts[size] += totalJars;

        console.log("PRODUCT:", item?.name || item?.productName || "Unknown");
        console.log("SIZE:", size);
        console.log("ORDER QUANTITY:", quantity);
        console.log("JARS PER ITEM:", jarsPerItem);
        console.log("TOTAL JARS:", totalJars);
    }

    let totalWeight = 0;

    /*
    |--------------------------------------------------------------------------
    | 120g
    |--------------------------------------------------------------------------
    |
    | 1 jar = 250g
    | 2 jars = 450g
    | 4 jars = 700g
    |--------------------------------------------------------------------------
    */

    if (jarCounts["120g"] > 0) {
        let jars = jarCounts["120g"];

        while (jars >= 4) {
            totalWeight += 700;
            jars -= 4;
        }

        while (jars >= 2) {
            totalWeight += 450;
            jars -= 2;
        }

        if (jars === 1) {
            totalWeight += 250;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 220g
    |--------------------------------------------------------------------------
    |
    | 1 jar = 400g
    | 2 jars = 600g
    |--------------------------------------------------------------------------
    */

    if (jarCounts["220g"] > 0) {
        let jars = jarCounts["220g"];

        while (jars >= 2) {
            totalWeight += 600;
            jars -= 2;
        }

        if (jars === 1) {
            totalWeight += 400;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 330g
    |--------------------------------------------------------------------------
    |
    | 1 jar = 450g
    | 2 jars = 800g
    |--------------------------------------------------------------------------
    */

    if (jarCounts["330g"] > 0) {
        let jars = jarCounts["330g"];

        while (jars >= 2) {
            totalWeight += 800;
            jars -= 2;
        }

        if (jars === 1) {
            totalWeight += 450;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 430g
    |--------------------------------------------------------------------------
    |
    | 1 jar = 600g
    |--------------------------------------------------------------------------
    */

    if (jarCounts["430g"] > 0) {
        totalWeight += jarCounts["430g"] * 600;
    }

    if (totalWeight <= 0) {
        throw new Error(
            "Could not calculate order shipping weight."
        );
    }

    console.log("=================================");
    console.log("TOTAL JAR COUNTS:", jarCounts);
    console.log(
        "TOTAL PACKED ORDER WEIGHT:",
        totalWeight,
        "g"
    );
    console.log("=================================");

    return totalWeight;
}

/*
|--------------------------------------------------------------------------
| GET CARTON DIMENSIONS
|--------------------------------------------------------------------------
|
| ORIGINAL DIMENSIONS ARE IN INCHES.
|
| 2 jar combo:
| 7 x 4 x 3.5 inch
|
| 430g single:
| 7 x 4 x 3.5 inch
|
| Remaining:
| 120g x 4 = 6 x 6 x 6 inch
| 220g single = 4 x 4 x 4 inch
| 220g x 2 = 7 x 4 x 3.5 inch
| 330g single = 5 x 5 x 5 inch
| 330g x 2 = 8 x 6 x 6 inch
|--------------------------------------------------------------------------
*/

function getPackageDimensions(
    order: any
): {
    length: number;
    width: number;
    height: number;
} {
    const jarCounts: Record<string, number> = {
        "120g": 0,
        "220g": 0,
        "330g": 0,
        "430g": 0,
    };

    for (const item of order.items) {
        const size = getItemWeight(item);

        if (!size) {
            continue;
        }

        const quantity = Math.max(
            1,
            Math.floor(
                Number(item?.quantity || 1)
            )
        );

        const jarsPerItem = isCombo(item)
            ? getComboSize(item)
            : 1;

        jarCounts[size] +=
            quantity * jarsPerItem;
    }

    /*
    |--------------------------------------------------------------------------
    | MIXED / MULTIPLE PRODUCTS
    |--------------------------------------------------------------------------
    |
    | Shipmozo accepts one package.
    |
    | Safe larger carton for larger/mixed orders.
    |--------------------------------------------------------------------------
    */

    const totalJars =
        Object.values(jarCounts).reduce(
            (sum, value) => sum + value,
            0
        );

    /*
    |--------------------------------------------------------------------------
    | 330g x 2 OR 5+ JARS
    |--------------------------------------------------------------------------
    */

    if (
        jarCounts["330g"] >= 2 ||
        totalJars >= 5
    ) {
        return {
            length: inchToCm(8),
            width: inchToCm(6),
            height: inchToCm(6),
        };
    }

    /*
    |--------------------------------------------------------------------------
    | 120g x 4
    |--------------------------------------------------------------------------
    */

    if (jarCounts["120g"] >= 4) {
        return {
            length: inchToCm(6),
            width: inchToCm(6),
            height: inchToCm(6),
        };
    }

    /*
    |--------------------------------------------------------------------------
    | 2 JAR COMBO
    |--------------------------------------------------------------------------
    */

    if (totalJars === 2) {
        return {
            length: inchToCm(7),
            width: inchToCm(4),
            height: inchToCm(3.5),
        };
    }

    /*
    |--------------------------------------------------------------------------
    | 220g x 2
    |--------------------------------------------------------------------------
    */

    if (jarCounts["220g"] >= 2) {
        return {
            length: inchToCm(7),
            width: inchToCm(4),
            height: inchToCm(3.5),
        };
    }

    /*
    |--------------------------------------------------------------------------
    | 330g SINGLE
    |--------------------------------------------------------------------------
    */

    if (jarCounts["330g"] === 1) {
        return {
            length: inchToCm(5),
            width: inchToCm(5),
            height: inchToCm(5),
        };
    }

    /*
    |--------------------------------------------------------------------------
    | 430g SINGLE
    |--------------------------------------------------------------------------
    */

    if (jarCounts["430g"] === 1) {
        return {
            length: inchToCm(7),
            width: inchToCm(4),
            height: inchToCm(3.5),
        };
    }

    /*
    |--------------------------------------------------------------------------
    | 220g SINGLE
    |--------------------------------------------------------------------------
    */

    if (jarCounts["220g"] === 1) {
        return {
            length: inchToCm(4),
            width: inchToCm(4),
            height: inchToCm(4),
        };
    }

    /*
    |--------------------------------------------------------------------------
    | DEFAULT 120g SINGLE
    |--------------------------------------------------------------------------
    */

    return {
        length: inchToCm(4),
        width: inchToCm(4),
        height: inchToCm(4),
    };
}

/*
|--------------------------------------------------------------------------
| PUSH ORDER TO SHIPMOZO
|--------------------------------------------------------------------------
*/

export async function pushShipmozoOrder(order: any) {
    const warehouseId =
        process.env.SHIPMOZO_WAREHOUSE_ID;

    if (!warehouseId) {
        throw new Error(
            "SHIPMOZO_WAREHOUSE_ID is missing."
        );
    }

    if (!order?._id) {
        throw new Error("Order ID is missing.");
    }

    if (
        !Array.isArray(order?.items) ||
        order.items.length === 0
    ) {
        throw new Error("Order has no items.");
    }

    const orderDate =
        new Date(
            order.createdAt || Date.now()
        )
            .toISOString()
            .split("T")[0];

    const productDetail =
        order.items.map(
            (item: any) => ({
                name:
                    item?.name ||
                    item?.productName ||
                    "AchaarYaar Product",

                sku_number:
                    item?.productId?.toString() ||
                    item?._id?.toString() ||
                    item?.sku ||
                    "",

                quantity:
                    Math.max(
                        1,
                        Math.floor(
                            Number(
                                item?.quantity || 1
                            )
                        )
                    ),

                discount: "",

                hsn:
                    item?.hsn || "",

                unit_price:
                    Number(
                        item?.price ||
                        item?.unitPrice ||
                        item?.salePrice ||
                        0
                    ),

                product_category:
                    item?.productCategory ||
                    "Food",
            })
        );

    const isCOD =
        String(
            order?.paymentMethod ||
            order?.payment_type ||
            ""
        ).toLowerCase() === "cod";

    const totalWeight =
        calculateTotalPackedWeight(order);

    const dimensions =
        getPackageDimensions(order);

    const body = {
        order_id:
            order._id.toString(),

        order_date:
            orderDate,

        consignee_name:
            order?.fullName ||
            order?.name ||
            "",

        consignee_phone:
            String(
                order?.phone || ""
            ),

        consignee_alternate_phone:
            "",

        consignee_email:
            String(
                order?.email || ""
            ),

        consignee_address_line_one:
            order?.address || "",

        consignee_address_line_two:
            order?.address2 ||
            order?.addressLine2 ||
            "",

        consignee_pin_code:
            String(
                order?.pincode || ""
            ),

        consignee_city:
            order?.city || "",

        consignee_state:
            order?.state || "",

        product_detail:
            productDetail,

        payment_type:
            isCOD
                ? "COD"
                : "PREPAID",

        cod_amount:
            isCOD
                ? String(
                    order?.total || 0
                )
                : "",

        shipping_charges:
            String(
                order?.shipping ||
                order?.shippingCharges ||
                0
            ),

        weight:
            totalWeight,

        /*
        |--------------------------------------------------------------------------
        | DIMENSIONS IN WHOLE CENTIMETERS
        |--------------------------------------------------------------------------
        */

        length:
            dimensions.length,

        width:
            dimensions.width,

        height:
            dimensions.height,

        warehouse_id:
            String(warehouseId),

        gst_ewaybill_number:
            "",

        gstin_number:
            "",
    };

    console.log("=================================");
    console.log(
        "SHIPMOZO PUSH URL:",
        `${SHIPMOZO_BASE_URL}/push-order`
    );

    console.log(
        "SHIPMOZO DIMENSIONS:",
        dimensions
    );

    console.log("SHIPMOZO PAYLOAD:");

    console.log(
        JSON.stringify(
            body,
            null,
            2
        )
    );

    console.log("=================================");

    let response: Response;

    try {
        response =
            await fetch(
                `${SHIPMOZO_BASE_URL}/push-order`,
                {
                    method: "POST",

                    headers:
                        getHeaders(),

                    body:
                        JSON.stringify(body),

                    cache:
                        "no-store",
                }
            );
    } catch (error: any) {
        console.error(
            "SHIPMOZO NETWORK ERROR:",
            error
        );

        throw new Error(
            `Could not connect to Shipmozo API: ${
                error?.message ||
                "Network error"
            }`
        );
    }

    return parseResponse(response);
}

/*
|--------------------------------------------------------------------------
| AUTO ASSIGN COURIER
|--------------------------------------------------------------------------
*/

export async function autoAssignShipmozoOrder(
    orderId: string
) {
    if (!orderId) {
        throw new Error(
            "Shipmozo order ID is required for auto assignment."
        );
    }

    console.log(
        "Auto assigning Shipmozo order:",
        orderId
    );

    console.log(
        "SHIPMOZO AUTO ASSIGN URL:",
        `${SHIPMOZO_BASE_URL}/auto-assign-order`
    );

    const response =
        await fetch(
            `${SHIPMOZO_BASE_URL}/auto-assign-order`,
            {
                method: "POST",

                headers:
                    getHeaders(),

                body:
                    JSON.stringify({
                        order_id:
                            orderId,
                    }),

                cache:
                    "no-store",
            }
        );

    return parseResponse(response);
}

/*
|--------------------------------------------------------------------------
| ASSIGN COURIER MANUALLY
|--------------------------------------------------------------------------
*/

export async function assignShipmozoCourier(
    orderId: string,
    courierId: string
) {
    if (!orderId) {
        throw new Error(
            "Shipmozo order ID is required."
        );
    }

    if (!courierId) {
        throw new Error(
            "Courier ID is required."
        );
    }

    const response =
        await fetch(
            `${SHIPMOZO_BASE_URL}/assign-courier`,
            {
                method: "POST",

                headers:
                    getHeaders(),

                body:
                    JSON.stringify({
                        order_id:
                            orderId,

                        courier_id:
                            courierId,
                    }),

                cache:
                    "no-store",
            }
        );

    return parseResponse(response);
}

/*
|--------------------------------------------------------------------------
| CANCEL SHIPMENT
|--------------------------------------------------------------------------
|
| IMPORTANT:
| This function accepts ONLY orderId.
| Your cancel route must call:
|
| cancelShipmozoOrder(shipmozoOrderId)
|
|--------------------------------------------------------------------------
*/

export async function cancelShipmozoOrder(
    orderId: string
) {
    if (!orderId) {
        throw new Error(
            "Shipmozo order ID is required."
        );
    }

    console.log(
        "Cancelling Shipmozo order:",
        orderId
    );

    console.log(
        "SHIPMOZO CANCEL URL:",
        `${SHIPMOZO_BASE_URL}/cancel-order`
    );

    const response =
        await fetch(
            `${SHIPMOZO_BASE_URL}/cancel-order`,
            {
                method: "POST",

                headers:
                    getHeaders(),

                body:
                    JSON.stringify({
                        order_id:
                            orderId,
                    }),

                cache:
                    "no-store",
            }
        );

    return parseResponse(response);
}