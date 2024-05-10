import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const config: Config = {
    title: 'Haril Dev',
    tagline: 'More information, better developer',
    favicon: 'img/avatar.png',

    // Set the production url of your site here
    url: 'https://haril.dev',
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: '/',

    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    organizationName: 'songkg7', // Usually your GitHub org/user name.
    projectName: 'songkg7.github.io', // Usually your repo name.
    trailingSlash: false,

    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',

    // Even if you don't use internationalization, you can use this field to set
    // useful metadata like html lang. For example, if your site is Chinese, you
    // may want to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: 'kr',
        locales: ['kr', 'en'],
        localeConfigs: {
            kr: {
                label: '한국어',
            },
            en: {
                label: 'English',
                htmlLang: 'en-GB',
            },
        },
    },

    plugins: ['docusaurus-plugin-sass'],

    markdown: {
        mermaid: true,
    },
    themes: ['@docusaurus/theme-mermaid'],

    // katex
    stylesheets: [
        {
            href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
            type: 'text/css',
            integrity:
                'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
            crossorigin: 'anonymous',
        },
    ],

    scripts: [
        {
            src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6035015699405439",
            async: true,
            crossorigin: "anonymous"
        }
    ],

    presets: [
        [
            'classic',
            {
                gtag: {
                    trackingID: 'G-5VZJZHY7VL',
                    anonymizeIP: true,
                },
                docs: {
                    sidebarPath: './sidebars.ts',
                    // Please change this to your repo.
                    // Remove this to remove the "edit this page" links.
                    editUrl:
                        'https://github.com/songkg7/songkg7.github.io/blob/main/',
                },
                blog: {
                    showReadingTime: true,
                    blogTitle: 'Haril Dev',
                    blogDescription: 'A blog about software development, programming, and computer science.',
                    blogSidebarTitle: 'All posts',
                    blogSidebarCount: 'ALL',
                    remarkPlugins: [remarkMath],
                    rehypePlugins: [rehypeKatex],
                    editLocalizedFiles: true,
                    showLastUpdateTime: true,
                    showLastUpdateAuthor: true,
                    // Please change this to your repo.
                    // Remove this to remove the "edit this page" links.
                    editUrl:
                        'https://github.com/songkg7/songkg7.github.io/blob/main/'
                },
                theme: {
                    customCss: './src/css/custom.scss',
                },
            } satisfies Preset.Options,
        ],
    ],

    themeConfig: {
        // Replace with your project's social card
        image: 'img/docusaurus-social-card.jpg',
        algolia: {
            // The application ID provided by Algolia
            appId: 'D6WFZWSD4D',
            // Public API key: it is safe to commit it
            apiKey: '9e4843909b56bf91c2b09dccc0884889',
            indexName: 'haril',
        },
        navbar: {
            title: 'Haril Dev',
            logo: {
                alt: 'Haril profile Logo',
                src: 'img/avatar.png',
            },
            items: [
                {
                    type: 'localeDropdown',
                    position: 'right',
                },
                {
                    to: '/blog', label: 'Blog', position: 'left'
                },
                {
                    type: 'docSidebar',
                    sidebarId: 'productSidebar',
                    position: 'left',
                    label: 'Products',
                },
                {
                    'aria-label': 'GitHub Repository',
                    className: 'navbar--github-link',
                    href: 'https://github.com/songkg7',
                    position: 'right',
                },
            ],
        },
        footer: {
            style: 'dark',
            copyright: `Copyright © ${new Date().getFullYear()} Haril Song, All Rights Reserved.`,
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
            additionalLanguages: ['java', 'bash', 'json', 'sql', 'toml', 'docker', 'yaml'],
        },
    } satisfies Preset.ThemeConfig,
};

export default config;
