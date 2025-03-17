async function validatePayment(sessionToken, keyId) {
  const url = `https://api.razorpay.com/v1/standard_checkout/payments/validate/account?session_token=${sessionToken}&key_id=${keyId}`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // ...existing headers...
      },
      // ...existing request body...
    });

    if (!response.ok) {
      throw new Error(
        `Server error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    // ...existing code to handle successful response...
  } catch (error) {
    console.error("Payment validation failed:", error);
    // Inform the user about the error
    alert("Payment validation failed. Please subscribe to continue.");
    // Redirect user to subscription page
    window.location.href = "/subscribe";
  }
}
