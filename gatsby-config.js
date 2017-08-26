module.exports = {
  pathPrefix: '/blog',
  siteMetadata: {
    title: `Meera Sahib - Blog`,
    author: `Mohamed Meera Sahib`,
  },
  plugins: [
    'gatsby-plugin-catch-links',
    'gatsby-plugin-styled-components',
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/pages`,
        name: 'pages',
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          'gatsby-remark-copy-linked-files',
          {
            resolve: 'gatsby-remark-images',
            options: {
              linkImagesToOriginal: false
            }
          },
          'gatsby-remark-prismjs',
          'gatsby-remark-smartypants',
          'gatsby-remark-autolink-headers'
        ]
      }
    },
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-offline',
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: 'gatsby-plugin-google-analytics',
      options: {
        trackingId: 'UA-105102373-1'
      }
    },
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: `Meera Sahib's Blog`,
        description: 'The blog of the developer, Mohamed Meera Sahib',
        short_name: 'Meera Blog',
        background_color: 'white',
        theme_color: '#002635',
        orientation: 'portrait',
        display: 'minimal-ui'
      }
    }
  ],
}
