// Main JavaScript file for CliniSys

document.addEventListener("DOMContentLoaded", () => {
  // Header scroll effect
  const header = document.getElementById("header");

  const handleScroll = () => {
    if (window.scrollY > 10) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  };

  window.addEventListener("scroll", handleScroll);
  
  // Mobile menu toggle
  const menuToggle = document.querySelector(".mobile-menu-toggle");
  const mainNav = document.querySelector(".main-nav");
  
  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      menuToggle.classList.toggle("active");
      mainNav.classList.toggle("active");
    });
  }
  
  // Close mobile menu when clicking outside
  document.addEventListener("click", (event) => {
    if (mainNav && mainNav.classList.contains("active")) {
      if (!event.target.closest(".main-nav") && !event.target.closest(".mobile-menu-toggle")) {
        mainNav.classList.remove("active");
        menuToggle.classList.remove("active");
      }
    }
  });
  
  // Password toggle visibility
  const togglePasswordButtons = document.querySelectorAll(".toggle-password");
  
  if (togglePasswordButtons) {
    togglePasswordButtons.forEach(button => {
      button.addEventListener("click", () => {
        const passwordInput = button.previousElementSibling;
        const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
        passwordInput.setAttribute("type", type);
        
        // Update icon (we could use different icons, but for now we'll just rely on the eye icon)
        if (type === "text") {
          button.setAttribute("aria-label", "Masquer le mot de passe");
        } else {
          button.setAttribute("aria-label", "Afficher le mot de passe");
        }
      });
    });
  }
  
  // Handle fade-in animations for elements
  const animateOnScroll = () => {
    const elements = document.querySelectorAll('.feature-card, .team-card, .faq-item');
    
    elements.forEach(element => {
      const position = element.getBoundingClientRect();
      
      // If the element is in the viewport
      if (position.top < window.innerHeight - 100) {
        element.classList.add('fade-in');
      }
    });
  };
  
  window.addEventListener('scroll', animateOnScroll);
  
  // Run once on page load
  animateOnScroll();
});