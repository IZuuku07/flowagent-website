const fs = require('fs');

let script = fs.readFileSync('script.js', 'utf8');

const formInjector = \
  const contactForm = document.getElementById("contactForm");
  if (contactForm && !contactForm.innerHTML.trim()) {
    contactForm.innerHTML = \\\
      <h3>Send a Message</h3>
      <div style="margin-bottom: 1rem;">
        <label style="display:block;margin-bottom:0.5rem;font-size:0.9rem;font-weight:500;">Name</label>
        <input type="text" name="name" required style="width:100%;padding:0.75rem;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--text);">
      </div>
      <div style="margin-bottom: 1rem;">
        <label style="display:block;margin-bottom:0.5rem;font-size:0.9rem;font-weight:500;">Email</label>
        <input type="email" name="email" required style="width:100%;padding:0.75rem;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--text);">
      </div>
      <div style="margin-bottom: 1rem;">
        <label style="display:block;margin-bottom:0.5rem;font-size:0.9rem;font-weight:500;">Message</label>
        <textarea name="message" required rows="5" style="width:100%;padding:0.75rem;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--text);"></textarea>
      </div>
      <button type="submit" class="btn btn-primary" style="width: 100%;">Send Message</button>
      <div id="contactStatus" style="margin-top: 1rem; text-align: center; color: var(--primary); display: none; padding: 1rem; background: rgba(59,130,246,0.1); border-radius: 8px;">
        Message sent successfully! We will reach out soon.
      </div>
    \\\;
  }

  const bookingForm = document.getElementById("bookingForm");
  if (bookingForm && !bookingForm.innerHTML.trim()) {
    bookingForm.innerHTML = \\\
      <h3>Book a Call</h3>
      <div style="margin-bottom: 1rem;">
        <label style="display:block;margin-bottom:0.5rem;font-size:0.9rem;font-weight:500;">Name</label>
        <input type="text" name="name" required style="width:100%;padding:0.75rem;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--text);">
      </div>
      <div style="margin-bottom: 1rem;">
        <label style="display:block;margin-bottom:0.5rem;font-size:0.9rem;font-weight:500;">Email</label>
        <input type="email" name="email" required style="width:100%;padding:0.75rem;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--text);">
      </div>
      <div style="margin-bottom: 1rem;">
        <label style="display:block;margin-bottom:0.5rem;font-size:0.9rem;font-weight:500;">Company</label>
        <input type="text" name="company" required style="width:100%;padding:0.75rem;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--text);">
      </div>
      <button type="submit" class="btn btn-primary" style="width: 100%;">Request Booking</button>
      <div id="bookingStatus" style="margin-top: 1rem; text-align: center; color: var(--primary); display: none; padding: 1rem; background: rgba(59,130,246,0.1); border-radius: 8px;">
        Booking requested successfully! We will reach out soon.
      </div>
    \\\;
  }
\;

if (!script.includes('const contactForm = document.getElementById("contactForm");')) {
  script = script.replace('document.addEventListener("DOMContentLoaded", () => {', 'document.addEventListener("DOMContentLoaded", () => {\\n' + formInjector);
  fs.writeFileSync('script.js', script);
  fs.writeFileSync('../GITHUB_UPLOAD_READY/script.js', script);
  console.log('Injected forms into script.js');
} else {
  console.log('Forms already injected');
}
