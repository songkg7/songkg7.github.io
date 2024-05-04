import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const config: Config = {
    title: 'Haril Devlog',
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
        defaultLocale: 'en',
        locales: ['en'],
    },

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
                    blogTitle: 'Haril Devlog',
                    blogDescription: 'A blog about software development, programming, and computer science.',
                    blogSidebarTitle: 'All posts',
                    blogSidebarCount: 'ALL',
                    remarkPlugins: [remarkMath],
                    rehypePlugins: [rehypeKatex],
                    // Please change this to your repo.
                    // Remove this to remove the "edit this page" links.
                    editUrl:
                        'https://github.com/songkg7/songkg7.github.io/blob/main/'
                },
                theme: {
                    customCss: './src/css/custom.css',
                },
            } satisfies Preset.Options,
        ],
    ],

    themeConfig: {
        // Replace with your project's social card
        image: 'img/docusaurus-social-card.jpg',
        algolia: {
            // The application ID provided by Algolia
            appId: 'UXO3ZRTGDA',

            // Public API key: it is safe to commit it
            apiKey: '9ceaa1bf44bf96e360bdf439cc74c0e2',

            indexName: 'songkg7io',

            // 버전별로 다른 검색 결과를 원한다면 true로 설정 (초기에는 true 가 잘 동작하지 않음)
            contextualSearch: false,
        },
        navbar: {
            title: 'Haril Devlog',
            logo: {
                alt: 'Haril profile Logo',
                src: 'img/avatar.png',
            },
            items: [
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
            additionalLanguages: ['java', 'bash'],
        },
    } satisfies Preset.ThemeConfig,
};

export default config;
