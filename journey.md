# The Journey

*I had several objectives for this project, one of which was to document the process I went though along the way.
Guess that means I have to learn markdown too; good thing I found this [cheat sheet](https://www.markdownguide.org/cheat-sheet/)...*

The practice of coding is constantly evolving. I wanted to update my knowledge of the javascript language, as well as how to test and deploy it.

## First steps

We should write tests first, right? After some research, it seems like [jest](https://jestjs.io/) is the flavor of the month for testing javascript. 

Hm, seems like jest relies on [node](https://nodejs.org). And maybe [babel](https://babeljs.io/). Hm, what is this package.json thing? 

OK, maybe I'll come back to this later. *gets rid of those extra files for now*

## Javascript

I originally learned Javascript long before ES2015/ES6.

- `var` vs `const` and `let` . 
- Promises vs callbacks

I create a test/index.html file that loads src/memgam.js and src/memgam.css, and do some initial work cuz that's the fun part.

## Github

OK, let's create the git repo and put it up on github. 

First, I add basic README.md and LICESNSE files. Total of five files. I git init my  localrepo and go through Github's process to add a new repo...

- The primary branch in the repo now is "main" instead of "master"
- Can't use password authentication to push/pull anymore. OK, add my public SSH key to my account. Still doesn't work...
oh wait, Github's own instructions for pushing to origin state `git remote add origin https://...` , which isn't going to use a key. Change that to `git@github.com:`. Success!

Hm, all of the files appear to be author'd by my work account. SSH key is clearly tied to my personal account tho...

Oh wait...gotta update my `git config` for this project to use my non-work email address...delete repo, try again. Success!

## Github pages

I want to be able to "play" my new creation outside of my local environment. 
I'm used to setting up my own servers, but I wanted to try out the built-in hosting offering from Github. 
So I go to Settings > Pages, pick a theme, tell it to deploy based on my `main` branch. 

Hm. It added a new file to my repo, `_config.yml` . Apparently Github pages uses [jekyll](https://jekyllrb.com/) and that's the configuration file for that. Alrighty.

Low and behold, a couple minutes later a new web site is available using my README file as the content mixed with the theme I chose. Cool. 

I start working on this document, and add it to the repo as `journey.md` . Once I commit it to `main`, a couple minutes later it is available on the new site as `journey.html` . 
