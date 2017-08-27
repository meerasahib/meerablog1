---
title: Hydrophonic
path: /getting-started-with-gatsby
date: '2017-07-17T17:12:33.962Z'
tags:
  - gatsby
  - react
  - javascript
image: preview.png
excerpt: >-
  Recently we have installed hydrophnic.To know more details click 
  here
---

Here we are explaining about hydroponics recently installed in my house



```

          
exports.createPages = ({ boundActionCreators, graphql }) => {
  const { createPage } = boundActionCreators;

  const blogPostTemplate = path.resolve(`src/templates/blog-post.js`);
};

```

Nothing super complex yet! We're using the `createPages` API (which Gatsby will call at build time with injected parameters). We're also grabbing the _path_ to our blogPostTemplate we created earlier. Finally, we're using the `createPage` action creator/function made available in boundActionCreators. Gatsby uses Redux internally to manage its state, and `boundActionCreators` are simply the exposed action creators of Gatsby, of which `createPage` is one of the action creators! For the full list of exposed action creators, check out [Gatsby's documentation][gatsby-bound-action-creators]. We can now construct the GraphQL query, which will fetch all of our Markdown posts.

### Querying for posts

```javascript{8-31}
const path = require('path');

exports.createPages = ({ boundActionCreators, graphql }) => {
  const { createPage } = boundActionCreators;

  const blogPostTemplate = path.resolve(`src/templates/blog-post.js`);

  return graphql(`{
    allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___date] }
      limit: 1000
    ) {
      edges {
        node {
          excerpt(pruneLength: 250)
          html
          id
          frontmatter {
            date
            path
            title
          }
        }
      }
    }
  }`).then(result => {
    if (result.errors) {
      return Promise.reject(result.errors);
    }
  });
};

```

We're using GraphQL to get all Markdown nodes and making them available under the `allMarkdownRemark` GraphQL property. Each exposed property (on `node`) is made available for querying against. We're effectively seeding a GraphQL "database" that we can then query against via page-level GraphQL queries. One note here is that the `exports.createPages` API expects a Promise to be returned, so it works seamlessly with the `graphql` function, which returns a Promise (although note a callback API is also available if that's more your thing).

One cool note here is that the `gatsby-plugin-remark` plugin exposes some useful data for us to query with GraphQL, e.g. `excerpt` (a short snippet to display as a preview), `id` (a unique identifier for each post), etc.

We now have our query written, but we haven't yet programatically created the pages (with the `createPage` action creator). Let's do that!

### Creating the pages

```javascript{32-36}
const path = require('path');

exports.createPages = ({ boundActionCreators, graphql }) => {
  const { createPage } = boundActionCreators;

  const blogPostTemplate = path.resolve(`src/templates/blog-post.js`);

  return graphql(`{
    allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___date] }
      limit: 1000
    ) {
      edges {
        node {
          excerpt(pruneLength: 250)
          html
          id
          frontmatter {
            date
            path
            title
          }
        }
      }
    }
  }`).then(result => {
    if (result.errors) {
      return Promise.reject(result.errors);
    }

    result.data.allMarkdownRemark.edges.forEach(({ node }) => {
      createPage({
        path: node.frontmatter.path,
        component: blogPostTemplate,
        context: {} // additional data can be passed via context
      });
    });
  });
};

```

We've now tied into the Promise chain exposed by the `graphql` query. The actual posts are available via the path `result.data.allMarkdownRemark.edges`. Each edge contains an internal node, and this node holds the useful data that we will use to construct a page with Gatsby. Our GraphQL "shape" is directly reflected in this data object, so each property we pulled from that query will be available when we are querying in our GraphQL blog post template.

The `createPage` API accepts an object which requires `path` and `component` properties to be defined, which we have done above. Additionally, an optional property `context` can be used to inject data and make it available to the blog post template component via injected props (log out props to see each available prop!). Each time we build with Gatsby, `createPage` will be called, and Gatsby will create a static HTML file of the path we specified in the post's frontmatter--the result of which will be our stringified and parsed React template injected with the data from our GraphQL query. Whoa, it's actually starting to come together!

We can run `yarn develop` at this point, and then navigate to `http://localhost:8000/hello-world` to see our first blog post, which should look something like below:

![My first blog post with Gatsby](./images/my-first-blog-post.png)

At this point, we've created a single static blog post as an HTML file, which was created by a React component and several GraphQL queries. However, this isn't a blog! We can't expect our users to guess the path of each post, we need to have an index or listing page, where we display each blog post, a short snippet, and a link to the full blog post. Wouldn't you know it, we can do this incredibly easily with Gatsby, using a similar strategy as we used in our blog template, e.g. a React component and a GraphQL query.

## Creating the Blog Listing

I won't go into quite as much detail for this section, because we've already done something very similar for our blog template! Look at us, we're pro Gatsby-ers at this point!

Gatsby has a standard for "listing pages," and they're placed in the root of our filesystem we specified in `gatsby-source-filesystem`, e.g. `src/pages/index.js`. So create that file if it does not exist, and let's get it working! Additionally note that any static JavaScript files (that export a React component!) will get a corresponding static HTML file. For instance, if we create `src/pages/tags.js`, the path `http://localhost:8000/tags/` will be available within the browser and the statically generated site.

```javascript
import React from 'react';
import Link from 'gatsby-link';
import Helmet from 'react-helmet';

// import '../css/index.css'; // add some style if you want!

export default function Index({ data }) {
  const { edges: posts } = data.allMarkdownRemark;
  return (
    <div className="blog-posts">
      {posts
        .filter(post => post.node.frontmatter.title.length > 0)
        .map(({ node: post }) => {
          return (
            <div className="blog-post-preview" key={post.id}>
              <h1>
                <Link to={post.frontmatter.path}>
                  {post.frontmatter.title}
                </Link>
              </h1>
              <h2>
                {post.frontmatter.date}
              </h2>
              <p>
                {post.excerpt}
              </p>
            </div>
          );
        })}
    </div>
  );
}

export const pageQuery = graphql`
  query IndexQuery {
    allMarkdownRemark(sort: { order: DESC, fields: [frontmatter___date] }) {
      edges {
        node {
          excerpt(pruneLength: 250)
          id
          frontmatter {
            title
            date(formatString: "MMMM DD, YYYY")
            path
          }
        }
      }
    }
  }
`;

```

OK! So we've followed a similar approach to our blog post template, so this should hopefully seem pretty familiar. Once more we're exporting `pageQuery` which contains a GraphQL query. Note that we're pulling a slightly different data set, specifically we are pulling an `excerpt` of 250 characters rather than the full HTML, as well as we are formatting the pulled date with a format string! GraphQL is awesome.

The actual React component is fairly trivial, but one important note should be made. It's important that when linking to internal content, i.e. other blog links, that you should always use `gatsby-link`. Gatsby does not work if pages are not routed via this utility. Additionally, this utility also works with `pathPrefix`, which allows for a Gatsby site to be deployed a non-root domain. This is useful if this blog will be hosted on something like Github Pages, or perhaps hosted at `/blog`.

Now this is getting exciting and it feels like we're finally getting somewhere! At this point, we have a fully functional blog generated by Gatsby, with real content authored in Markdown, a blog listing, and the ability to navigate around in the blog. If you run `yarn develop`, `http://localhost:8000` should display a preview of each blog post, and each post title links to the content of the blog post. A real blog!

![Blog listing](./images/blog-listing.png)

It's now on you to make something incredible with the knowledge you've gained in following along with this tutorial! You can not only make it pretty and style with CSS (or [styled-components][styled-components]!), but you could improve it functionally by implementing some of the following:

-   Add a tag listing and tag search page
    -   hint: the `createPages` API in `gatsby-node.js` file is useful here, as is frontmatter
-   adding navigation between a specific blog post and past/present blog posts (the `context` API of `createPages` is useful here), etc.

With our new found knowledge of Gatsby and its API, you should feel empowered to begin to utilize Gatsby to its fullest potential. A blog is just the starting point; Gatsby's rich ecosystem, extensible API, and advanced querying capabilities provide a powerful toolset for building truly incredible, performant sites.

Now go build something great.

![Dream Bigger](./images/dream-bigger.jpeg)

## Links

-   [`@dschau/gatsby-blog-starter-kit`][source-code]
    -   A working repo demonstrating all of the aforementioned functionality of Gatsby
-   [`@dschau/create-gatsby-blog-post`][create-gatsby-blog-post]
    -   A utility and CLI I created to scaffold out a blog post following the predefined Gatsby str/create-gatsby-blog-post
