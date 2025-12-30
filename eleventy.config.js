import yaml from "js-yaml";
import markdownItAttrs from "markdown-it-attrs";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import xmlFiltersPlugin from "eleventy-xml-plugin";
import pluginRss from "@11ty/eleventy-plugin-rss";
import { EleventyHtmlBasePlugin } from "@11ty/eleventy";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

export default function(eleventyConfig) {
  // 11ty watch targets
  eleventyConfig.addWatchTarget("./src/_scss/");
  // 11ty YAML support
  eleventyConfig.addDataExtension("yml", (contents) => yaml.load(contents));
  // 11ty Collections
  eleventyConfig.addCollection("projects", (collection) => {
    return collection.getFilteredByGlob("./src/projects/*.md");
  });
  eleventyConfig.addCollection("images", (collection) => {
    return collection.getFilteredByGlob("./src/images/*.md");
  });
  eleventyConfig.addCollection("posts", (collection) => {
    return collection.getFilteredByGlob("./src/_posts/*.md");
  });

  // Image config
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    // output image formats
    formats: ["avif", "webp", "jpeg"],

    // output image widths
    widths: ["auto"],

    // optional, attributes assigned on <img> nodes override these values
    htmlOptions: {
      imgAttributes: {
        loading: "lazy",
        decoding: "async",
      },
      pictureAttributes: {}
    },
  });

  // Post Tags
  eleventyConfig.addCollection("tagList", (collectionApi) => {
    const tagsSet = {};
    collectionApi.getFilteredByGlob("./src/_posts/*.md").forEach((item) => {
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
    collectionApi.getFilteredByGlob("./src/_posts/*.md").forEach((item) => {
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
      includes: "_includes",
      layouts: "_layouts",
    },
  };
};

function sortByWeight(values) {
  return values.sort((a, b) => a.data.weight - b.data.weight);
}
