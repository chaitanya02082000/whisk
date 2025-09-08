import ScrapingBee from "scrapingbee";
import dotenv from "dotenv";
dotenv.config();
const scrapingbee = new ScrapingBee(process.env.SCRAPINGBEE_API_KEY);

export const fetchWithScrapingBee = async (url) => {
  console.log("🐝 Using ScrapingBee to fetch:", url);

  try {
    const response = await scrapingbee.get({
      url: url,
      params: {
        render_js: "false", // Set to true if the site needs JavaScript
        premium_proxy: "true", // Use premium residential proxies
        country_code: "us",
        wait: 1000, // Wait 1 second for page to load
        block_ads: "true",
        block_resources: "true",
        window_width: 1920,
        window_height: 1080,
      },
    });

    if (response.data) {
      console.log("✅ ScrapingBee fetch successful");
      return {
        html: response.data,
        blocked: false,
      };
    } else {
      throw new Error("No data received from ScrapingBee");
    }
  } catch (error) {
    console.error("❌ ScrapingBee error:", error);
    return {
      html: null,
      blocked: true,
      error: `ScrapingBee failed: ${error.message}`,
    };
  }
};
