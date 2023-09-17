const Bugsnag = (async () => {
  const Bugsnag = (await import("@bugsnag/js")).default;
  const BugsnagPluginReact = (await import("@bugsnag/plugin-react")).default;

  const urlParams = new URLSearchParams(window.location.search);
  const shop = urlParams.get("shop");

  Bugsnag.start({
    appVersion: process.env.npm_package_version,
    apiKey: import.meta.env.VITE_BS_TOKEN,
    plugins: [new BugsnagPluginReact()],
    enabledReleaseStages: ["production"],
    user: {
      id: shop,
      name: shop,
    },
    logger: null,
    releaseStage: import.meta.env.DEV ? "development" : "production",
  });

  return Bugsnag;
})();

export default Bugsnag;
