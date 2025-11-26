---
# Metadata comes from _data/metadata.json
permalink: "{{ metadata.feed.path }}"
eleventyExcludeFromCollections: true
---

<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>{{ site.title }}</title>
  <subtitle>{{ metadata.feed.subtitle }}</subtitle>
  <link href="{{ metadata.feed.url }}" rel="self"/>
  <updated>{{ collections.posts | getNewestCollectionItemDate:dateToRfc3339 }}</updated>
  {% assign allPosts = collections.posts | reverse %}
  {%- for post in allPosts -%}
  <entry>
    <title>{{ post.data.title }}</title>
    <link href="{{ post.url | absoluteUrl }}"/>
    <updated>{{ post.date dateToRfc822 }}</updated>
    <content type="html">{{ post.content }}</content>
  </entry>
  {%- endfor -%}
</feed>
