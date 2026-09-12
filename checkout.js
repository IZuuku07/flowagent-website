document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const serviceId = urlParams.get("serviceId");

  const orderSummary = document.getElementById("orderSummary");
  const checkoutCard = document.getElementById("checkoutCard");
  const successCard = document.getElementById("successCard");
  const successTitle = document.getElementById("successTitle");
  const successMessage = document.getElementById("successMessage");
  
  const methodPaypalLabel = document.getElementById("methodPaypalLabel");
  const methodBankLabel = document.getElementById("methodBankLabel");
  const paypalContainer = document.getElementById("paypalContainer");
  const bankContainer = document.getElementById("bankContainer");
  
  const cihName = document.getElementById("cihName");
  const cihRib = document.getElementById("cihRib");
  const cihIban = document.getElementById("cihIban");
  const cihSwift = document.getElementById("cihSwift");
  const bankSubmitBtn = document.getElementById("bankSubmitBtn");

  if (!serviceId) {
    orderSummary.innerHTML = `<div style="text-align: center; color: var(--error);">No service selected. <a href="/">Go back</a></div>`;
    return;
  }

  try {
    const res = await fetch("/api/public-data");
    const publicData = await res.json();
    
    const service = publicData.services?.find(s => s.id === serviceId) || publicData.pricingPlans?.find(p => p.id === serviceId);
    
    if (!service) {
      orderSummary.innerHTML = `<div style="text-align: center; color: var(--error);">Service not found.</div>`;
      return;
    }

    // Render Order Summary
    orderSummary.innerHTML = `
      <div class="order-summary-row">
        <span>Service</span>
        <strong>${escapeHtml(service.title || service.name)}</strong>
      </div>
      <div class="order-summary-row total">
        <span>Total</span>
        <span>${escapeHtml(service.price)}</span>
      </div>
    `;

    // Render Bank Details
    if (publicData.bankDetails) {
      cihName.textContent = publicData.bankDetails.accountHolder || "-";
      cihRib.textContent = publicData.bankDetails.accountNumber || "-";
      cihIban.textContent = publicData.bankDetails.iban || "-";
      cihSwift.textContent = publicData.bankDetails.swift || "-";
    }

    let selectedMethod = "paypal";

    // Setup Payment Toggles
    const toggleMethod = (method) => {
      selectedMethod = method;
      if (method === "paypal") {
        methodPaypalLabel.classList.add("active");
        methodBankLabel.classList.remove("active");
        paypalContainer.style.display = "block";
        bankContainer.style.display = "none";
      } else {
        methodPaypalLabel.classList.remove("active");
        methodBankLabel.classList.add("active");
        paypalContainer.style.display = "none";
        bankContainer.style.display = "block";
      }
    };

    methodPaypalLabel.addEventListener("change", () => toggleMethod("paypal"));
    methodBankLabel.addEventListener("change", () => toggleMethod("bank"));

    // Check if PayPal is configured
    const clientId = publicData.paymentConfig?.paypalClientId;
    if (clientId && clientId !== "paypal-client-id-placeholder" && clientId !== "") {
      // Load PayPal Script
      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=EUR`;
      script.onload = () => {
        paypal.Buttons({
          createOrder: async (data, actions) => {
            if (!validateForm()) return null;
            
            const btnRes = await fetch("/api/checkout/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(getFormData("paypal"))
            });
            const btnData = await btnRes.json();
            if (!btnRes.ok) throw new Error(btnData.error || "Failed to create order");
            
            window.currentOrderId = btnData.orderId;
            return btnData.paypalOrderId;
          },
          onApprove: async (data, actions) => {
            checkoutCard.style.opacity = "0.5";
            checkoutCard.style.pointerEvents = "none";
            
            try {
              const capRes = await fetch("/api/checkout/capture-paypal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId: window.currentOrderId,
                  paypalOrderId: data.orderID
                })
              });
              const capData = await capRes.json();
              
              if (capRes.ok && capData.success) {
                showSuccess("Payment Successful!", "Your payment was processed via PayPal. We will begin your setup shortly.");
              } else {
                throw new Error(capData.error || "Payment capture failed");
              }
            } catch (err) {
              alert("Error completing payment: " + err.message);
              checkoutCard.style.opacity = "1";
              checkoutCard.style.pointerEvents = "all";
            }
          },
          onError: (err) => {
            console.error("PayPal Checkout Error:", err);
            // alert("PayPal Checkout failed. Please try again.");
          }
        }).render("#paypal-button-container");
      };
      document.body.appendChild(script);
    } else {
      // PayPal not configured
      methodPaypalLabel.style.display = "none";
      toggleMethod("bank");
    }

    // Bank Submit Handler
    bankSubmitBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      if (!validateForm()) return;
      
      const prevText = bankSubmitBtn.textContent;
      bankSubmitBtn.textContent = "Processing...";
      bankSubmitBtn.disabled = true;

      try {
        const createRes = await fetch("/api/checkout/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(getFormData("bank"))
        });
        const createData = await createRes.json();
        if (!createRes.ok) throw new Error(createData.error);

        const transferRes = await fetch("/api/checkout/bank-transfer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: createData.orderId })
        });
        const transferData = await transferRes.json();
        if (!transferRes.ok) throw new Error(transferData.error);

        showSuccess(
          "Order Pending Bank Transfer", 
          "We have received your order request. Please transfer the total amount to the CIH Bank account displayed below and email us your receipt to begin setup."
        );
        
        // Append CIH details to success screen
        const detailsClone = document.getElementById("cihDetails").cloneNode(true);
        detailsClone.style.display = "block";
        detailsClone.style.textAlign = "left";
        detailsClone.style.marginBottom = "32px";
        successCard.insertBefore(detailsClone, successCard.lastElementChild);

      } catch (err) {
        alert("Error: " + err.message);
        bankSubmitBtn.textContent = prevText;
        bankSubmitBtn.disabled = false;
      }
    });

  } catch (err) {
    console.error(err);
    orderSummary.innerHTML = `<div style="text-align: center; color: var(--error);">Error loading checkout data.</div>`;
  }

  function validateForm() {
    const name = document.getElementById("clientName").value.trim();
    const email = document.getElementById("clientEmail").value.trim();
    if (!name || !email) {
      alert("Please fill in your Full Name and Email Address.");
      return false;
    }
    return true;
  }

  function getFormData(method) {
    return {
      serviceId,
      clientName: document.getElementById("clientName").value.trim(),
      clientEmail: document.getElementById("clientEmail").value.trim(),
      clientWhatsApp: document.getElementById("clientWhatsApp").value.trim(),
      paymentMethod: method
    };
  }

  function showSuccess(title, message) {
    checkoutCard.style.display = "none";
    successTitle.textContent = title;
    successMessage.textContent = message;
    successCard.style.display = "block";
  }

  function escapeHtml(unsafe) {
    if (!unsafe) return "";
    return String(unsafe)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
