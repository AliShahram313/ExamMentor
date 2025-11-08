
const THEME_KEY   = "exammentor_theme";
const USERS_KEY   = "exammentor_users";
const CURRENT_KEY = "exammentor_current_user";
const SAVED_KEY   = "exammentor_saved_courses";

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

/* Theme + year */
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

/* Storage helpers */
function getUsers(){ try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch { return []; } }
function setUsers(list){ localStorage.setItem(USERS_KEY, JSON.stringify(list)); }
function getCurrent(){ try { return JSON.parse(localStorage.getItem(CURRENT_KEY)); } catch { return null; } }
function setCurrent(obj){ localStorage.setItem(CURRENT_KEY, JSON.stringify(obj)); }
function getSaved(){ try { return JSON.parse(localStorage.getItem(SAVED_KEY)) || []; } catch { return []; } }
function setSaved(arr){ localStorage.setItem(SAVED_KEY, JSON.stringify(arr)); }

/* Route guard */
const current = getCurrent();
if (!current) {

  location.replace("login.html");
}

/* Populate header */
function populateProfile(){
  const users = getUsers();
  const me = users.find(u => u.email.toLowerCase() === current.email.toLowerCase());
  const name = me?.name || current.name || "Student";
  const email = current.email;
  const phone = me?.phone || "";

  $("#pName").textContent = name;
  $("#pEmail").textContent = email;
  $("#pPhone").textContent = phone ? `Phone: ${phone}` : "";

  // Saved courses
  const saved = getSaved();
  $("#savedCount").textContent = saved.length;
  const list = $("#savedList");
  const empty = $("#savedEmpty");
  list.innerHTML = "";

  const courseMeta = {
    toefl: { title: "TOEFL Prep", href: "courses/toefl.html" },
    ielts: { title: "IELTS Prep", href: "courses/ielts.html" },
    sat:   { title: "SAT Prep",   href: "courses/sat.html" },
    act:   { title: "ACT Prep",   href: "courses/act.html" },
  };

  if (!saved.length) {
    empty.hidden = false;
  } else {
    empty.hidden = true;
    saved.forEach(id => {
      const meta = courseMeta[id] || { title: id.toUpperCase(), href: "courses/index.html" };
      const li = document.createElement("li");
      li.className = "saved-item";
      li.innerHTML = `
        <div class="title">${meta.title}</div>
        <div class="actions">
          <a class="btn small" href="${meta.href}">Open</a>
          <button class="btn small" data-remove="${id}">Remove</button>
        </div>
      `;
      list.appendChild(li);
    });
  }
}
populateProfile();

/* Remove saved course */
$("#savedList")?.addEventListener("click", (e)=>{
  const btn = e.target.closest("button[data-remove]");
  if (!btn) return;
  const id = btn.getAttribute("data-remove");
  const saved = new Set(getSaved());
  saved.delete(id);
  setSaved([...saved]);
  populateProfile();
});

/* Edit panel */
const editPanel = $("#editPanel");
$("#editBtn")?.addEventListener("click", () => {
  const users = getUsers();
  const me = users.find(u => u.email.toLowerCase() === current.email.toLowerCase());
  $("#name").value = me?.name || current.name || "";
  $("#phone").value = me?.phone || "";
  $("#nameErr").textContent = "";
  $("#phoneErr").textContent = "";
  $("#editMsg").textContent = "";
  editPanel.hidden = false;
});
$("#cancelEdit")?.addEventListener("click", () => { editPanel.hidden = true; });

function validPhone(v){ if (!v) return true; return /^\+?[0-9\s\-()]{7,18}$/.test(v.trim()); }

$("#editForm")?.addEventListener("submit", (e)=>{
  e.preventDefault();
  const name = $("#name").value.trim();
  const phone = $("#phone").value.trim();
  $("#nameErr").textContent = "";
  $("#phoneErr").textContent = "";
  $("#editMsg").textContent = "";

  let ok = true;
  if (name.length < 2) { $("#nameErr").textContent = "Please enter your full name."; ok = false; }
  if (!validPhone(phone)) { $("#phoneErr").textContent = "Please enter a valid phone."; ok = false; }
  if (!ok) return;

  const users = getUsers();
  const idx = users.findIndex(u => u.email.toLowerCase() === current.email.toLowerCase());
  if (idx >= 0) {
    users[idx].name = name;
    users[idx].phone = phone;
    setUsers(users);
  }
  setCurrent({ email: current.email, name }); 

  $("#editMsg").style.color = "green";
  $("#editMsg").textContent = "Profile updated.";
  populateProfile();
  setTimeout(()=> editPanel.hidden = true, 600);
});

/* Logout */
$("#logoutBtn")?.addEventListener("click", ()=>{
  localStorage.removeItem(CURRENT_KEY);
  location.href = "login.html";
});

/* Delete account (local only) */
$("#deleteBtn")?.addEventListener("click", ()=>{
  if (!confirm("Delete your account from this device? This cannot be undone.")) return;
  const users = getUsers().filter(u => u.email.toLowerCase() !== current.email.toLowerCase());
  setUsers(users);
  localStorage.removeItem(CURRENT_KEY);

  
  location.href = "signup.html";
});

/* Optional: navbar shadow */
(function navShadow(){
  const nav = document.querySelector(".navbar");
  const onScroll = () => nav && nav.classList.toggle("scrolled", window.scrollY > 12);
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
})();
