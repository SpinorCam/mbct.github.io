# MBCT Trainee Hub

This repository hosts the static site for the MBCT Trainee Hub. The landing page features a neuron-inspired hero, curated sections for bios, lectures, interviews, applications, and resources, and an interactive D3.js visualization that helps visitors explore the content.

## Local development

Because the site is entirely static, you can preview it locally with any static file server. One quick option is to use Python:

```bash
python3 -m http.server 1313
```

Then open [http://localhost:1313](http://localhost:1313) in your browser. The `index.html` file pulls assets from the `css/` and `js/` directories, so the visualization and styling will work without a build step.

## Publishing with GitHub Pages

This repository is configured to publish automatically to GitHub Pages whenever changes land on the `main` branch. The workflow defined in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) uploads the current contents of the repository and deploys them to the GitHub Pages infrastructure.

To enable publishing:

1. Navigate to **Settings → Pages** for this repository.
2. Choose **GitHub Actions** as the build and deployment source.
3. Save the settings and verify that the "Deploy static site" workflow completes successfully.

After the workflow finishes, the live site will be available at `https://<your-account>.github.io/`.

## Updating content

* Edit `index.html` to adjust the homepage structure and copy.
* Update `css/mbct.css` to tweak styling, colors, and responsive behavior.
* Modify `js/neuron-network.js` to customize the interactive force-directed network.
* Keep the JSON and XML feeds in sync if you change metadata or add new sections.

Feel free to open issues or pull requests to propose new features for the trainee community.
