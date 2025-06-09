// Register form validation and submission
document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  
  if (!registerForm) return;
  
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
    // Check if ends with @gmail.com as per requirements
    if (!email.trim()) {
      return "L'adresse Gmail est obligatoire";
    }
    
    if (!email.toLowerCase().endsWith("@gmail.com")) {
      return "Vous devez utiliser une adresse Gmail";
    }
    
    const emailRegex = /^[^\s@]+@gmail\.com$/i;
    if (!emailRegex.test(email)) {
      return "Veuillez entrer une adresse Gmail valide";
    }
    
    return "";
  };
  
  const validatePassword = (password) => {
    if (!password) {
      return "Le mot de passe est obligatoire";
    }
    
    if (password.length < 8) {
      return "Le mot de passe doit contenir au moins 8 caractères";
    }
    
    return "";
  };
  
  const validateBirthdate = (date) => {
    if (!date) {
      return "La date de naissance est obligatoire";
    }
    
    // Check format DD/MM/YYYY
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!dateRegex.test(date)) {
      return "Format de date invalide. Utilisez JJ/MM/AAAA";
    }
    
    // Validate the date
    const parts = date.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    
    const dateObj = new Date(year, month, day);
    
    if (
      dateObj.getFullYear() !== year ||
      dateObj.getMonth() !== month ||
      dateObj.getDate() !== day
    ) {
      return "Date invalide";
    }
    
    // Check if date is in the past
    const today = new Date();
    if (dateObj > today) {
      return "La date de naissance doit être dans le passé";
    }
    
    // Check if age is reasonable (e.g., older than 18 and younger than 120)
    const age = today.getFullYear() - dateObj.getFullYear();
    if (age > 120) {
      return "L'âge semble trop élevé";
    }
    
    return "";
  };
  
  const validateCIN = (cin) => {
    if (!cin) {
      return "Le numéro CIN est obligatoire";
    }
    
    // Basic validation - can be adjusted based on specific CIN format requirements
    if (cin.length < 6) {
      return "Le numéro CIN semble trop court";
    }
    
    return "";
  };
  
  // Real-time validation
  const inputs = registerForm.querySelectorAll("input[required]");
  
  inputs.forEach(input => {
    input.addEventListener("blur", () => {
      validateField(input.id, input.value);
    });
    
    input.addEventListener("input", () => {
      clearError(input.id);
    });
  });
  
  // Birthdate formatting helper
  const birthdateInput = document.getElementById("birthdate");
  if (birthdateInput) {
    birthdateInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, '');
      
      if (value.length > 2) {
        value = value.substring(0, 2) + '/' + value.substring(2);
      }
      
      if (value.length > 5) {
        value = value.substring(0, 5) + '/' + value.substring(5, 9);
      }
      
      e.target.value = value;
    });
  }
  
  // Function to validate a specific field
  const validateField = (inputId, value) => {
    let errorMessage = "";
    
    switch (inputId) {
      case "lastName":
        errorMessage = validateRequired(value, "Nom");
        break;
      case "firstName":
        errorMessage = validateRequired(value, "Prénom");
        break;
      case "cin":
        errorMessage = validateCIN(value);
        break;
      case "birthdate":
        errorMessage = validateBirthdate(value);
        break;
      case "email":
        errorMessage = validateEmail(value);
        break;
      case "password":
        errorMessage = validatePassword(value);
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
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    let isValid = true;
    
    // Validate all required fields
    const formData = new FormData(registerForm);
    
    for (const [name, value] of formData.entries()) {
      if (name === "lastName" || name === "firstName" || name === "cin" || 
          name === "birthdate" || name === "email" || name === "password") {
        if (!validateField(name, value)) {
          isValid = false;
        }
      }
    }
    
    // Validate gender
    const genderChecked = registerForm.querySelector('input[name="gender"]:checked');
    if (!genderChecked) {
      showError("gender", "Veuillez sélectionner votre sexe");
      isValid = false;
    } else {
      clearError("gender");
    }
    
    if (isValid) {
      // In a real application, this would submit to a server
      alert("Inscription réussie! Vous allez être redirigé vers la page de connexion.");
      
      // Redirect to login page
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);
    }
  });
});