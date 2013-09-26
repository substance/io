We just learned that Substance got selected for the $ 5,000 Suttleworth Flash Grant. This is really exciting/rewarding and we look forward to put more dedicated time on finishing our API's and releasing a new version of the Substance Composer. Thank you Mark Horner for nominating us!

![](http://substance.io/images/shuttleworth.jpg)

We haven't posted many updates in the past weeks, which is mainly because we've been too busy working on the next iteration of the Substance platform and another top secret projects. ;) However, I'd give you a quick overview about what we're up to, and what you can expect the next release of the Substance platform will offer:

First off, we've already reached feature-complete status ealier this year. Image embedding is back and so is support for links, inline code and code blocks. We've also implemented the full collaboration workflow, so users can start co-editing a shared document.

![](http://substance.io/images/substance-composer.png)

However before shipping those features we thought now is the perfect time to get things serious. We don't want to launch before we are confident that our system is stable and runs reliable when under load. We're working on a bunch of greater refactorings now that we really know what problems we need to solve. We've setup a [test suite](https://github.com/substance/tests) which allows us to test complex editing scenarios and cover edge cases. We're also stabilizing the API of our core [document model](https://github.com/substance/document). We have some really tough problems to solve, since allowing co-edits combined with offline replication is not trivial. There will be numerous conflict situation the users will have to deal with. In order to support these workflows we need a good versioning API, or in other words, we need something like Git, but optimized for JSON-based documents rather than plain text. So [Substance Chronicle](https://github.com/substance/chronicle) was born. It's a git-inspired versioning API based on Operational Transformations (OT). I could talk for hours about this, but I think it's better to get back to work. You can follow Substance development at [Github](https://github.com/substance/). Please just keep in mind there are still many moving parts and we can't offer support for the time being.

In other news we've been collaborating with scientists in the past months working on a new display method for accessing Open Access research content. It will released to the public tomorrow. So check back here tomorrow evening to see some Substance in the wild.

Please also support our [donation campaign](http://pledgie.com/campaigns/18902). We really need your help to make Substance happen. Thank you!
