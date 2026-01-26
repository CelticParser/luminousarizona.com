import yaml from "js-yaml";
import markdownItAttrs from "markdown-it-attrs";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import xmlFiltersPlugin from "eleventy-xml-plugin";
import pluginRss from "@11ty/eleventy-plugin-rss";
import { EleventyHtmlBasePlugin } from "@11ty/eleventy";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import eleventyImage from "@11ty/eleventy-img";
import path from "path";

export default function(eleventyConfig) {
  // 11ty watch targets
  eleventyConfig.addWatchTarget("./src/_/sass/");
  // 11ty YAML support
  eleventyConfig.addDataExtension("yml", (contents) => yaml.load(contents));
  // 11ty Collections
  eleventyConfig.addCollection("projects", (collection) => {
    return collection.getFilteredByGlob("./src/projects/**/*.md").filter(item => {
      // Only include the main project file (same name as directory)
      const dirName = item.inputPath.split('/').slice(-2, -1)[0];
      const fileName = item.inputPath.split('/').slice(-1)[0].replace('.md', '');
      return dirName === fileName;
    });
  });
  eleventyConfig.addCollection("about", (collection) => {
    return collection.getFilteredByGlob("./src/about/*.md");
  });
  eleventyConfig.addCollection("images", (collection) => {
    // Images are now in project subdirectories, collect all .md files except the main project file
    return collection.getFilteredByGlob("./src/projects/**/*.md").filter(item => {
      const dirName = item.inputPath.split('/').slice(-2, -1)[0];
      const fileName = item.inputPath.split('/').slice(-1)[0].replace('.md', '');
      return dirName !== fileName; // Exclude the main project file
    });
  });
  eleventyConfig.addCollection("posts", (collection) => {
    return collection.getFilteredByGlob("./src/_/posts/*.md");
  });

  // Custom filename format function to preserve original filename with width appended
  function customFilenameFormat(id, src, width, format, options) {
    // Extract original filename without extension
    // src can be a full path, so we need to get just the basename
    const basename = path.basename(src);
    const ext = path.extname(basename);
    const originalName = basename.replace(ext, '');
    // Return filename as: originalname-width.format
    return `${originalName}-${width}.${format}`;
  }

  // Image config
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    // output image formats
    formats: ["avif", "webp", "jpeg"],

    // output image widths - matching CSS breakpoints
    widths: [576, 768, 992, 1360],

    // Custom filename format to preserve original filename
    filenameFormat: customFilenameFormat,

    // optional, attributes assigned on <img> nodes override these values
    htmlOptions: {
      imgAttributes: {
        loading: "lazy",
        decoding: "async",
      },
      pictureAttributes: {}
    },
  });

  // Responsive Image Shortcode
  eleventyConfig.addShortcode("responsiveImage", async function(src, alt = "", style = "", className = "", sizesOverride = "") {
    if (!src) return "";
    
    // Get the source path (relative to src/assets/images or absolute)
    const inputPath = src.startsWith("/") ? `./src${src}` : `./src/assets/images/${src}`;
    
    let metadata;
    try {
      // Use the default export function which handles queue setup automatically
      metadata = await eleventyImage(inputPath, {
        widths: [576, 768, 992, 1360],
        formats: ["avif", "webp", "jpeg"],
        outputDir: "./public/assets/images/",
        urlPath: "/assets/images/",
        filenameFormat: customFilenameFormat,
      });
    } catch (error) {
      // If image processing fails, fallback to simple img tag
      console.warn(`Failed to process image ${inputPath}:`, error.message);
      return `<img src="/assets/images/${src}" alt="${(alt || '').replace(/"/g, '&quot;')}"${style ? ` style="${String(style).replace(/"/g, '&quot;')}"` : ''}${className ? ` class="${String(className).replace(/"/g, '&quot;')}"` : ''}>`;
    }

    // Build picture element with sources for each breakpoint and format
    let pictureHtml = '<picture>';
    
    // Define sizes attribute for responsive images
    // This tells the browser what size the image will be displayed at different viewport widths
    // Default sizes based on container max-widths: xl: 1140px, with padding accounting for ~1220px at xl breakpoint
    // Using calc to account for container padding and margins
    const sizes = sizesOverride || "(min-width: 1360px) 1220px, calc(94.23vw - 43px)";
    
    // Generate sources for each format (AVIF, WebP) with media queries
    for (const format of ["avif", "webp"]) {
      if (!metadata[format]) continue;
      
      const formatImages = metadata[format];
      const srcset = formatImages.map(img => `${img.url} ${img.width}w`).join(', ');
      
      // Add sources for each breakpoint (largest to smallest for proper media query ordering)
      // Each source includes all widths in srcset - browser picks best size within that breakpoint
      // Note: For true art direction, you would use different image sources per breakpoint
      // sizes attribute is required when using width descriptors (W) in srcset
      pictureHtml += `<source media="(min-width: 1360px)" type="image/${format}" srcset="${srcset}" sizes="${sizes}">`;
      pictureHtml += `<source media="(min-width: 992px)" type="image/${format}" srcset="${srcset}" sizes="${sizes}">`;
      pictureHtml += `<source media="(min-width: 768px)" type="image/${format}" srcset="${srcset}" sizes="${sizes}">`;
      pictureHtml += `<source media="(min-width: 576px)" type="image/${format}" srcset="${srcset}" sizes="${sizes}">`;
      // Default source for mobile (< 576px) to provide modern formats
      pictureHtml += `<source type="image/${format}" srcset="${srcset}" sizes="${sizes}">`;
    }
    
    // Fallback img tag with JPEG format
    const jpegImages = metadata.jpeg || [];
    const jpegSrcset = jpegImages.map(img => `${img.url} ${img.width}w`).join(', ');
    const fallbackSrc = jpegImages.length > 0 ? jpegImages[jpegImages.length - 1].url : src;
    
    // Build img attributes
    let imgAttributes = `loading="lazy" decoding="async" alt="${(alt || '').replace(/"/g, '&quot;')}" srcset="${jpegSrcset}" sizes="${sizes}" src="${fallbackSrc}"`;
    
    // Add style attribute if provided
    if (style) {
      imgAttributes += ` style="${String(style).replace(/"/g, '&quot;')}"`;
    }
    
    // Add class attribute if provided
    if (className) {
      imgAttributes += ` class="${String(className).replace(/"/g, '&quot;')}"`;
    }
    
    // Add eleventy:ignore attribute to prevent transform plugin from processing this img tag
    imgAttributes += ' eleventy:ignore';
    
    pictureHtml += `<img ${imgAttributes}>`;
    pictureHtml += '</picture>';
    
    return pictureHtml;
  });

  // Post Tags
  eleventyConfig.addCollection("tagList", (collectionApi) => {
    const tagsSet = {};
    collectionApi.getFilteredByGlob("./src/_/posts/*.md").forEach((item) => {
      if (!item.data.tags) return;
      item.data.tags
        .filter((tag) => !["posts", "all"].includes(tag))
        .forEach((tag) => {
          if (!tagsSet[tag]) {
            tagsSet[tag] = [];
          }
          tagsSet[tag].push(item);
        });
    });
    return tagsSet;
  });

  // Post Categories
  eleventyConfig.addCollection("categoryList", (collectionApi) => {
    let catSet = {};
    collectionApi.getFilteredByGlob("./src/_/posts/*.md").forEach((item) => {
      if (!item.data.categories) return;
      item.data.categories
        .filter((cat) => !["posts", "all"].includes(cat))
        .forEach((cat) => {
          if (!catSet[cat]) {
            catSet[cat] = [];
          }
          catSet[cat].push(item);
        });
    });
    return catSet;
  });

  // Layout Aliases
  eleventyConfig.addLayoutAlias("basic", "basic.liquid");
  eleventyConfig.addLayoutAlias("categories", "categories.liquid");
  eleventyConfig.addLayoutAlias("category", "category.liquid");
  eleventyConfig.addLayoutAlias("contact", "contact.liquid");
  eleventyConfig.addLayoutAlias("default", "default.liquid");
  eleventyConfig.addLayoutAlias("home", "home.liquid");
  eleventyConfig.addLayoutAlias("image", "image.liquid");
  eleventyConfig.addLayoutAlias("post", "post.liquid");
  eleventyConfig.addLayoutAlias("project-left", "project-left.liquid");
  eleventyConfig.addLayoutAlias("project-right", "project-right.liquid");
  eleventyConfig.addLayoutAlias("project-top", "project-top.liquid");
  eleventyConfig.addLayoutAlias("project", "project.liquid");
  eleventyConfig.addLayoutAlias("projects", "projects.liquid");
  eleventyConfig.addLayoutAlias("project-image", "project-image.liquid");

  // Custom Filters
  eleventyConfig.addFilter("sortByWeight", sortByWeight);

  // General config
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.setServerPassthroughCopyBehavior("copy");
  eleventyConfig.setLiquidOptions({ jsTruthy: true });
  eleventyConfig.setQuietMode(true);
  eleventyConfig.amendLibrary("md", (mdLib) => mdLib.use(markdownItAttrs));
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.setLiquidOptions({
    dynamicPartials: true,
    strictFilters: true,
  });

  // RSS
  eleventyConfig.addPlugin(xmlFiltersPlugin);
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addLiquidFilter("getNewestCollectionItemDate", pluginRss.getNewestCollectionItemDate);
  eleventyConfig.addLiquidFilter("absoluteUrl", pluginRss.absoluteUrl);
  eleventyConfig.addLiquidFilter("convertHtmlToAbsoluteUrls", pluginRss.convertHtmlToAbsoluteUrls);
  eleventyConfig.addLiquidFilter("dateToRfc3339", pluginRss.dateToRfc3339);
  eleventyConfig.addLiquidFilter("dateToRfc822", pluginRss.dateToRfc822); // New in RSS 1.2.0

  return {
    pathPrefix: "/",
    addPassthroughCopy: true,
    markdownTemplateEngine: "liquid",
    templateFormats: ["html", "md", "njk", "liquid"],
    dir: {
      input: "src",
      output: "public",
      data: "_/_data",
      includes: "_/includes",
      layouts: "_/layouts",
    },
  };
};

function sortByWeight(values) {
  return values.sort((a, b) => a.data.weight - b.data.weight);
}
