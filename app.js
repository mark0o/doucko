// Discord Webhook Configuration
// Replace this URL with your actual Discord webhook URL
const DISCORD_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1380869577260662844/hIp99A4ZcirZLUuTqwWRfk2v3SrcW4P0oCevdRhYM3qk7Fdt2t6ck8D5eManfQKji7wd";

// DOM Content Loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
});

function initializeApp() {
  setupContactForm();
  setupNavigation();
}

// Contact form handling
function setupContactForm() {
  const contactForm = document.getElementById("contactForm");

  if (contactForm) {
    contactForm.addEventListener("submit", handleFormSubmission);
  }
}

async function handleFormSubmission(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  // Validate required fields
  if (!validateForm(formData)) {
    return;
  }

  // Show loading state
  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.textContent = "Odesílám...";
  submitButton.disabled = true;

  try {
    // Send to Discord webhook
    await sendToDiscord(formData);

    // Show success message
    showSuccessMessage();
    resetForm(form);

    // Scroll to success message
    const successMessage = document.querySelector(".success-message");
    if (successMessage) {
      successMessage.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  } catch (error) {
    console.error("Error sending to Discord:", error);
    showErrorMessage(
      "Došlo k chybě při odesílání zprávy. Zkuste to prosím znovu nebo mě kontaktujte přímo."
    );
  } finally {
    // Reset button
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  }
}

async function sendToDiscord(formData) {
  // Check if webhook URL is configured
  if (
    !DISCORD_WEBHOOK_URL ||
    DISCORD_WEBHOOK_URL === "PASTE_YOUR_DISCORD_WEBHOOK_URL_HERE"
  ) {
    console.warn("Discord webhook URL not configured");
    // Still show success message for demo purposes
    return;
  }

  // Extract form data
  const name = formData.get("name") || "Neuvedeno";
  const email = formData.get("email") || "Neuvedeno";
  const phone = formData.get("phone") || "Neuvedeno";
  const childGrade = formData.get("child-grade") || "Neuvedeno";
  const message = formData.get("message") || "Žádná zpráva";

  // Create Discord message with embedded format
  const discordPayload = {
    embeds: [
      {
        title: "📚 Nová poptávka po doučování matematiky",
        color: 0x5375e2, // Primary color from CSS
        fields: [
          {
            name: "👤 Jméno rodiče",
            value: name,
            inline: true,
          },
          {
            name: "📧 E-mail",
            value: `[${email}](mailto:${email})`,
            inline: true,
          },
          {
            name: "📱 Telefon",
            value: phone,
            inline: true,
          },
          {
            name: "🎓 Třída dítěte",
            value: childGrade === "" ? "Neuvedeno" : `${childGrade}. třída`,
            inline: true,
          },
          {
            name: "💬 Zpráva",
            value: message,
            inline: false,
          },
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: "Kontaktní formulář",
        },
      },
    ],
  };

  // Send to Discord
  const response = await fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(discordPayload),
  });

  if (!response.ok) {
    throw new Error(`Discord webhook failed with status: ${response.status}`);
  }
}

function validateForm(formData) {
  const name = formData.get("name");
  const email = formData.get("email");

  if (!name || !name.trim()) {
    showFieldError("name", "Jméno je povinné");
    return false;
  }

  if (!email || !email.trim()) {
    showFieldError("email", "E-mail je povinný");
    return false;
  }

  if (!isValidEmail(email)) {
    showFieldError("email", "Zadejte platný e-mail");
    return false;
  }

  // Clear any existing errors
  clearFieldErrors();
  return true;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function showFieldError(fieldName, message) {
  const field = document.getElementById(fieldName);
  if (!field) return;

  // Remove existing error
  const existingError = field.parentNode.querySelector(".field-error");
  if (existingError) {
    existingError.remove();
  }

  // Add error styling
  field.style.borderColor = "var(--color-error)";

  // Create error message
  const errorElement = document.createElement("div");
  errorElement.className = "field-error";
  errorElement.style.color = "var(--color-error)";
  errorElement.style.fontSize = "var(--font-size-sm)";
  errorElement.style.marginTop = "var(--space-4)";
  errorElement.textContent = message;

  // Insert after the field
  field.parentNode.appendChild(errorElement);

  // Focus the field
  field.focus();
}

function clearFieldErrors() {
  const errorElements = document.querySelectorAll(".field-error");
  errorElements.forEach((error) => error.remove());

  const formControls = document.querySelectorAll(".form-control");
  formControls.forEach((control) => {
    control.style.borderColor = "";
  });
}

function showSuccessMessage() {
  // Remove existing messages
  const existingMessage = document.querySelector(
    ".success-message, .error-message"
  );
  if (existingMessage) {
    existingMessage.remove();
  }

  // Create success message
  const successMessage = document.createElement("div");
  successMessage.className = "success-message show";
  successMessage.innerHTML = `
        <strong>Zpráva byla úspěšně odeslána!</strong><br>
        Děkuji za váš zájem. Odpovím vám do 24 hodin.
    `;

  // Insert before the form
  const contactForm = document.getElementById("contactForm");
  const formContainer = contactForm.parentNode;
  formContainer.insertBefore(successMessage, contactForm);

  // Auto-hide after 5 seconds
  setTimeout(() => {
    successMessage.classList.remove("show");
    setTimeout(() => {
      if (successMessage.parentNode) {
        successMessage.remove();
      }
    }, 300);
  }, 5000);
}

function showErrorMessage(message) {
  // Remove existing messages
  const existingMessage = document.querySelector(
    ".success-message, .error-message"
  );
  if (existingMessage) {
    existingMessage.remove();
  }

  // Create error message
  const errorMessage = document.createElement("div");
  errorMessage.className = "error-message show";
  errorMessage.innerHTML = `
        <strong>Chyba při odesílání zprávy!</strong><br>
        ${message}
    `;

  // Insert before the form
  const contactForm = document.getElementById("contactForm");
  const formContainer = contactForm.parentNode;
  formContainer.insertBefore(errorMessage, contactForm);

  // Auto-hide after 8 seconds
  setTimeout(() => {
    errorMessage.classList.remove("show");
    setTimeout(() => {
      if (errorMessage.parentNode) {
        errorMessage.remove();
      }
    }, 300);
  }, 8000);
}

function resetForm(form) {
  form.reset();
  clearFieldErrors();
}

// Navigation active state
function setupNavigation() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav__link");

  function updateActiveNav() {
    const scrollPosition = window.scrollY + 100;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute("id");

      if (
        scrollPosition >= sectionTop &&
        scrollPosition < sectionTop + sectionHeight
      ) {
        navLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${sectionId}`) {
            link.classList.add("active");
          }
        });
      }
    });
  }

  window.addEventListener("scroll", updateActiveNav);
  updateActiveNav(); // Initial call
}

// Add styles for messages and other interactive elements
const style = document.createElement("style");
style.textContent = `
    .nav__link.active {
        color: var(--color-primary);
        font-weight: var(--font-weight-semibold);
    }
    
    .field-error {
        animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .success-message, .error-message {
        animation: fadeIn 0.3s ease-out;
        padding: var(--space-16);
        border-radius: var(--radius-base);
        margin-bottom: var(--space-16);
        display: none;
    }
    
    .success-message {
        background-color: rgba(var(--color-success-rgb), 0.1);
        border: 1px solid rgba(var(--color-success-rgb), 0.3);
        color: var(--color-success);
    }
    
    .error-message {
        background-color: rgba(var(--color-error-rgb), 0.1);
        border: 1px solid rgba(var(--color-error-rgb), 0.3);
        color: var(--color-error);
    }
    
    .success-message.show, .error-message.show {
        display: block;
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Contact info click handlers
document.addEventListener("DOMContentLoaded", function () {
  // Make email clickable
  const emailElements = document.querySelectorAll(".contact-item__text");
  emailElements.forEach((element) => {
    if (element.textContent.includes("@")) {
      element.style.cursor = "pointer";
      element.addEventListener("click", function () {
        window.location.href = `mailto:${this.textContent}`;
      });
    }

    if (element.textContent.includes("+420")) {
      element.style.cursor = "pointer";
      element.addEventListener("click", function () {
        window.location.href = `tel:${this.textContent}`;
      });
    }
  });
});

// Add hover effects for service cards
document.addEventListener("DOMContentLoaded", function () {
  const serviceCards = document.querySelectorAll(".service-card");

  serviceCards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-8px)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(-4px)";
    });
  });
});

// Accessibility improvements
document.addEventListener("DOMContentLoaded", function () {
  // Add ARIA labels for better accessibility
  const buttons = document.querySelectorAll(".btn");
  buttons.forEach((button) => {
    if (!button.getAttribute("aria-label") && button.textContent) {
      button.setAttribute("aria-label", button.textContent.trim());
    }
  });

  // Add focus visible class for better keyboard navigation
  document.addEventListener("keydown", function (e) {
    if (e.key === "Tab") {
      document.body.classList.add("using-keyboard");
    }
  });

  document.addEventListener("mousedown", function () {
    document.body.classList.remove("using-keyboard");
  });
});

// Performance optimization - lazy load animations
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function handleScrollAnimations() {
  const animatedElements = document.querySelectorAll(
    ".service-card, .math-symbol"
  );

  animatedElements.forEach((element) => {
    if (isElementInViewport(element)) {
      element.classList.add("animate-in");
    }
  });
}

// Throttled scroll handler for performance
let scrollTimeout;
window.addEventListener("scroll", function () {
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }
  scrollTimeout = setTimeout(handleScrollAnimations, 100);
});

// Initial check
document.addEventListener("DOMContentLoaded", handleScrollAnimations);
