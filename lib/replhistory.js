// some fixes and modifications from inital repl.history of tmpvar

'use strict';

var fs = require('fs');
var _repl, _file;

module.exports = {

	'start': function (repl, file) {

		_repl = repl;
		_file = file;

		try {
			fs.statSync(file);
			repl.rli.history = fs.readFileSync(file, 'utf-8').split('\n').reverse();
			repl.rli.history.shift();
			repl.rli.historyIndex = -1;
		} catch (e) {}

		var fd = fs.openSync(file, 'a');
		
		repl.rli.addListener('line', function(code) {
			if (code) {
				fs.write(fd, code + '\n');
			} else if (code !== '') {
				repl.rli.historyIndex++;
				repl.rli.history.pop();
			}
		});

		process.on('exit', function() {
			fs.closeSync(fd);
		});

	},

	'show': function() {
		var out = [];
		_repl.rli.history.forEach(function(v) {
			out.push(v);
		});
		_repl.outputStream.write(out.reverse().join('\n') + '\n');
		_repl.displayPrompt();
	},

	'flush': function () {
		_repl.rli.history = [];
		var so = fs.unlink(_file);
	}

};
