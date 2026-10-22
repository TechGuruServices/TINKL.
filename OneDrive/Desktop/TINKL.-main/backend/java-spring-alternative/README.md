# Java / Spring Boot alternative (NOT preferred)

LUCAS's standing rule: **use Cloudflare Workers whenever possible** — see
`../cloudflare/` for the primary backend.

These Spring Boot snippets exist only for environments where a Java backend is
mandatory (enterprise client, existing Spring infrastructure). They serve the
same PWA shell with production-correct MIME types and cache headers:

- `PwaStaticResourceConfig.java` — `@Configuration` registering static
  resource handlers: `no-cache` on `/sw.js`, `no-store` on HTML,
  1-hour on `/manifest.json`, 1-year immutable on `/css/**`, `/js/**`,
  `/assets/**`, plus the `.webmanifest` MIME mapping.
- `application-pwa.properties` — gzip compression config + notes on Brotli
  (pre-compressed `.br` via `build/build.sh`, served by reverse proxy/CDN).

To use: copy the built PWA into `src/main/resources/static/`, add both files,
deploy behind HTTPS.
