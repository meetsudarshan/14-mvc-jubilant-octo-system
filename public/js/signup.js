// Function to handle user signup form submission
const signupFormHandler = async (event) => {
  event.preventDefault();

  // Get the username, password, and password confirmation input values and trim any leading/trailing whitespace
  const usernameInputNotCapitalized = document.querySelector("#usernamesignup1").value.trim();
  const usernameInput = usernameInputNotCapitalized.charAt(0).toUpperCase() + usernameInputNotCapitalized.slice(1);
  const passwordInput = document.querySelector("#passwordsignup1").value.trim();
  const passwordConfirmInput = document.querySelector("#passwordsignup2").value.trim();

  if (usernameInput && passwordInput && passwordConfirmInput && passwordInput === passwordConfirmInput) {
    // Send a POST request to the users API endpoint to create a new user
    const response = await fetch("/api/users", {
      method: "POST",
      body: JSON.stringify({ username: usernameInput, password: passwordInput }),
      headers: { "Content-Type": "application/json" },
    });

    // Check if the user was successfully created
    if (response.ok) {
      // Show a success toast notification
      $("#asdf2").toast("show");

      // Redirect the user to the home page
      setTimeout(function () {
        document.location.replace("/");
      }, 2200);
    } else {
      // Show an error toast notification if failed to sign up
      $("#incorrect2").toast("show");
    }
  } else {
    // Show an error toast notification if the inputs are invalid or password confirmation doesn't match
    $("#incorrect2").toast("show");
  }
};

// Add a submit event listener to the signup form
document.querySelector(".signup-form").addEventListener("submit", signupFormHandler);
