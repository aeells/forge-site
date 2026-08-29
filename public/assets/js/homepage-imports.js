import "common/aos";
import "site/menu";

function loadDeferred() {
  import("common/lazy");
  import("common/railsSetup");
  import("common_controllers");
  import("common/site_settings_bootstrap");
  import("common/site_settings_panel");
}

if (document.readyState === "complete") {
  loadDeferred();
} else {
  window.addEventListener("load", loadDeferred, { once: true });
}
