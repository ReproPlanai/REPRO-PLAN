// Dev-only API test helper. Runs only in development via dynamic import from index.tsx.
// Placeholder to prevent build failures when the file is absent in production builds.
export const runApiTest = async () => {
  if (process.env.NODE_ENV !== 'development') return;
  console.info('[apiTest] Development placeholder loaded.');
};

// Auto-run when imported dynamically.
runApiTest().catch((err) => console.error('[apiTest] failed', err));

