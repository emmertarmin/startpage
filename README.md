# Liteweight Drag&Drop Startpage
This started as a [vanilla.js](http://vanilla-js.com/) exercise, though I pulled in jQuery unnecessarily for minimal convenience.

Links dropped on the bottom bar will drop their URL, and after adding a name you can drag that bar to place it in the link tree. If the URL is left empty, dragging it will make a folder.

The idea was to have this simple local html file run in the browser as a startpage, so that no internet would be required, and loading would be as fast as possible. Turns out it's not possible to use JavaScript to read a "linklist.json" file from a locally opened website because it raises the CORS error, and isn't solvable other than disabling CORS in the browser (not recommended), or hosting the site on a local or remote server. Circumventing this I'm now importing "linklist.js" which just has the config variable holding all of the json data, which works as intended.
