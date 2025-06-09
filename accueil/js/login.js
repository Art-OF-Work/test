// Login form validation and submission
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  
  if (!loginForm) return;
  
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
  
  // Real-time validation
  const inputs = loginForm.querySelectorAll("input[required]");
  
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
    if (!value.trim()) {
      const fieldName = inputId === "identifier" ? "Identifiant" : "Mot de passe";
      showError(inputId, `Le champ ${fieldName} est obligatoire`);
      return false;
    }
    
    clearError(inputId);
    return true;
  };
  
  // Form submission
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    let isValid = true;
    
    // Validate identifier
    const identifier = document.getElementById("identifier").value;
    if (!validateField("identifier", identifier)) {
      isValid = false;
    }
    
    // Validate password
    const password = document.getElementById("loginPassword").value;
    if (!validateField("loginPassword", password)) {
      isValid = false;
    }
    
    if (isValid) {
      // In a real application, this would submit to a server for authentication
      alert("Connexion réussie! Vous allez être redirigé vers votre tableau de bord.");
      
      // Redirect to dashboard (in a real app)
      setTimeout(() => {
        window.location.href = "../index.html";
      }, 1000);
    }
  });
});