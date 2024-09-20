(function (global) {
  /**
   * Function to block risky IPs with client-side rate limiting.
   * @param {object} options - Configuration options.
   * @param {number} [options.riskThreshold=70] - The risk score threshold to trigger blocking.
   * @param {number} [options.maxRequests=100] - Maximum number of requests allowed within the window.
   * @param {number} [options.windowMs=15 * 60 * 1000] - Time window in milliseconds for rate limiting.
   * @param {string} [options.ip=null] - Optional: If provided, uses the passed IP instead of auto-detecting it.
   */
  function yourwebshield({
    riskThreshold = 70,
    maxRequests = 100,
    windowMs = 15 * 60 * 1000,
    ip = null
  } = {}) {
    const requestKey = 'requestCount';

    // Rate limiting: Track request count and time window
    const requestCount = parseInt(localStorage.getItem(requestKey)) || 0;
    const firstRequestTime = parseInt(localStorage.getItem('firstRequestTime')) || Date.now();

    if (Date.now() - firstRequestTime > windowMs) {
      // Reset rate limiting if the window has passed
      localStorage.setItem(requestKey, '0');
      localStorage.setItem('firstRequestTime', Date.now());
    } else if (requestCount >= maxRequests) {
      alert('Too many requests. Please try again later.');
      return;
    }

    // Increment request count and store
    localStorage.setItem(requestKey, requestCount + 1);

    // Function to handle risk check based on IP
    function checkRisk(ip) {
      // Fetch IP risk data from external API
      fetch(`https://data.yourwebshield.co.uk/api/lookup?ip_address=${ip}`)
        .then(response => response.json())
        .then(data => {
          const { average_risk, bot_info } = data;

          if (bot_info !== null) {
            // Allow bots to proceed
            return;
          }

          if (average_risk >= riskThreshold) {
            alert('Forbidden: Your IP is blocked due to high risk.');
          } else {
            console.log('Access granted.');
          }
        })
        .catch(error => {
          console.error('Failed to check IP risk:', error);
        });
    }

    // If the user passes an IP, use it. Otherwise, auto-detect it.
    if (ip) {
      checkRisk(ip);
    } else {
      // Auto-detect IP using a third-party service (e.g., ipify.org)
      fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
          const autoDetectedIp = data.ip;
          checkRisk(autoDetectedIp);
        })
        .catch(error => {
          console.error('Failed to auto-detect IP:', error);
        });
    }
  }

  // Make the function available globally
  global.yourwebshield = yourwebshield;
})(window);
