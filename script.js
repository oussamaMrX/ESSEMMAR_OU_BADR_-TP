// script.js
// Attach this with: <script src="script.js" defer></script>

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.login-form');
  const nameInput = form.querySelector('#name');
  const ageInput = form.querySelector('#age');
  const passInput = form.querySelector('#password');
  const submitBtn = form.querySelector('button[type="submit"]');

  // Accessible area for status messages
  let liveRegion = document.querySelector('#live-region');
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'live-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-9999px';
    liveRegion.style.top = 'auto';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    document.body.appendChild(liveRegion);
  }

  // Helpers
  function clearFieldError(input) {
    input.classList.remove('input-error');
    const next = input.nextElementSibling;
    if (next && next.classList && next.classList.contains('error-msg')) next.remove();
  }

  function showFieldError(input, message) {
    clearFieldError(input);
    input.classList.add('input-error');
    const err = document.createElement('div');
    err.className = 'error-msg';
    err.textContent = message;
    err.setAttribute('role', 'alert');
    input.after(err);
  }

  function showStatus(message) {
    liveRegion.textContent = message;
  }

  function resetFormUI() {
    [nameInput, ageInput, passInput].forEach(clearFieldError);
    showStatus('');
  }

  // Very small client-side validation rules (demo)
  function validate() {
    let ok = true;
    resetFormUI();

    const name = nameInput.value.trim();
    const ageValue = ageInput.value;
    const age = Number(ageValue);
    const pass = passInput.value;

    if (!name) {
      showFieldError(nameInput, 'Please enter your name.');
      ok = false;
    } else if (name.length < 2) {
      showFieldError(nameInput, 'Name must be at least 2 characters.');
      ok = false;
    }

    if (!ageValue || isNaN(age) || age < 0) {
      showFieldError(ageInput, 'Please enter a valid age.');
      ok = false;
    } else if (age < 13) {
      showFieldError(ageInput, 'You must be at least 13 years old to sign up.');
      ok = false;
    }

    if (!pass || pass.length < 6) {
      showFieldError(passInput, 'Password must be at least 6 characters.');
      ok = false;
    }

    return ok;
  }

  // Simple demo "auth" using localStorage:
  // - If username exists and the password matches => sign in.
  // - If username doesn't exist => auto-register and sign in.
  // Note: This is client-side only and NOT secure. For real apps, use a server.
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate()) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Checking...';

    setTimeout(() => { // small delay to simulate processing
      const users = JSON.parse(localStorage.getItem('demo_users') || '{}');
      const key = nameInput.value.trim().toLowerCase();
      const age = Number(ageInput.value);
      const password = passInput.value;

      if (users[key] && users[key].password === password) {
        showResultCard(`Welcome back, ${users[key].displayName}!`);
        showStatus(`Signed in as ${users[key].displayName}`);
      } else if (!users[key]) {
        // register new user
        users[key] = { displayName: nameInput.value.trim(), age, password };
        localStorage.setItem('demo_users', JSON.stringify(users));
        showResultCard(`Account created — welcome, ${users[key].displayName}!`);
        showStatus(`Account created for ${users[key].displayName}`);
      } else {
        // username exists but wrong password
        showFieldError(passInput, 'Incorrect password. Try again.');
        showStatus('Sign-in failed: incorrect password.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign in';
      }
    }, 600);
  });

  function showResultCard(message) {
    const container = document.querySelector('.container');
    container.innerHTML = `
      <div class="result-card" role="status" aria-live="polite">
        <h2>Success</h2>
        <p class="result-message">${escapeHtml(message)}</p>
        <div style="display:flex;gap:8px;justify-content:center;margin-top:12px">
          <button id="signout-btn" class="btn">Sign out</button>
          <button id="back-btn" class="btn btn-ghost">Back to form</button>
        </div>
      </div>
    `;

    document.getElementById('signout-btn').addEventListener('click', () => {
      // clear inputs and return to login form
      localStorage.removeItem('demo_current_user');
      renderOriginalForm();
    });

    document.getElementById('back-btn').addEventListener('click', () => {
      renderOriginalForm();
    });
  }

  // Put the original HTML form back into the container (keeps CSS intact)
  function renderOriginalForm() {
    // Reload original fragment from the page or rebuild minimal form structure
    // We'll restore inputs and rewire the event listeners by reloading the page fragment.
    // For simplicity, just reload the page which preserves localStorage demo users.
    location.reload();
  }

  // Utility: escape text when injecting into HTML
  function escapeHtml(text) {
    return text
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  // initial cleanup
  resetFormUI();
});
