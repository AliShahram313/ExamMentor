
const THEME_KEY = "exammentor_theme";
const MESSAGES_KEY = "exammentor_messages";

const $ = (s, r = document) => r.querySelector(s);

/* Theme */
function applyTheme(t){ document.documentElement.classList.toggle("dark", t==="dark"); }
function getTheme(){ return localStorage.getItem(THEME_KEY) || "light"; }
function setTheme(t){ localStorage.setItem(THEME_KEY, t); applyTheme(t); }

(function initTheme(){
  setTheme(getTheme());
  const btn = $("#themeToggle");
  if (btn) {
    btn.setAttribute("aria-pressed", String(getTheme()==="dark"));
    btn.addEventListener("click", ()=>{
      const next = getTheme()==="dark" ? "light" : "dark";
      setTheme(next);
      btn.setAttribute("aria-pressed", String(next==="dark"));
    });
  }
  const y = $("#year"); if (y) y.textContent = new Date().getFullYear();
})();

/* Validation helpers */
function validEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }

function getMessages(){
  try { return JSON.parse(localStorage.getItem(MESSAGES_KEY)) || []; }
  catch { return []; }
}
function saveMessage(obj){
  const msgs = getMessages();
  msgs.push(obj);
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(msgs));
}

/* Form handling */
const form = $("#contactForm");
const nameEl = $("#name");
const emailEl = $("#email");
const subjectEl = $("#subject");
const msgEl = $("#message");

form?.addEventListener("submit", (e)=>{
  e.preventDefault();
  $("#nameErr").textContent = "";
  $("#emailErr").textContent = "";
  $("#subjectErr").textContent = "";
  $("#messageErr").textContent = "";
  $("#formMsg").textContent = "";

  const name = nameEl.value.trim();
  const email = emailEl.value.trim();
  const subject = subjectEl.value.trim();
  const message = msgEl.value.trim();

  let ok = true;
  if (name.length < 2){ $("#nameErr").textContent = "Please enter your full name."; ok = false; }
  if (!validEmail(email)){ $("#emailErr").textContent = "Please enter a valid email."; ok = false; }
  if (subject.length < 3){ $("#subjectErr").textContent = "Subject too short."; ok = false; }
  if (message.length < 10){ $("#messageErr").textContent = "Message must be at least 10 characters."; ok = false; }
  if (!ok) return;


  saveMessage({ name, email, subject, message, date: new Date().toISOString() });

  $("#formMsg").style.color = "green";
  $("#formMsg").textContent = "Your message was sent successfully!";
  form.reset();

  setTimeout(()=> $("#formMsg").textContent = "", 3000);
});
