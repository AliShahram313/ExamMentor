
document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("themeToggle");
  const html = document.documentElement;
  const year = document.getElementById("year");

  if (year) year.textContent = new Date().getFullYear();
  if (localStorage.getItem("exammentor_theme") === "dark") html.classList.add("dark");

  themeToggle?.addEventListener("click", () => {
    html.classList.toggle("dark");
    localStorage.setItem("exammentor_theme", html.classList.contains("dark") ? "dark" : "light");
  });
});
