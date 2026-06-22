const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf8');
if (!code.includes('const demo = document.getElementById("workflowDemo");')) {
  const injection = \
    // 6. Workflow Demo
    const demo = document.getElementById("workflowDemo");
    if (demo) {
      demo.innerHTML = \\\
        <div class="container">
          <div class="section-header animate-fade-up">
            <h2 class="text-gradient">Workflow Demo</h2>
            <p>See our automated systems in action.</p>
          </div>
          <div style="background: var(--surface); padding: 4rem 2rem; border-radius: 24px; border: 1px solid var(--line); text-align: center;" class="animate-fade-up delay-100">
            <p style="color: var(--text-secondary); font-size: 1.25rem;">Interactive demo coming soon.</p>
            <a href="/contact" class="btn btn-primary" style="margin-top: 1.5rem;">Request a live demo</a>
          </div>
        </div>
      \\\;
    }
  \;
  code = code.replace('const caseStudySec = document.getElementById("caseStudySection");', injection + '\\n    const caseStudySec = document.getElementById("caseStudySection");');
  fs.writeFileSync('script.js', code);
  console.log('Injected workflowDemo');
}
