import * as cheerio from "cheerio";
import * as duration from "tinyduration";

const parseInstructions = (instructions) => {
  let result = [];
  for (let instruction of instructions) {
    if (typeof instruction === "string") result.push(instruction);
    else {
      if (instruction["@type"] === "HowToStep") result.push(instruction.text);
    }
  }
  return result;
};

const findLDJSON = async (u) => {
  console.log("🌐 Fetching URL with proper headers:", u);

  try {
    // Add headers to mimic a real browser
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Cache-Control": "max-age=0",
    };

    let req = await fetch(u, {
      headers,
      method: "GET",
    });

    if (!req.ok) {
      throw new Error(`HTTP ${req.status}: ${req.statusText}`);
    }

    let html = await req.text();

    // Check if we got blocked by firewall
    if (
      html.includes("Sucuri Website Firewall") ||
      html.includes("Access Denied") ||
      html.includes("blocked") ||
      html.length < 1000
    ) {
      console.log("🚫 Request blocked by firewall or bot detection");
      return {
        html: null,
        $: null,
        blocked: true,
        error:
          "Website blocked the request. This site uses anti-bot protection.",
      };
    }

    let $ = cheerio.load(html);
    let jdjson = $("script[type='application/ld+json']");

    if (jdjson.length === 0) {
      console.log("📄 No JSON-LD found, will use HTML parsing");
      return { html, $ };
    }

    let content = JSON.parse(jdjson[0].children[0].data);

    if (Array.isArray(content)) return { jsonLd: content[0], html, $ };
    else {
      if (content["@graph"] && Array.isArray(content["@graph"])) {
        for (let t of content["@graph"]) {
          if (t["@type"] === "Recipe") return { jsonLd: t, html, $ };
        }
      }
    }
    return { html, $ };
  } catch (error) {
    console.error("❌ Fetch error:", error.message);
    return {
      html: null,
      $: null,
      blocked: true,
      error: `Failed to fetch: ${error.message}`,
    };
  }
};

const durationToStr = (d) => {
  if (!d) return "";
  let parsed = duration.parse(d);
  let result = [];
  if (parsed.hours) {
    result.push(`${parsed.hours} hours`);
  }
  if (parsed.minutes) {
    result.push(`${parsed.minutes} minutes`);
  }
  if (parsed.seconds) {
    result.push(`${parsed.seconds} seconds`);
  }

  let formatter = new Intl.ListFormat("en", {
    style: "long",
    type: "conjunction",
  });
  return formatter.format(result);
};

const findRecipe = async (jdjson) => {
  if (jdjson["@type"].indexOf("Recipe") === -1) return;

  let result = {};
  result.name = jdjson["name"];

  // Fix: Handle ImageObject properly
  if (jdjson["image"]) {
    if (typeof jdjson["image"] === "string") {
      result.image = jdjson["image"];
    } else if (Array.isArray(jdjson["image"])) {
      // Handle array of images - take the first one
      const firstImage = jdjson["image"][0];
      if (typeof firstImage === "string") {
        result.image = firstImage;
      } else if (firstImage && firstImage.url) {
        result.image = firstImage.url;
      } else {
        result.image = "";
      }
    } else if (jdjson["image"].url) {
      // Handle ImageObject
      result.image = jdjson["image"].url;
    } else {
      result.image = "";
    }
  } else {
    result.image = "";
  }

  result.description = jdjson["description"];
  result.cookTime = durationToStr(jdjson["cookTime"]);
  result.prepTime = durationToStr(jdjson["prepTime"]);
  result.totalTime = durationToStr(jdjson["totalTime"]);
  result.category = jdjson["recipeCategory"] ?? "";
  result.cuisine = jdjson["recipeCuisine"] ?? "";
  result.ingredients = jdjson["recipeIngredient"];
  result.instructions = parseInstructions(jdjson["recipeInstructions"]);

  // Fix: Handle recipeYield properly
  if (jdjson["recipeYield"]) {
    if (Array.isArray(jdjson["recipeYield"])) {
      result.yield = jdjson["recipeYield"][0];
    } else {
      result.yield = jdjson["recipeYield"];
    }
  } else {
    result.yield = "";
  }

  return result;
};

const extractRecipeHTML = ($) => {
  if (!$) {
    return "No content available";
  }

  console.log("🔍 Extracting recipe content from HTML...");

  // Remove unwanted elements first
  $(
    "script, style, nav, header, footer, .advertisement, .ads, .social-share, .comments, .sidebar, .menu, .navigation",
  ).remove();

  let recipeContent = "";
  let contentFound = false;

  // Try multiple strategies to find recipe content
  const strategies = [
    // Strategy 1: Look for recipe-specific selectors
    () => {
      const selectors = [
        '[itemtype*="Recipe"]',
        ".recipe-card",
        ".recipe-content",
        ".recipe-post",
        ".recipe-container",
        ".recipe",
        ".entry-recipe",
        ".post-recipe",
      ];

      for (const selector of selectors) {
        const element = $(selector);
        if (element.length > 0) {
          console.log(`📋 Found content with selector: ${selector}`);
          return element.html();
        }
      }
      return null;
    },

    // Strategy 2: Look for main content areas
    () => {
      const selectors = [
        "main",
        "article",
        ".entry-content",
        ".post-content",
        ".content",
        "#content",
        ".main-content",
      ];

      for (const selector of selectors) {
        const element = $(selector);
        if (element.length > 0) {
          console.log(`📄 Found content with selector: ${selector}`);
          return element.html();
        }
      }
      return null;
    },

    // Strategy 3: Look for specific content patterns
    () => {
      // Look for elements containing recipe keywords
      const recipeKeywords = [
        "ingredients",
        "instructions",
        "directions",
        "recipe",
        "cook",
        "prep",
      ];
      let bestElement = null;
      let maxScore = 0;

      $("div, section, article").each((i, elem) => {
        const $elem = $(elem);
        const text = $elem.text().toLowerCase();
        let score = 0;

        recipeKeywords.forEach((keyword) => {
          if (text.includes(keyword)) score++;
        });

        if (score > maxScore && $elem.text().length > 200) {
          maxScore = score;
          bestElement = $elem;
        }
      });

      if (bestElement) {
        console.log(
          `🎯 Found content with keyword matching (score: ${maxScore})`,
        );
        return bestElement.html();
      }
      return null;
    },

    // Strategy 4: Fallback to body content
    () => {
      console.log("📦 Using full body content as fallback");
      return $("body").html();
    },
  ];

  // Try each strategy until we find content
  for (const strategy of strategies) {
    const content = strategy();
    if (content && content.length > 100) {
      // Minimum content length
      recipeContent = content;
      contentFound = true;
      break;
    }
  }

  if (!contentFound) {
    console.log("❌ No substantial content found");
    return "No recipe content found";
  }

  // Clean up the extracted content
  const cleanedContent = cheerio.load(recipeContent);

  // Remove more unwanted elements from the extracted content
  cleanedContent(
    "script, style, .advertisement, .ads, .social-share, .comments, .sidebar, .menu, .navigation, .popup, .modal",
  ).remove();

  // Get text content and clean it up
  let textContent = cleanedContent.text();

  // Clean up whitespace and formatting
  textContent = textContent
    .replace(/\s+/g, " ") // Replace multiple whitespace with single space
    .replace(/\n\s*\n/g, "\n") // Remove empty lines
    .trim();

  console.log(`📏 Extracted content length: ${textContent.length} characters`);

  return textContent;
};

export { findLDJSON, findRecipe, extractRecipeHTML };
