import razorpayConfig from "../../assets/Config/razorpayConfig.json";

export const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
        // Check if script is already loaded
        if (window.Razorpay) {
            resolve();
            return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.crossOrigin = "anonymous"; // Add crossOrigin attribute
        
        // Add error handling
        script.onerror = (error) => {
            console.error("Failed to load Razorpay script:", error);
            // Try loading from alternate URL if primary fails
            const fallbackScript = document.createElement("script");
            fallbackScript.src = "https://api.razorpay.com/v1/checkout.js";
            fallbackScript.async = true;
            fallbackScript.crossOrigin = "anonymous";
            
            fallbackScript.onload = resolve;
            fallbackScript.onerror = (fallbackError) => {
                console.error("Failed to load Razorpay fallback script:", fallbackError);
                reject(fallbackError);
            };
            
            document.body.appendChild(fallbackScript);
        };
        
        script.onload = resolve;
        document.body.appendChild(script);
    });
};

export const getRazorpayOptions = (grandTotal,orderRefNum,order_id,triggerRazorPaySaveOrder) => {
    console.log(grandTotal,"grandTotal")
    return {
        key: "rzp_test_WKJV9Cxb9fVlZ8",
        name: "BiteQR",
        description: "some description",
        order_id: order_id,
        handler: function (res) {
            const { razorpay_payment_id, razorpay_signature } = res;
            const data = {
                orderReferenceNumber: orderRefNum,
                razorpayPaymentId: razorpay_payment_id,
                razorpayOrderId: order_id,
                razorpaySignature: razorpay_signature
            }
            triggerRazorPaySaveOrder.mutate(data)

        },
        theme: {
            color: "#d87500",
            hide_topbar: true
        },
        config: razorpayConfig,
    };
};

export const openRazorpayModal = (options) => {
    const rzp1 = new window.Razorpay(options);
    rzp1.open();
};
