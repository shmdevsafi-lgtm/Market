/**
 * SHM Marketplace - Global Scripts
 * WhatsApp integration and utility functions
 */

function order(product) {
  const phone = "212675202336";
  const msg = encodeURIComponent("طلب: " + product);
  window.open("https://wa.me/" + phone + "?text=" + msg, "_blank");
}

// Initialize smooth scroll behavior
document.addEventListener("DOMContentLoaded", function () {
  // Add hover effects to buttons
  const buttons = document.querySelectorAll(".btn, .category-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("mouseenter", function () {
      this.style.transform = "scale(1.05)";
    });
    btn.addEventListener("mouseleave", function () {
      this.style.transform = "scale(1)";
    });
  });
});
