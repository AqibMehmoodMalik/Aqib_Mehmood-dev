# Aqib Mehmood | Portfolio

Static, dependency-free portfolio (HTML + CSS + vanilla JS). No build step.

The portfolio includes a responsive developer-workspace project explorer, GitHub and Instagram links, and a floating browser-based assistant. The assistant can jump to relevant case studies and offer interview scheduling through WhatsApp.

## Structure
```
index.html
css/style.css
js/main.js
assets/
  profile.jpg
  Aqib_Mehmood_AI_ML_Engineer_CV_2k26.pdf
  favicon.svg
  profile-fallback.svg                     (shown until profile.jpg exists)
```

## Live site
The site is deployed at https://aqibmehmoodmalik.github.io/Aqib_Mehmood-dev/.

The contact form currently falls back to opening the visitor's email client. To enable direct form submissions, create a form at https://formspree.io and replace `YOUR_FORM_ID` in the form `action`.

## Run locally
```
python -m http.server 8000
# open http://localhost:8000
```

## Deploy
Pushes to the `main` branch deploy automatically to GitHub Pages using `.github/workflows/deploy-pages.yml`.
