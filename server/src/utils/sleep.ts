// sleep function for testing with artificial delay, to demo how loading with ssr works
const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

// async ... await sleep(3000);
