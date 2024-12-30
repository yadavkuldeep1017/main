console.log("Test");
const messageContainer = document.getElementById("messageContainer");
const errorMessage = document.getElementById("errorMessage");
document
  .getElementById("contactForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = {
      name:
        document.getElementById("name").value +
        document.getElementById("surname").value,
      email: document.getElementById("email").value,
      mobile: document.getElementById("phone").value,
      message: document.getElementById("message").value,
    };
    const button = document.createElement("button");
    button.setAttribute("type", "button");
    button.setAttribute("class", "btn-close");
    button.setAttribute("data-bs-dismiss", "alert");
    button.setAttribute("aria-label", "Close");
    /* make sure to replace the xxxxxxx with the form id you created on fabform.io */

    fetch("https://fabform.io/f/pf2EctI", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success === "true") {
          messageContainer.style.display = "block";
          messageContainer.textContent = "Form submitted successfully!";
          messageContainer.appendChild(button);
          document.getElementById("contactForm").reset();
        } else {
          throw new Error("Server response indicates failure");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        document.getElementById("contactForm").reset();
        errorMessage.style.display = "block";
        errorMessage.textContent =
          "An error occurred while submitting the form.";
        errorMessage.appendChild(button);
      });
  });
