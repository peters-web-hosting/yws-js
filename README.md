# YourWebShield

**YourWebShield** is a JavaScript library that blocks risky IPs using client-side rate limiting and IP risk checking. This tool provides an easy way to enhance your web application’s security by embedding it via a simple `<script>` tag.

## Features

- **Rate Limiting**: Automatically limits the number of requests a user can make within a defined time window.
- **IP Risk Checking**: Checks IP addresses against a risk database to block suspicious or malicious traffic.
- **Embeddable**: Easily embed the library via a URL using jsDelivr.
- **Auto IP Detection**: Automatically detects the user's IP address or allows manual IP passing.

## Installation

You can include the library in your HTML page using jsDelivr:

```html
<script src="https://cdn.jsdelivr.net/gh/peters-web-hosting/yws-js@1.0.0/yws.js"></script>
```

## Usage

Once the script is embedded, you can configure and use the `yourwebshield` function in your JavaScript:

### Example: Auto IP Detection
```html
<script>
  yourwebshield({
    riskThreshold: 75, // The risk score threshold to block IPs
    maxRequests: 50,   // Maximum number of requests allowed in the time window
    windowMs: 10 * 60 * 1000, // Time window for rate limiting (10 minutes)
  });
</script>
```

### Example: Manually Passing IP Address
```html
<script>
  yourwebshield({
    riskThreshold: 80,
    maxRequests: 30,
    windowMs: 5 * 60 * 1000, // 5-minute window for rate limiting
    ip: '192.168.1.100' // Manually pass the user's IP address
  });
</script>
```

## Options

| Option          | Type     | Default               | Description                                                      |
|-----------------|----------|-----------------------|------------------------------------------------------------------|
| `riskThreshold`  | Number   | `70`                  | The risk score threshold to block IPs.                           |
| `maxRequests`    | Number   | `100`                 | The maximum number of requests allowed within the time window.    |
| `windowMs`       | Number   | `15 * 60 * 1000`      | Time window for rate limiting (in milliseconds).                 |
| `ip`             | String   | `null`                | Optional: Manually pass the IP address.                          |

## How It Works

1. **Rate Limiting**: Tracks requests made by an IP address and blocks further requests if the limit is exceeded within a set time window.
2. **IP Risk Check**: The library fetches risk data for the user's IP from `yourwebshield.co.uk`. If the risk score exceeds the configured threshold, access is blocked.
3. **Auto IP Detection**: If no IP address is provided, the library will automatically detect the user's IP using `ipify.org`.

## Hosting & CDN

This library is hosted on GitHub and delivered through the jsDelivr CDN for fast, global access. You can embed the latest version using the following URL:

```
https://cdn.jsdelivr.net/gh/peters-web-hosting/yws-js@1.0.0/yws.js
```

## Contributing

Feel free to fork the repository and submit pull requests with improvements, bug fixes, or new features.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
