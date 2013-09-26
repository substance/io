I’m the maintainer of Substance, an open software platform for collaborative composition and sharing of digital documents. In this little essay, I’d like to sketch the challenges that modern publishing systems face today. I’d also like to come up with ideas for how the complexity can be handled with the help of specialized user-driven software. With Substance, our team is implementing the proposed ideas, not only to verify their feasability but also to release a crowd-funded open source publishing system as a modern alternative to existing publishing solutions.

# Challenges of modern digital publishing

## Content Creation

In the beginning there is content creation. Text needs to be written, annotated and structured. Images, tables and lists need to be added. Today, the addition of interactive content (such as visualizations, interactive maps, etc.) is becoming increasingly important and should be supported by publishing systems.

## Quality Management

In order to ensure quality and consistency of digital content, publishers need to setup a peer-review workflow. Publishing systems must provide means for reviewers to suggest ideas and report errors, and should offer easy communication between reviewers and authors.


## Publishing

Once the content is complete, it’s time to share it with the public. Publishing used to be a manual process involving expert knowledge and consuming a substantial amount of time, but software tools have now automatized it. Authors should be able to share their work online themselves, without any manual steps being necessary.

## Change Management

Even if the best review processes were applied, all published content is prone to inconsistencies and errors. Over time, pieces of content need to be updated, additional information added, and new editions of the document published to ensure eventual consistency. Therefore publishing systems must support incremental updates, and offer an easy way to release new editions.

## Content distribution

Content distribution is becoming an increasingly complex issue today. Back in the day there was just paper, but today content is also consumed electronically on different platforms: on the web, Ebook Readers and Smartphones. And they are all different. There needs to be a smart mechanism that automagically turns one publication into a variety of formats (ePub, HTML, PDF) so as a publisher, you don’t have to prepare versions for each and every targeted platform.

# Solutions

Over the last 2 years we have done a lot of research, and built a working prototype, Substance. Here are some of our conclusions about what makes a good digital publishing system.

## Separate content from presentation

Many traditional publishing systems store rich markup (such as HTML) and thus only allow publishing in that same format, which is a serious limitation when it comes to multi-platform publishing. How would you turn an HTML document into a printable version? How would you optimize it for Ebook Readers that use special document formats (e.g. Amazon Kindle)? By storing content (plain text) and annotations separately, it becomes possible for users to transform their documents into any format.

## Structured Composition

By considering a document as a sequence of content elements rather than one big chunk of formatted text, document editors can provide a better way of writing semantically structured content, as opposed to the visually optimized layouts offered by traditional word-processors.



## Offline Editing

We’ve seen the drawbacks of fully web-based publishing solutions, such as high latency and data loss. It turned out that providing an offline editor can significantly improve the user experience during editing and guarantee data security. Importantly information will stay private until users synchronize their publication with a public web-server. Moreover, authors can continue editing even if there’s no internet connection.

## Support for Collaboration

Authoring a publication is an iterative process that may involve many authors simultaneously editing a single document. During that process users should be enabled to add markers and comments to certain text fragments. Markers and comments should stay out of the user’s way, and only be shown contextually (e.g. when the text cursor is matching the corresponding marker).

## Extensibility

Editing requirements are fundamentally different among application domains. While book authors are comfortable with headings, text and images, scientists may demand more advanced content types such as formulas, data-tables and visualizations to prove their research findings. Publishing systems should feature a simple plugin system in order to allow user-specific content types.

# Substance

Substance is a content creation tool and a simple multi-format publishing platform. Whether you produce stories, books, documentations or scientific papers, Substance provides the tools that allow you to create, manage and share your content. It is being built with the idea of Open Knowledge in mind. So if you’d like to publish, comment on and collaborate around public documents, open access research or public domain texts, Substance may be for you.

The Substance eco-system consists of an offline editing tool (The Substance Composer) and an online multi-platform publishing system (Substance.io).

## Open Source
Behind the scenes Substance is mainly composed by a stack of open source modules that are publicly released under the Open Source MIT license, so anyone can contribute and help developing an open standard for annotated text. Substance is meant to be an interoperable platform, rather than a product. Its infrastructure can be used by anyone to build specialized applications on top of it.


## Content is data
Substance considers content as data, which makes them accessible to computers and allows new ways of processing them. Documents can not only be viewed, they can be queried, just like a database.

## Semantic editing

Instead of editing a big canvas, Substance documents are composed of content elements. While existing solutions (like Google Docs) bring traditional word-processing to the web, Substance focuses on content, by leaving the layout part to the system, not the user. Because of the absence of formatting utilities, it suggests structured content-oriented writing.

## Custom Element Types

Substance comes with a predefined set of element types. Out of the box you can choose from headings, text and images. However, it is easy to implement your own element types, and use it with your tailored version of the Substance Composer.


# Substance needs your help!
After a two-year experimental phase, our next goal is getting it ready for production. So we sat down, worked out a roadmap and launched a campaign to back development costs.

[http://pledgie.com/campaigns/18902](http://pledgie.com/campaigns/18902)

With the help of your donation we could make it happen, which is exciting! If you like the ideas proposed and want to see them in action, please support us.

This post was originally published on the [Open Knowledge Foundation Blog](http://blog.okfn.org/2013/01/15/content-as-data-towards-open-digital-publishing-with-substance/).