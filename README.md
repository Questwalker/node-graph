# Node Graph
A very rudamentary node graph viewer\
Not completely functional, has some bugs. Just quick and dirty.

Utilizes [vis.js](https://visjs.org/)

## Usage
Type into the text box pairs like `a b` separated by newlines. Nodes `a` and `b` will be created (if they don't exist already) and a link between the two will be created like `a -> b`

For example:
```
foo bar
foo quux
baz quux
quux bar
grault baz
corge grault
```
Will create the nodes foo, bar, baz, quux, corge, and grault and the links will shape the graph to resemble the constellation Ursa Minor.

### Controls
Click on a node to fix or unfix the node in position.\
When dragging a node, hold ctrl when releasing to toggle fixing the node in place
