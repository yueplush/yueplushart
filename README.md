# yueplushart
This repository contains the code for YuePlush's portfolio website. The site
uses simple HTML, CSS and JavaScript to present artwork samples, commission
information and links to social media.

When visitors select **Suggestive Art** they will first be asked to confirm
they are adults. After confirming, subcategories such as Bubbles, Balloons,
Pooltoy and Other become available. No suggestive artwork is shown until one of
these subcategories is chosen.

The gallery includes filter buttons for **ALL**, **SFW Art**, **Suggestive Art**,
**Commission Art**, **3D Model** and **OCs**. Items tagged as both
Commission and Suggestive stay hidden in the Commission and ALL views until the
adult confirmation checkbox has been enabled.

Currently the **Commission Art** section does not display any sample images.
Commission pieces will be categorized and added later.

Tapping an artwork opens it in a full screen view. Clicking or tapping the
full image again fades it out and closes the lightbox on desktop, tablets and
smartphones alike for consistent navigation across devices. The layout also
responds when a PC display is rotated vertically, covering common sizes like
720×1280, 1080×1920 and even 4K portrait mode.

## License

This project is released under the [MIT License](LICENSE).

## Robots file

The repository includes a `robots.txt` file that asks web crawlers not to
index or scrape image files and explicitly blocks a few known automated
agents. Deploy this file at the root of your domain so that it is reachable
at `https://<your-domain>/robots.txt`.

```
User-agent: *
Disallow: /*.jpg$
Disallow: /*.jpeg$
Disallow: /*.png$
Disallow: /*.gif$
Disallow: /*.webp$
Disallow: /*.svg$
```

## Advanced Anti-Scrape Logic

The JavaScript includes a bot detector that checks user agent strings,
plugin and MIME type presence, hardware concurrency, requestAnimationFrame
support and timezone information. Additional heuristics examine touch support
and `navigator.userAgentData` when available. Images are obfuscated using an XOR
cipher on top of Base64; the encoded data is split across several custom
attributes so it is harder to scrape directly from the markup. Images are
decoded only after two normal user interactions spaced slightly apart to catch
automated scripts. These small layers discourage automated scraping while
keeping the site seamless for normal visitors.

