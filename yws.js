(function (global) {
  /**
   * Function to block risky IPs with client-side rate limiting.
   * @param {object} options - Configuration options.
   * @param {number} [options.riskThreshold=70] - The risk score threshold to trigger blocking.
   * @param {number} [options.maxRequests=100] - Maximum number of requests allowed within the window.
   * @param {number} [options.windowMs=15 * 60 * 1000] - Time window in milliseconds for rate limiting.
   * @param {string} [options.ip=null] - Optional: If provided, uses the passed IP instead of auto-detecting it.
   * @param {string} [options.forbiddenPage='/403.html'] - URL of the custom 403 page.
   */
  function yourwebshield({
    riskThreshold = 70,
    maxRequests = 100,
    windowMs = 15 * 60 * 1000,
    ip = null,
    forbiddenPage = '/403.html'
  } = {}) {
    const requestKey = 'requestCount';
    const firstRequestTimeKey = 'firstRequestTime';

    // Utility to manage rate limiting state
    const getLocalStorageItem = (key, defaultValue) => parseInt(localStorage.getItem(key)) || defaultValue;
    const setLocalStorageItem = (key, value) => localStorage.setItem(key, value);

    const now = Date.now();
    let requestCount = getLocalStorageItem(requestKey, 0);
    let firstRequestTime = getLocalStorageItem(firstRequestTimeKey, now);

    if (now - firstRequestTime > windowMs) {
      // Reset rate limiting after time window
      setLocalStorageItem(requestKey, 0);
      setLocalStorageItem(firstRequestTimeKey, now);
      requestCount = 0;
    } else if (requestCount >= maxRequests) {
      alert('Too many requests. Please try again later.');
      return;
    }

    // Increment request count
    setLocalStorageItem(requestKey, requestCount + 1);

    // Function to handle risk check based on IP
    function checkRisk(ip) {
      fetch(`https://data.yourwebshield.co.uk/api/v1/lookup?ip_address=${ip}`)
        .then(response => {
          if (!response.ok) {
            console.warn(`Request failed with status ${response.status}. Skipping risk check.`);
            return null;
          }
          return response.json();
        })
        .then(data => {
          if (!data) return; // Exit if no data
          
          const { average_risk, bot_info } = data;
          if (bot_info === null && average_risk >= riskThreshold) {
            console.error('Forbidden: Your IP is blocked due to high risk.');
            window.location.href = forbiddenPage;
          } else {
            console.log('Access granted.');
          }
        })
        .catch(() => {
          console.warn('Failed to check IP risk. Continuing without blocking.');
        });
    }

    // Detect IP or use provided IP
    const detectIp = () => fetch('https://api.ipify.org?format=json')
      .then(response => {
        if (!response.ok) {
          console.warn(`IP detection service failed with status ${response.status}.`);
          return null;
        }
        return response.json();
      })
      .then(data => {
        if (!data) return; // Exit if no data
        checkRisk(data.ip);
      })
      .catch(() => {
        console.warn('Failed to auto-detect IP. Skipping risk check.');
      });

    ip ? checkRisk(ip) : detectIp();
  }

  global.yourwebshield = yourwebshield;
})(window);
