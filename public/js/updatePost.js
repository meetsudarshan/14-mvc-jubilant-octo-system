// Function to handle post deletion
const deletePost = async (event) => {
    event.preventDefault();
  
    // Get the post ID from the URL
    const post_id = window.location.pathname.split("/").pop();
  
    try {
      // Send a DELETE request to the posts API endpoint to delete the post
      const response = await fetch(`/api/posts/${post_id}`, {
        method: 'DELETE',
      });
  
      // Check if the post was successfully deleted
      if (response.ok) {
        // Show a success toast notification
        $("#suc3").toast("show");
  
        // Redirect the user to the dashboard after a slight delay
        setTimeout(function () {
          document.location.replace(`/dashboard`);
        }, 1200);
      } else {
        // Show an error toast notification if failed to delete the post
        $("#err3").toast("show");
        console.log(response.statusText);
      }
    } catch (error) {
      console.log(err);
    }
  };
  
  // Function to handle post update
  const updatePost = async (event) => {
    event.preventDefault();
  
    // Get the updated title and content inputs
    const title = document.querySelector('#post1').value.trim();
    const content = document.querySelector('#post2').value.trim();
  
    // Get the post ID from the URL
    const post_id = window.location.pathname.split("/").pop();
  
    if (title && content) {
      // Send a PUT request to the posts API endpoint to update the post
      const response = await fetch(`/api/posts/${post_id}`, {
        method: 'PUT',
        body: JSON.stringify({ title, content }),
        headers: { 'Content-Type': 'application/json' },
      });
  
      // Check if the post was successfully updated
      if (response.ok) {
        // Show a success toast notification
        $("#suc1").toast("show");
  
        // Redirect the user to the dashboard after a slight delay
        setTimeout(function () {
          document.location.replace(`/dashboard`);
        }, 1200);
      } else {
        // Show an error toast notification if failed to update the post
        $("#err2").toast("show");
        console.log(response.statusText);
      }
    } else {
      // Show an error toast notification if the title or content is empty
      $("#err1").toast("show");
    }
  };
  
  // Add a click event listener to the update button
  document.querySelector('.update-btn').addEventListener('click', updatePost);
  
  // Add a click event listener to the delete button
  document.querySelector('.delete-btn').addEventListener('click', deletePost);
  