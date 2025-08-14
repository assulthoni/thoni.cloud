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

// Photo slideshow functionality
const photos = [
    '/static/icha/icha-photo.png',
    '/static/icha/1.jpeg',
    '/static/icha/2.jpeg',
    '/static/icha/3.jpeg',
    '/static/icha/6.jpeg',
    '/static/icha/8.jpeg',
    '/static/icha/10.jpeg',
    '/static/icha/11.jpeg',
    '/static/icha/13.jpeg',
    '/static/icha/14.jpeg',
    '/static/icha/15.jpeg',
    '/static/icha/16.jpeg',
    '/static/icha/17.jpeg',
    '/static/icha/19.jpeg',
    '/static/icha/20.jpeg',
    '/static/icha/21.jpeg',
    '/static/icha/22.jpeg',
    '/static/icha/23.jpeg',
    '/static/icha/24.jpeg',
    '/static/icha/25.jpeg'
];

let currentPhotoIndex = 0;
let slideInterval;

function showPhoto(index) {
    const img = document.getElementById('birthday-img');
    const dots = document.querySelectorAll('.dot');
    
    // Update image
    img.src = photos[index];
    img.classList.add('active');
    
    // Update dots
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

function nextSlide() {
    currentPhotoIndex = (currentPhotoIndex + 1) % photos.length;
    showPhoto(currentPhotoIndex);
}

function prevSlide() {
    currentPhotoIndex = (currentPhotoIndex - 1 + photos.length) % photos.length;
    showPhoto(currentPhotoIndex);
}

function startSlideshow() {
    if (slideInterval) clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 5000);
}

// Touch events for mobile swipe
let touchStartX = 0;
let touchEndX = 0;

function handleTouchStart(event) {
    touchStartX = event.touches[0].clientX;
}

function handleTouchEnd(event) {
    touchEndX = event.changedTouches[0].clientX;
    handleSwipe();
}

function handleSwipe() {
    const swipeThreshold = 50;
    const swipeDistance = touchEndX - touchStartX;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0) {
            prevSlide();
        } else {
            nextSlide();
        }
    }
}

// Initialize slideshow when modal opens
function initializeSlideshow() {
    const dotsContainer = document.getElementById('dots');
    
    // Create dots
    photos.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        dot.addEventListener('click', () => {
            currentPhotoIndex = index;
            showPhoto(currentPhotoIndex);
        });
        dotsContainer.appendChild(dot);
    });
    
    // Show first photo and start slideshow
    showPhoto(currentPhotoIndex);
    startSlideshow();
    
    // Add touch events
    const slideshow = document.querySelector('.slideshow-container');
    slideshow.addEventListener('touchstart', handleTouchStart);
    slideshow.addEventListener('touchend', handleTouchEnd);
}

// Birthday messages array
const birthdayMessages = [
    "Wishing you a wonderful day filled with happiness and all the things that bring you joy!",
    "May your birthday be as special as you are!",
    "May your dreams come true!",
    "May your love be as strong as you are!",
    "May your life be filled with laughter and joy!",
    "May your birthday be as memorable as you are!",
    "May your birthday be as beautiful as you are!",
    "May your birthday be as special as you are!",
    "May your birthday be as wonderful as you are!"
];

// Function to display random message
function displayRandomMessage() {
    const messageElement = document.getElementById("rotating-message");
    const randomIndex = Math.floor(Math.random() * birthdayMessages.length);
    messageElement.textContent = birthdayMessages[randomIndex];
}

// Start rotating messages when modal is shown
let messageInterval;

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
  // Start rotating messages
  displayRandomMessage();
  messageInterval = setInterval(displayRandomMessage, 2000);
  // Initialize slideshow
  initializeSlideshow();
  // Play birthday music
  var music = document.getElementById("birthdayMusic");
  if (music) {
    music.currentTime = 0;
    music.play();
  }
});

// Close modal when X is clicked
closeBtn.addEventListener("click", function() {
  modal.style.display = "none";
  // Hide fireworks animation
  fireworks.style.display = "none";
  // Stop rotating messages and slideshow
  clearInterval(messageInterval);
  clearInterval(slideInterval);
  // Stop birthday music
  var music = document.getElementById("birthdayMusic");
  if (music) {
    music.pause();
    music.currentTime = 0;
  }
});

// Close modal when clicking outside the modal content
window.addEventListener("click", function(event) {
  if (event.target === modal) {
    modal.style.display = "none";
    // Hide fireworks animation
    fireworks.style.display = "none";
    // Stop rotating messages and slideshow
    clearInterval(messageInterval);
    clearInterval(slideInterval);
    // Stop birthday music
    var music = document.getElementById("birthdayMusic");
    if (music) {
      music.pause();
      music.currentTime = 0;
    }
  }
});