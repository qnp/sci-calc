# sci-calc

Command-line cientific calculator based on node REPL, with the possibility to declare functions and variables, and save them and load them. This command-line calculator possesses a permanent history.

## Getting Started
Install the module with: `npm install sci-calc`, then from the sci-calc package directory run: `npm link`
Then use it with the command: `sc`
For help, use: `help`

## Documentation
Available commands:
`save x`: save declared variable or function x
`load x`: load saved variable or function x
`show [opt]`: show [-s --saved] and [-d --declared] variables and functions
`search x`: search if variable or function x is saved
`remove`: remove saved variable or function x

`forget x`: forget declared variable or function x
`reset`: forget all declared variables and functions

`flushistory`: clear all history
`help [opt]`: show this help, or special sections [opt]:
&nbsp;&nbsp;&nbsp;`-g --general`   general help
&nbsp;&nbsp;&nbsp;`-c --commands`  list of commands
&nbsp;&nbsp;&nbsp;`-m --math`      list of available math functions
&nbsp;&nbsp;&nbsp;`-p --protected` list of protected names
`exit`: exit sci-calc

## Contributing
Feel free to contribute to this project

## License
Copyright (c) 2015 François Risoud
Licensed under the MIT license.
