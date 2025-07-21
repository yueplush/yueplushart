# yueplushart
This repository contains the code for YuePlush's portfolio website. The site
uses simple HTML, CSS and JavaScript to present artwork samples, commission
information and links to social media.

When visitors select **Suggestive Art** they will first be asked to confirm
they are adults. After confirming, subcategories such as Bubbles, Balloons,
Pooltoy and Other become available. No suggestive artwork is shown until one of
these subcategories is chosen.

Tapping an artwork opens it in a full screen view. Clicking or tapping the
full image again fades it out and closes the lightbox on desktop, tablets and
smartphones alike for consistent navigation across devices. The layout also
responds when a PC display is rotated vertically, covering common sizes like
720×1280, 1080×1920 and even 4K portrait mode.

## License

This project is released under the [MIT License](LICENSE).

## Robots file

The repository includes a `robots.txt` file that asks web crawlers not to
index or scrape image files. Deploy this file at the root of your domain so
that it is reachable at `https://<your-domain>/robots.txt`.

```
User-agent: *
Disallow: /*.jpg$
Disallow: /*.jpeg$
Disallow: /*.png$
Disallow: /*.gif$
Disallow: /*.webp$
Disallow: /*.svg$
```

