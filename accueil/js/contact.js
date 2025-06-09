// Contact form validation and submission
document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contactForm");
  
  if (!contactForm) return;
  
  // Form validation helpers
  const showError = (inputId, message) => {
    const errorElement = document.getElementById(`${inputId}Error`);
    if (errorElement) {
      errorElement.textContent = message;
    }
    
    const inputElement = document.getElementById(inputId);
    if (inputElement) {
      inputElement.classList.add("error");
      inputElement.setAttribute("aria-invalid", "true");
    }
  };
  
  const clearError = (inputId) => {
    const errorElement = document.getElementById(`${inputId}Error`);
    if (errorElement) {
      errorElement.textContent = "";
    }
    
    const inputElement = document.getElementById(inputId);
    if (inputElement) {
      inputElement.classList.remove("error");
      inputElement.setAttribute("aria-invalid", "false");
    }
  };
  
  // Validation functions
  const validateRequired = (value, fieldName) => {
    if (!value.trim()) {
      return `Le champ ${fieldName} est obligatoire`;
    }
    return "";
  };
  
  const validateEmail = (email) => {
    if (!email.trim()) {
      return "L'adresse email est obligatoire";
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Veuillez entrer une adresse email valide";
    }
    
    return "";
  };
  
  // Real-time validation
  const inputs = contactForm.querySelectorAll("input[required], textarea[required]");
  
  inputs.forEach(input => {
    input.addEventListener("blur", () => {
      validateField(input.id, input.value);
    });
    
    input.addEventListener("input", () => {
      clearError(input.id);
    });
  });
  
  // Function to validate a specific field
  const validateField = (inputId, value) => {
    let errorMessage = "";
    
    switch (inputId) {
      case "name":
        errorMessage = validateRequired(value, "Nom");
        break;
      case "contactEmail":
        errorMessage = validateEmail(value);
        break;
      case "message":
        errorMessage = validateRequired(value, "Message");
        break;
      default:
        break;
    }
    
    if (errorMessage) {
      showError(inputId, errorMessage);
      return false;
    }
    
    clearError(inputId);
    return true;
  };
  
  // Form submission
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    let isValid = true;
    
    // Validate all required fields
    const formData = new FormData(contactForm);
    
    for (const [name, value] of formData.entries()) {
      if (name === "name" || name === "email" || name === "message") {
        const inputId = name === "email" ? "contactEmail" : name;
        if (!validateField(inputId, value)) {
          isValid = false;
        }
      }
    }
    
    if (isValid) {
      // In a real application, this would submit to a server
      alert("Votre message a été envoyé avec succès! Nous vous répondrons dans les plus brefs délais.");
      
      // Reset form
      contactForm.reset();
    }
  });
});