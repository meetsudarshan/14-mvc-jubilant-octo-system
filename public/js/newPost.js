// Function to create a new post
const createPost = async (event) => {
    event.preventDefault();
  
    // Get the title and content input values and trim any leading/trailing whitespace
    const titleInput = document.querySelector('#post1').value.trim();
    const contentInput = document.querySelector('#post2').value.trim();
  
    if (titleInput && contentInput) {
      // Send a POST request to the posts API endpoint
      const response = await fetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify({ title: titleInput, content: contentInput }),
        headers: { 'Content-Type': 'application/json' },
      });
  
      // Check if the post was successfully created
      if (response.ok) {
        // Show a success toast notification
        $("#suc1").toast("show");
  
        // Redirect the user to the dashboard page
        setTimeout(function () {
          document.location.replace(`/dashboard`);
        }, 1200);
      } else {
        // Show an error toast notification and log the error
        $("#err2").toast("show");
        console.log(response.statusText);
      }
    } else {
      // Show an error toast notification if the title or content inputs are empty
      $("#err1").toast("show");
    }
  };
  
  // Add a submit event listener to the post form
  document.querySelector('.post-form').addEventListener('submit', createPost);
  