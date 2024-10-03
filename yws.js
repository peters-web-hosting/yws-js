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
    forbiddenPage = "/403.html",
  } = {}) {
    // Early exit if already on the forbidden page
    if (window.location.pathname === forbiddenPage) return;

    // Initialize rate limit variables
    const now = Date.now();
    const requestKey = "requestCount";
    const firstRequestTimeKey = "firstRequestTime";

    // Fetch stored values from localStorage
    let requestCount = parseInt(localStorage.getItem(requestKey)) || 0;
    let firstRequestTime =
      parseInt(localStorage.getItem(firstRequestTimeKey)) || now;

    // Check if the time window has expired
    if (now - firstRequestTime > windowMs) {
      requestCount = 0; // Reset counter
      firstRequestTime = now;
      localStorage.setItem(firstRequestTimeKey, now);
    }

    // Increment request count and save it
    requestCount++;
    localStorage.setItem(requestKey, requestCount);

    // Exit if too many requests
    if (requestCount > maxRequests) {
      window.location.href = forbiddenPageUrl;
      return;
    }

    // Function to check the risk of the IP
    const checkRisk = (ip) => {
      fetch(`https://data.yourwebshield.co.uk/api/v1/lookup?ip_address=${ip}`)
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
          if (!data) return;

          const { average_risk, bot_info } = data;
          if (!bot_info && average_risk > riskThreshold) {
            window.location.href = forbiddenPage;
          }
        })
        .catch(() => {
          console.warn("Failed to check IP risk. Skipping blocking.");
        });
    };

    // Detect IP or use provided IP
    const detectIp = () => {
      const cachedIp = sessionStorage.getItem("detectedIp");
      if (cachedIp) {
        checkRisk(cachedIp);
      } else {
        fetch("https://api.ipify.org?format=json")
          .then((response) => (response.ok ? response.json() : null))
          .then((data) => {
            if (data && data.ip) {
              sessionStorage.setItem("detectedIp", data.ip);
              checkRisk(data.ip);
            }
          })
          .catch(() => {
            console.warn("Failed to detect IP.");
          });
      }
    };

    ip ? checkRisk(ip) : detectIp();
  }

  global.yourwebshield = yourwebshield;
})(window);
