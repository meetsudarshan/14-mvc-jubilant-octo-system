// Function to handle logout
const handleLogout = async () => {
  // Send a POST request to the logout API endpoint
  const response = await fetch('/api/users/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  // Check if the response is successful
  if (response.ok) {
    // Redirect the user to the login page
    document.location.replace('/login');
  } else {
    // Display an error message if the logout request fails
    alert(response.statusText);
  }
};

// Attach the logout event listener to the logout button
document.querySelector('#logout').addEventListener('click', handleLogout);
