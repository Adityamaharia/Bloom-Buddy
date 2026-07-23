window.addEventListener("load", () => {
  const msg = document.querySelector(".welcome-msg");

  if (!msg) return;

  // show animation
  setTimeout(() => {
    msg.classList.add("show");
  }, 200);

  // fade out
  setTimeout(() => {
    msg.classList.add("fade-out");
  }, 1800);

  // redirect
  setTimeout(() => {
    sessionStorage.setItem("visited", "true");
    window.location.href = "login.html";
  }, 2400);
});