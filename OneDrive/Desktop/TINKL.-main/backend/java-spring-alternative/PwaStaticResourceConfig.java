package us.techguruofficial.tinkl.config;

import java.util.concurrent.TimeUnit;
import org.springframework.boot.web.server.MimeMappings;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.boot.web.servlet.server.ConfigurableServletWebServerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Serves the TINKL. PWA shell from {@code src/main/resources/static/} with
 * production-correct MIME types and cache headers.
 *
 * <p>Assumptions: Spring Boot 3.x, static PWA files copied to
 * {@code src/main/resources/static/} preserving their relative paths
 * ({@code /index.html}, {@code /sw.js}, {@code /manifest.json},
 * {@code /offline.html}, {@code /css/**}, {@code /js/**}, {@code /assets/**}).
 * No template engine involved — the PWA is 100% static; the Java side only
 * serves bytes with the right headers (and can host /api/** REST endpoints).
 *
 * <p><b>Critical PWA rule:</b> deploy the app at the domain root (or set the
 * manifest {@code scope}/{@code start_url} and the {@code <base>} tag to match
 * your context path). A service worker registered at {@code /app/sw.js} can
 * only control {@code /app/**} — shortcuts, push and the offline fallback
 * all assume scope {@code /} unless you change them together.
 */
@Configuration
public class PwaStaticResourceConfig implements WebMvcConfigurer {

  /**
   * Register handlers MOST-SPECIFIC FIRST — Spring uses the first matching
   * handler, so the no-cache rules for the SW and HTML must be registered
   * before the long-lived asset rule.
   */
  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {

    // 1) Service worker — MUST revalidate on every navigation.
    //    The browser checks for SW updates by byte-comparing a fresh fetch
    //    against the installed worker (every 24h max, and on each page load
    //    when the page calls registration.update()). ANY max-age caching
    //    here silently freezes users on stale app code.
    //    Cache-Control: no-cache  =>  "revalidate, 304 allowed".
    registry
        .addResourceHandler("/sw.js")
        .addResourceLocations("classpath:/static/sw.js")
        .setCacheControl(CacheControl.noCache());

    // 2) App shell HTML + offline fallback — never cache.
    //    The SW keeps its own cached copy; the network copy must always be
    //    fresh so a deploy is one refresh away.
    registry
        .addResourceHandler("/index.html", "/offline.html", "/")
        .addResourceLocations("classpath:/static/index.html")
        .setCacheControl(CacheControl.noStore());

    // 3) Web app manifest — short public cache. Icon/shortcut changes
    //    should propagate within the hour, not the month.
    registry
        .addResourceHandler("/manifest.json")
        .addResourceLocations("classpath:/static/manifest.json")
        .setCacheControl(CacheControl.maxAge(1, TimeUnit.HOURS).cachePublic());

    // 4) Everything else (CSS/JS/icons/fonts) — immutable for 1 year.
    //    The service worker versions these via CACHE_VERSION, and any
    //    filename-hashed build output is safe to cache aggressively.
    //    (If you do NOT fingerprint filenames, drop this to a few hours.)
    registry
        .addResourceHandler("/css/**", "/js/**", "/assets/**")
        .addResourceLocations(
            "classpath:/static/css/",
            "classpath:/static/js/",
            "classpath:/static/assets/")
        .setCacheControl(
            CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic().immutable());
  }

  /**
   * MIME types the servlet container does not map by default.
   * (.js -> application/javascript and .json -> application/json are already
   * correct in Spring Boot 3; .webmanifest is NOT mapped and would otherwise
   * be served as application/octet-stream, which fails manifest parsing in
   * some browsers.)
   */
  @Bean
  public WebServerFactoryCustomizer<ConfigurableServletWebServerFactory> mimeMappingsCustomizer() {
    return factory -> {
      MimeMappings mappings = new MimeMappings(MimeMappings.DEFAULT);
      mappings.add("webmanifest", "application/manifest+json");
      factory.setMimeMappings(mappings);
    };
  }
}
