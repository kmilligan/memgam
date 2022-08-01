# The Journey

*I had several objectives for this project, one of which was to document the process I went though along the way.
Guess that means I have to learn markdown too; good thing I found this [cheat sheet](https://www.markdownguide.org/cheat-sheet/)...*

The practice of coding is constantly evolving. I wanted to update my knowledge of the javascript language, as well as how to test and deploy it.

## First steps

We should write tests first, right? After some research, it seems like [jest](https://jestjs.io/) is the flavor of the month for testing javascript. 

Hm, seems like jest relies on [node](https://nodejs.org). And maybe [babel](https://babeljs.io/). Hm, what is this package.json thing? 
OK, maybe I'll come back to this later.

## Javascript

I originally learned Javascript long before ES2015/ES6.

- `var` vs `const` and `let` . 
- Promises vs callbacks

## Github

OK, let's create the git repo and put it up on github.

- The primary branch in the repo now is "main" instead of "master"
- Can't use password authentication to push/pull. OK, add my public SSH key to my account. Still doesn't work...
oh wait, Github's own instructions for pushing to origin state `git remote add origin https://...` , which isn't going to use a key. Change that to `git@github.com:`. Success!

Hm, all of the files appear to be author'd by my work account. SSH key is clearly tied to my personal account tho...

Oh wait...gotta update my `git config` for this project to use my non-work email address...delete repo, try again. Success!
