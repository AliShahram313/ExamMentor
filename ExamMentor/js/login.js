
const THEME_KEY = "exammentor_theme";
const USERS_KEY = "exammentor_users";           // array of {name,email,phone,hash}
const CURRENT_KEY = "exammentor_current_user";  // {email,name}

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

/* Theme */
function applyTheme(t){ document.documentElement.classList.toggle("dark", t==="dark"); }
function getTheme(){ return localStorage.getItem(THEME_KEY) || "light"; }
function setTheme(t){ localStorage.setItem(THEME_KEY, t); applyTheme(t); }
(function initTheme(){
  setTheme(getTheme());
  const btn = $("#themeToggle");
  if (btn) {
    btn.setAttribute("aria-pressed", String(getTheme()==="dark"));
    btn.addEventListener("click", ()=> {
      const next = getTheme()==="dark" ? "light":"dark";
      setTheme(next);
      btn.setAttribute("aria-pressed", String(next==="dark"));
    });
  }
  const y = $("#year"); if (y) y.textContent = new Date().getFullYear();
})();

/* Helpers */
const encode = (str) => new TextEncoder().encode(str);
async function sha256(text){
  const buf = await crypto.subtle.digest("SHA-256", encode(text));
  return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,"0")).join("");
}

function getUsers(){
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
  catch { return []; }
}
function findUser(email){
  return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
}

/* UI */
const form = $("#loginForm");
const emailEl = $("#email");
const passEl = $("#password");
const emailErr = $("#emailErr");
const passErr = $("#passwordErr");
const formMsg = $("#formMsg");
$("#pwToggle")?.addEventListener("click", ()=>{
  const t = passEl.getAttribute("type")==="password" ? "text" : "password";
  passEl.setAttribute("type", t);
});



function validEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }

form?.addEventListener("submit", async (e)=>{
  e.preventDefault();
  emailErr.textContent = "";
  passErr.textContent = "";
  formMsg.textContent = "";

  const email = emailEl.value.trim();
  const pw = passEl.value;

  let ok = true;
  if (!validEmail(email)) { emailErr.textContent = "Please enter a valid email."; ok = false; }
  if (pw.length < 8) { passErr.textContent = "Password must be at least 8 characters."; ok = false; }
  if (!ok) return;

  const user = findUser(email);
  if (!user) { formMsg.textContent = "Account not found. Please sign up."; formMsg.style.color = "#dc2626"; return; }

  const hash = await sha256(pw);
  if (hash !== user.hash) {
    formMsg.textContent = "Incorrect email or password."; formMsg.style.color = "#dc2626"; return;
  }



  localStorage.setItem(CURRENT_KEY, JSON.stringify({ email: user.email, name: user.name }));
  formMsg.textContent = "Logged in! Redirecting…"; formMsg.style.color = "green";


  if (!$("#remember")?.checked) {
    
  }

  setTimeout(()=> location.href = "profile.html", 650);
});
