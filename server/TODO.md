% Roadmap

# MVP

- Users in database DONE
- Create account (subscribe) DONE
- Notes in database WIP

# Bugs

- multiple requests to /login

# Source code

- More tests: Login WIP, password update, create note and get note, get notes, ... Unlawful login, forbidden queries, etc.
- Use primary key login
- Split in multiple files
- Better HTTP error codes https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html

# Security

- CSRF protection with https://github.com/justinas/nosurf

# Later, maybe

- Long note update by diff (in crypto world, will be FHE demo ;)
- Test if we can add something like qor (initial test fails)
