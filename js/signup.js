
const THEME_KEY = "exammentor_theme";
const USERS_KEY = "exammentor_users";
const CURRENT_KEY = "exammentor_current_user";

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
function setUsers(list){ localStorage.setItem(USERS_KEY, JSON.stringify(list)); }
function emailExists(email){ return getUsers().some(u => u.email.toLowerCase() === email.toLowerCase()); }

/* Elements */
const form = $("#signupForm");
const nameEl = $("#name");
const emailEl = $("#email");
const phoneEl = $("#phone");
const passEl = $("#password");
const confEl = $("#confirm");
const tncEl = $("#tnc");

const nameErr = $("#nameErr");
const emailErr = $("#emailErr");
const phoneErr = $("#phoneErr");
const passwordErr = $("#passwordErr");
const confirmErr = $("#confirmErr");
const tncErr = $("#tncErr");
const formMsg = $("#formMsg");

$("#pwToggle1")?.addEventListener("click", ()=>{
  passEl.type = passEl.type === "password" ? "text" : "password";
});
$("#pwToggle2")?.addEventListener("click", ()=>{
  confEl.type = confEl.type === "password" ? "text" : "password";
});

/* Validation Rules */
function validEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }
function validPhone(v){
  if (!v) return true; 
  return /^\+?[0-9\s\-()]{7,18}$/.test(v.trim());
}
function validPassword(v){
 
  return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-={}[\]|:;"'<>,.?/~`]{8,}$/.test(v);
}

/* Submit */
form?.addEventListener("submit", async (e)=>{
  e.preventDefault();
  // reset errors
  [nameErr,emailErr,phoneErr,passwordErr,confirmErr,tncErr,formMsg].forEach(el => el.textContent = "");

  const name = nameEl.value.trim();
  const email = emailEl.value.trim();
  const phone = phoneEl.value.trim();
  const pw = passEl.value;
  const conf = confEl.value;

  let ok = true;
  if (name.length < 2) { nameErr.textContent = "Please enter your full name."; ok = false; }
  if (!validEmail(email)) { emailErr.textContent = "Please enter a valid email."; ok = false; }
  if (!validPhone(phone)) { phoneErr.textContent = "Please enter a valid phone (e.g., +1 555 123 4567)."; ok = false; }
  if (!validPassword(pw)) { passwordErr.textContent = "Use 8+ chars with letters and numbers."; ok = false; }
  if (conf !== pw) { confirmErr.textContent = "Passwords do not match."; ok = false; }
  if (!tncEl.checked) { tncErr.textContent = "Please accept Terms & Privacy."; ok = false; }
  if (!ok) return;

  if (emailExists(email)) {
    emailErr.textContent = "An account with this email already exists.";
    return;
  }

  const hash = await sha256(pw);
  const users = getUsers();
  users.push({ name, email, phone, hash });
  setUsers(users);

  localStorage.setItem(CURRENT_KEY, JSON.stringify({ email, name }));
  formMsg.style.color = "green";
  formMsg.textContent = "Account created! Redirecting…";
  setTimeout(()=> location.href = "profile.html", 700);
});
