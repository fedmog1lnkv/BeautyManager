<template>
    <div class="markdown-body" v-html="renderedMarkdown" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import MarkdownIt from 'markdown-it';
import MarkdownItAbbr from 'markdown-it-abbr';
import MarkdownItAnchor from 'markdown-it-anchor';
import MarkdownItFootnote from 'markdown-it-footnote';
import MarkdownItSub from 'markdown-it-sub';
import MarkdownItSup from 'markdown-it-sup';
import MarkdownItTOC from 'markdown-it-toc-done-right';

const props = defineProps({
    source: {
        type: String,
        default: ''
    }
});

const markdown = new MarkdownIt()
    .use(MarkdownItAbbr)
    .use(MarkdownItAnchor)
    .use(MarkdownItFootnote)
    .use(MarkdownItSub)
    .use(MarkdownItSup)
    .use(MarkdownItTOC);

const renderedMarkdown = computed(() => markdown.render(props.source));
</script>

<style>
@import 'https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.1.0/github-markdown-light.min.css';

.markdown-body {
    box-sizing: border-box;
    min-width: 200px;
    margin: 0 auto;
    padding: 2rem;
    background: white;
    border-radius: 6px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif,
    "Apple Color Emoji", "Segoe UI Emoji";
}

.markdown-body img {
    max-width: 100%;
    height: auto;
    max-height: 300px;
    border-radius: 8px;
    object-fit: contain;
    display: block;
    margin: 1rem auto;
}

.markdown-body ul {
    list-style-type: disc !important;
    margin-left: 1.5rem;
}

.markdown-body ol {
    list-style-type: decimal !important;
    margin-left: 1.5rem;
}
</style>
