// Set the date we're counting down to
var countDownDate = new Date("May 12, 2025 00:00:00").getTime();

// Update the countdown every 1 second
var x = setInterval(function() {

  // Get today's date and time
  var now = new Date().getTime();

  // Find the distance between now and the count down date
  var distance = countDownDate - now;

  // Time calculations for days, hours, minutes and seconds
  var days = Math.floor(distance / (1000 * 60 * 60 * 24));
  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);

  // Display the result in the element with id="countdown"
  document.getElementById("days").innerText = days;
  document.getElementById("hours").innerText = hours;
  document.getElementById("minutes").innerText = minutes;
  document.getElementById("seconds").innerText = seconds;

  // If the count down is finished, write some text
  if (distance < 0) {
    clearInterval(x);
    document.getElementById("countdown").innerHTML = "";
    document.getElementById("greetingsButton").style.display = "block";
  }
}, 1000);

// Modal functionality
const modal = document.getElementById("birthdayModal");
const btn = document.getElementById("greetingsButton");
const closeBtn = document.querySelector(".close-button");
const fireworks = document.querySelector(".pyro");

// Open modal when button is clicked
btn.addEventListener("click", function() {
  modal.style.display = "block";
  // Display fireworks animation
  fireworks.style.display = "block";
});

// Close modal when X is clicked
closeBtn.addEventListener("click", function() {
  modal.style.display = "none";
  // Hide fireworks animation
  fireworks.style.display = "none";
});

// Close modal when clicking outside the modal content
window.addEventListener("click", function(event) {
  if (event.target === modal) {
    modal.style.display = "none";
    // Hide fireworks animation
    fireworks.style.display = "none";
  }
});