
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Theme (Light/Dark) 
const THEME_KEY = "exammentor_theme";
function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }


}
function getStoredTheme() {
  return localStorage.getItem(THEME_KEY) || "light";
}
function toggleTheme() {
  const current = getStoredTheme();
  const next = current === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
 

  const btn = $("#themeToggle");
  if (btn) btn.setAttribute("aria-pressed", String(next === "dark"));
}

(function initTheme() {
  applyTheme(getStoredTheme());
  const btn = $("#themeToggle");
  if (btn) {
    btn.setAttribute("aria-pressed", String(getStoredTheme() === "dark"));
    btn.addEventListener("click", toggleTheme);
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleTheme(); }
    });
  }
})();


(function setYear() {
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();
})();



const STORAGE_SAVED_KEY = "exammentor_saved_courses";   
const STORAGE_LAST_QUERY = "exammentor_last_query";
const STORAGE_LAST_FILTERS = "exammentor_last_filters"; 

function getSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_SAVED_KEY)) || []; }
  catch { return []; }
}
function setSaved(arr) {
  localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(arr));
}

function renderState() {
  const query = ($("#searchInput")?.value || "").trim().toLowerCase();
  const activeExams = $$("#filterForm input[name='exam']:checked").map(i => i.value);

  localStorage.setItem(STORAGE_LAST_QUERY, query);
  localStorage.setItem(STORAGE_LAST_FILTERS, JSON.stringify(activeExams));

  const cards = $$("#cards .card[role='listitem']");
  let visibleCount = 0;

  cards.forEach(card => {
    const exam = card.getAttribute("data-exam");
    const tags = (card.getAttribute("data-tags") || "").toLowerCase();

   
    const examMatch = activeExams.includes(exam);

  
    const title = $("h3", card)?.textContent?.toLowerCase() || "";
    const qMatch = !query || title.includes(query) || tags.includes(query);

    const show = examMatch && qMatch;
    card.style.display = show ? "" : "none";
    if (show) visibleCount++;
  });

  const empty = $("#emptyState");
  if (empty) empty.hidden = visibleCount !== 0;
}

function restoreFilterUI() {
  const q = localStorage.getItem(STORAGE_LAST_QUERY);
  if (q && $("#searchInput")) $("#searchInput").value = q;

  try {
    const arr = JSON.parse(localStorage.getItem(STORAGE_LAST_FILTERS) || "[]");
    if (Array.isArray(arr) && arr.length) {
      $$("#filterForm input[name='exam']").forEach(cb => cb.checked = arr.includes(cb.value));
    }
  } catch {}
}

(function initFilters() {
  restoreFilterUI();
  renderState();

  const input = $("#searchInput");
  if (input) input.addEventListener("input", renderState);

  $$("#filterForm input[name='exam']").forEach(cb => {
    cb.addEventListener("change", renderState);
  });

  const clear = $("#clearFilters");
  if (clear) {
    clear.addEventListener("click", (e) => {
      
      const search = $("#searchInput");
      if (search) search.value = "";
      $$("#filterForm input[name='exam']").forEach(cb => cb.checked = true);
      
      setTimeout(renderState, 0);
    });
  }
})();


async function loadBooks() {
  const booksGrid = document.getElementById("booksGrid");
  if (!booksGrid) return;

  const query = "TOEFL OR IELTS OR SAT OR ACT preparation";
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=8`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      booksGrid.innerHTML = "<p>No books found.</p>";
      return;
    }

    booksGrid.innerHTML = data.items.map(book => {
      const info = book.volumeInfo;
      const title = info.title || "Untitled";
      const authors = info.authors ? info.authors.join(", ") : "Unknown Author";
      const img = info.imageLinks?.thumbnail || "images/default-book.png";

    
      const link = `https://books.google.com/books?id=${book.id}`;

      return `
        <article class="book-card">
          <img src="${img}" alt="${title}">
          <h3>${title}</h3>
          <p>${authors}</p>
          <a href="${link}" target="_blank" rel="noopener">View Book</a>
        </article>
      `;
    }).join("");
  } catch (err) {
    console.error("Error loading books:", err);
    booksGrid.innerHTML = "<p>Unable to load books right now.</p>";
  }
}

loadBooks();



(function initSaveButtons() {
  const saved = new Set(getSaved());

  $$(".save-btn").forEach(btn => {
    const id = btn.getAttribute("data-id");
    const updateText = () => {
      btn.textContent = saved.has(id) ? "Saved ✓" : "Save";
    };
    updateText();

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (saved.has(id)) saved.delete(id); else saved.add(id);
      setSaved(Array.from(saved));
      updateText();

      
      btn.animate([{ transform: "scale(1)" }, { transform: "scale(1.06)" }, { transform: "scale(1)" }], { duration: 160 });
    });
  });

  (function(){
    const nav = document.querySelector('.navbar');
    if (!nav) return;
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  })();


})();
