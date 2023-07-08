// Function to create a new comment
const createComment = async (event) => {
  event.preventDefault();

  // Get the comment input value and trim any leading/trailing whitespace
  const commentInput = document.querySelector('#post2').value.trim();
  
  // Extract the post ID from the URL
  const postID = window.location.pathname.split('/').pop();
  
  if (commentInput) {
    // Send a POST request to the comments API endpoint
    const response = await fetch(`/api/comments/${postID}`, {
      method: 'POST',
      body: JSON.stringify({ comment: commentInput }),
      headers: { 'Content-Type': 'application/json' },
    });
    
    // Check if the comment was successfully created
    if (response.ok) {
      // Show a success toast notification
      $("#suc1").toast("show");
      
      // Redirect the user to the comments page for the specific post
      setTimeout(function () {
        document.location.replace(`/comments/${postID}`);
      }, 1200);
    } else {
      // Show an error toast notification and log the error
      $("#err2").toast("show");
      console.log(response.statusText);
    }
  } else {
    // Show an error toast notification if the comment input is empty
    $("#err1").toast("show");
  }
};

// Add a submit event listener to the comment form
document.querySelector('.comment-form').addEventListener('submit', createComment);
