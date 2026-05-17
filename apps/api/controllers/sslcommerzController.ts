import asyncHandler from "express-async-handler";
import Order from "../models/orderModel.js";

// SSLCommerz API URLs
const SSLCOMMERZ_NEXT_PUBLIC_API_URL =
  process.env.SSLCOMMERZ_IS_LIVE === "true"
    ? "https://securepay.sslcommerz.com"
    : "https://sandbox.sslcommerz.com";

// @desc    Initialize SSLCommerz payment
// @route   POST /api/payments/sslcommerz/init
// @access  Private
// @ts-ignore
export const initSSLCommerzPayment = asyncHandler(async (req, res) => {
  try {
    const { orderId, amount, currency = "BDT" } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Order ID and amount are required",
      });
    }

    const order = await Order.findById(orderId).populate(
      "userId",
      "name email phone"
    );
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!order.userId._id.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to pay for this order",
      });
    }

    // @ts-ignore
    if (order.status === "paid" || order.isPaid) {
      return res.status(400).json({
        success: false,
        message: "This order has already been paid",
      });
    }

    // Prepare SSLCommerz payment data
    const transactionId = `KIDSSTORE-${Date.now()}-${orderId.slice(-8)}`;

    const paymentData = {
      store_id: process.env.SSLCOMMERZ_STORE_ID,
      store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD,
      total_amount: parseFloat(amount).toFixed(2),
      currency: currency,
      tran_id: transactionId,
      success_url: `http://localhost:8000/api/payments/sslcommerz/success`,
      fail_url: `http://localhost:8000/api/payments/sslcommerz/fail`,
      cancel_url: `http://localhost:8000/api/payments/sslcommerz/cancel`,
      ipn_url: `http://localhost:8000/api/payments/sslcommerz/ipn`,
      shipping_method: "Standard",
      product_name: `Baby Shop Order #${orderId.slice(-8).toUpperCase()}`,
      product_category: "Ecommerce",
      product_profile: "general",
      // @ts-ignore
      cus_name: order.userId.name || "Customer",
      // @ts-ignore
      cus_email: order.userId.email,
      cus_add1: order.shippingAddress?.street || "N/A",
      cus_city: order.shippingAddress?.city || "N/A",
      cus_state: order.shippingAddress?.state || "N/A",
      cus_postcode: order.shippingAddress?.postalCode || "0000",
      cus_country: order.shippingAddress?.country || "Bangladesh",
      // @ts-ignore
      cus_phone: order.userId.phone || "01700000000",
      // @ts-ignore
      ship_name: order.userId.name || "Customer",
      ship_add1: order.shippingAddress?.street || "N/A",
      ship_city: order.shippingAddress?.city || "N/A",
      ship_state: order.shippingAddress?.state || "N/A",
      ship_postcode: order.shippingAddress?.postalCode || "0000",
      ship_country: order.shippingAddress?.country || "Bangladesh",
      value_a: orderId, // Store orderId in custom field
      value_b: req.user._id.toString(), // Store userId
    };

    console.log(
      "📤 Sending payment request to SSLCommerz:",
      SSLCOMMERZ_NEXT_PUBLIC_API_URL
    );

    // Initialize payment with SSLCommerz
    const response = await fetch(
      `${SSLCOMMERZ_NEXT_PUBLIC_API_URL}/gwprocess/v4/api.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        // @ts-ignore
        body: new URLSearchParams(paymentData).toString(),
      }
    );

    // Check if response is OK
    if (!response.ok) {
      console.error(
        "❌ SSLCommerz API error:",
        response.status,
        response.statusText
      );
      return res.status(response.status).json({
        success: false,
        message: `SSLCommerz API error: ${response.statusText}`,
      });
    }

    // Get response text first to check content type
    const responseText = await response.text();

    // Check if response is HTML (error page)
    if (
      responseText.trim().startsWith("<!DOCTYPE") ||
      responseText.trim().startsWith("<html")
    ) {
      console.error(
        "❌ SSLCommerz returned HTML instead of JSON:",
        responseText.substring(0, 200)
      );
      return res.status(500).json({
        success: false,
        message:
          "SSLCommerz API returned an invalid response. Please check your credentials.",
      });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error(
        "❌ Failed to parse SSLCommerz response:",
        responseText.substring(0, 200)
      );
      return res.status(500).json({
        success: false,
        message: "Invalid response from payment gateway",
      });
    }

    if (data.status === "SUCCESS") {
      // Update order with transaction ID
      await Order.findByIdAndUpdate(orderId, {
        $set: {
          "paymentDetails.transactionId": transactionId,
          "paymentDetails.gateway": "SSLCommerz",
        },
      });

      res.status(200).json({
        success: true,
        gatewayUrl: data.GatewayPageURL,
        transactionId: transactionId,
        message: "Payment session created successfully",
      });
    } else {
      console.error("❌ SSLCommerz error:", data);
      res.status(400).json({
        success: false,
        message: data.failedreason || "Failed to initialize payment",
      });
    }
  } catch (error: any) {
    console.error("❌ SSLCommerz initialization error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to initialize payment",
    });
  }
});

// @desc    Handle SSLCommerz success callback
// @route   POST /api/payments/sslcommerz/success
// @access  Public (SSLCommerz callback)
export const handleSSLCommerzSuccess = asyncHandler(async (req, res) => {
  try {
    const {
      tran_id,
      val_id,
      amount,
      card_type,
      store_amount,
      card_issuer,
      bank_tran_id,
      value_a: orderId,
    } = req.body;

    if (!orderId) {
      console.error("❌ Order ID missing in success callback");
      return res.redirect(`${process.env.CLIENT_URL}/checkout?payment=failed`);
    }

    // Validate payment with SSLCommerz
    const validationData = {
      val_id: val_id,
      store_id: process.env.SSLCOMMERZ_STORE_ID,
      store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD,
      format: "json",
    };

    const validationResponse = await fetch(
      // @ts-ignore
      `${SSLCOMMERZ_NEXT_PUBLIC_API_URL}/validator/api/validationserverAPI.php?${new URLSearchParams(validationData).toString()}`
    );

    const validationData2 = await validationResponse.json();

    if (
      validationData2.status === "VALID" ||
      validationData2.status === "VALIDATED"
    ) {
      // Extract comprehensive payment information from SSLCommerz response
      const {
        card_brand,
        currency,
        currency_type,
        currency_amount,
        currency_rate,
        verify_sign,
        verify_key,
        risk_title,
        risk_level,
        card_no,
      } = req.body;

      // Determine payment method and mobile provider from card_type
      let paymentMethod = "card";
      let mobileProvider = null;
      let cardCategory = card_brand || "UNKNOWN";

      if (card_type && card_type.toLowerCase().includes("mobile")) {
        paymentMethod = "mobile_banking";
        // Extract mobile banking provider (bKash, Nagad, Rocket, etc.)
        if (card_type.toLowerCase().includes("bkash")) {
          mobileProvider = "bKash";
        } else if (card_type.toLowerCase().includes("nagad")) {
          mobileProvider = "Nagad";
        } else if (card_type.toLowerCase().includes("rocket")) {
          mobileProvider = "Rocket";
        } else {
          mobileProvider = "Other";
        }
      } else if (card_type && card_type.toLowerCase().includes("internet")) {
        paymentMethod = "internet_banking";
      }

      // Update order with comprehensive payment information
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          paymentStatus: "paid",
          isPaid: true,
          paidAt: new Date(),
          paymentMethod: "sslcommerz",
          payment_info: {
            gateway: "sslcommerz",
            sslcommerz: {
              transactionId: tran_id,
              validationId: val_id,
              bankTransactionId: bank_tran_id,
              cardType: card_type,
              cardIssuer: card_issuer,
              cardBrand: card_brand,
              paymentMethod: paymentMethod,
              cardCategory: cardCategory,
              amount: parseFloat(amount),
              storeAmount: parseFloat(store_amount),
              currency: currency,
              currencyType: currency_type,
              currencyAmount: parseFloat(currency_amount),
              conversionRate: parseFloat(currency_rate),
              verifySign: verify_sign,
              verifyKey: verify_key,
              riskTitle: risk_title,
              riskLevel: risk_level,
              mobileProvider: mobileProvider,
            },
            paidAmount: parseFloat(amount),
            currency: currency || "BDT",
            paidAt: new Date(),
          },
        },
        { new: true }
      );

      if (updatedOrder) {
        return res.redirect(
          `${process.env.CLIENT_URL}/success?orderId=${orderId}&payment=success`
        );
      } else {
        console.error("❌ Order not found:", orderId);
        return res.redirect(
          `${process.env.CLIENT_URL}/checkout?payment=failed`
        );
      }
    } else {
      console.error("❌ Payment validation failed:", validationData2);
      return res.redirect(`${process.env.CLIENT_URL}/checkout?payment=failed`);
    }
  } catch (error: any) {
    console.error("❌ SSLCommerz success handler error:", error);
    return res.redirect(`${process.env.CLIENT_URL}/checkout?payment=error`);
  }
});

// @desc    Handle SSLCommerz fail callback
// @route   POST /api/payments/sslcommerz/fail
// @access  Public (SSLCommerz callback)
export const handleSSLCommerzFail = asyncHandler(async (req, res) => {
  const { value_a: orderId } = req.body;

  if (orderId) {
    await Order.findByIdAndUpdate(orderId, {
      $set: {
        "paymentDetails.status": "failed",
        "paymentDetails.failureReason": req.body.error || "Payment failed",
      },
    });
  }

  res.redirect(
    `${process.env.CLIENT_URL}/checkout?payment=failed&orderId=${orderId || ""}`
  );
});

// @desc    Handle SSLCommerz cancel callback
// @route   POST /api/payments/sslcommerz/cancel
// @access  Public (SSLCommerz callback)
export const handleSSLCommerzCancel = asyncHandler(async (req, res) => {
  const { value_a: orderId } = req.body;

  if (orderId) {
    await Order.findByIdAndUpdate(orderId, {
      $set: {
        "paymentDetails.status": "cancelled",
      },
    });
  }

  res.redirect(`${process.env.CLIENT_URL}/user/orders/${orderId || ""}`);
});

// @desc    Handle SSLCommerz IPN (Instant Payment Notification)
// @route   POST /api/payments/sslcommerz/ipn
// @access  Public (SSLCommerz callback)
export const handleSSLCommerzIPN = asyncHandler(async (req, res) => {
  // Process IPN for additional payment status updates
  // This is useful for asynchronous payment confirmations

  res.status(200).json({ status: "OK" });
});
