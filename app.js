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
    const isLoggedIn = sessionStorage.getItem("loggedIn") === "true";
    if (
      typeof DataManager !== "undefined" &&
      isLoggedIn &&
      DataManager.getUser()
    ) {
      window.location.href = "dashboard.html";
    } else {
      window.location.href = "login.html";
    }
  }, 2400);
});
