const Form = document.getElementById("Form");
const username = document.getElementById("username");
const email = document.getElementById("email");
const password = document.getElementById("password");
const repeat_password = document.getElementById("repeat-password");
const error_message = document.getElementById("error-message");

Form.addEventListener("submit", (e) => {
  e.preventDefault();

  let errors = [];

  if (username && repeat_password) {
    errors = getSignupErrors();

    if (errors.length === 0) {
      let userData = {
        username: username.value,
        email: email.value,
        password: password.value,
      };
      localStorage.setItem("user", JSON.stringify(userData));
      alert("Signup successful!");
      window.location.href = "Login.html";
    }
  } else {
    errors = getLoginErrors();

    if (errors.length === 0) {
      let savedUser = JSON.parse(localStorage.getItem("user"));

      if (
        savedUser &&
        username.value === savedUser.username &&
        password.value === savedUser.password
      ) {
        alert("Login successful!");
        window.location.href = "index.html"; 
      } else {
        error_message.innerText = "Invalid credentials";
      }
    }
  }

  if (errors.length > 0) {
    error_message.innerText = errors.join(". ");
  }
});

function getSignupErrors() {
  let errors = [];

  if (username.value.trim() === "") errors.push("Username is required");
  if (email.value.trim() === "") errors.push("Email is required");
  if (!email.value.includes("@")) errors.push("Email must contain @");
  if (password.value.trim() === "") errors.push("Password is required");
  if (password.value.length < 8)
    errors.push("Password must be at least 8 characters");
  if (password.value !== repeat_password.value)
    errors.push("Passwords do not match");

  return errors;
}
function getLoginErrors() {
  let errors = [];

  if (username.value.trim() === "") errors.push("Username is required");
  if (password.value.trim() === "") errors.push("Password is required");

  return errors;
}
const allInputs = [username, email, password, repeat_password].filter(
  (input) => input
);

allInputs.forEach((input) => {
  input.addEventListener("input", () => {
    error_message.innerText = "";
  });
});
