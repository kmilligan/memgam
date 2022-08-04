# The Journey

*I had several objectives for this project, one of which was to document the process I went though along the way.
Guess that means I have to learn markdown too; good thing I found this [cheat sheet](https://www.markdownguide.org/cheat-sheet/)...*

The practice of coding is constantly evolving. I wanted to update my knowledge of the javascript language, as well as how to test and deploy it.

## First steps

We should write tests first, right? After some research, it seems like [jest](https://jestjs.io/) is the flavor of the month for testing javascript. 

Hm, seems like jest relies on [node](https://nodejs.org). And maybe [babel](https://babeljs.io/). 

Don't know much about node, and nothing about babel, so maybe I'll do some research and come back to this later. In the mean time, want to write some code...

## Javascript

I originally learned Javascript long before ES2015/ES6. Some specific new things I wanted to learn about:

- `var` vs `const` and `let` . 
- Promises vs callbacks
- new "arrow" shorthand for functions
- pointer events vs mouse/touch events
- audio generation

I create a test/index.html file that loads src/memgam.js and src/memgam.css, and do some initial work cuz that's the fun part.

## Github

OK, let's create the git repo and put it up on github. 

First, I add basic README.md and LICESNSE files. Total of five files. I git init my  local repo and go through Github's process to add a new repo...

- They want the primary branch of the repo now to be "main" instead of "master"
- Can't use password authentication to push/pull anymore. OK, add my public SSH key to my account. Still doesn't work...
oh wait, Github's own instructions for pushing to origin state `git remote add origin https://...` , which isn't going to use a key. Change that to `git@github.com:`. Success!

Hm, all of the files appear to be author'd by my work account. SSH key is clearly tied to my personal account tho...

Oh wait...gotta update my `git config` for this project to use my non-work email address...delete repo, update git config, try again. Success!

## Github pages

I want to be able to "play" my new creation outside of my local environment. 
I'm used to setting up my own servers, but I wanted to try out the built-in hosting offering from Github. 
So I go to Settings > Pages, pick a theme, tell it to deploy based on my `main` branch. 

Hm. It added a new file to my repo, `_config.yml` . Apparently Github pages uses [jekyll](https://jekyllrb.com/) and that's the configuration file for that. Alrighty.

Low and behold, a couple minutes later a new web site is available using my README file as the content mixed with the theme I chose. Cool. Have to look more into how these Github Actions work.

I start working on this document, and add it to the repo as `journey.md` . Once I commit it to `main`, a couple minutes later it is available on the new site as `journey.html` . Magic. I'm a little leary of all of the automagic (*back in my day...shut up old man*) but have to admit it is nice.

## Tests

I run the jest install command `npm install --save-dev jest` . It complains about my node installation being old. 

Hm. I run `sudo apt install nodejs` and it says I'm up to date with version 10. jest install is asking for version 18. *searches internets...*

Guess I have to not use the package from my distro...try [nodesource](https://github.com/nodesource/distributions) instead.

- `sudo apt remove nodejs`
- `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -`
- `sudo apt install nodejs`

ok, I run the jest install command again now and it doesn't complain. yay!

...but it creates a new `node_modules` directory and adds almost 3500 (!) files to it. Yeesh. Pretty sure I don't want those in the repo...

`echo "node_modules" >> .gitignore`

We've also got some new automagically created config files for npm, package.json and package-lock.json. gah.

I modify package.json, changing `"test": "echo \"Error: no test specified\" && exit 1"` to `"test": "jest"`, and create a very simple `test/memgam.test.js` file. `npm test` seems to work now. yay!

