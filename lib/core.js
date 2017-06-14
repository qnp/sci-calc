/*
 * core of sci-calc
 * https://github.com/qnp/sci-calc
 *
 * Copyright (c) 2013 François Risoud
 * Licensed under the MIT license.
 */

'use strict';

var PRECISION = 12;
var MAX_SCI = 1e+5;
var MIN_SCI = 1e-3;

var repl = require('repl');
var color = require('colors');
var history = require('./replhistory.js');
var fs = require('fs');

var help = require('./help.js');
var MathExtent = require('./math.js');

var funcFile = process.env.HOME+'/.sc_save';

var rexFunc = /^([a-zA-Z]\w*)\s*\(\s*([a-zA-Z][A-Za-z0-9_\,\s]*)\)\s*=\s*([^=]+)\s*$/;
var rexVar = /^([a-zA-Z]\w*)\s*=\s*([^=]+)\s*$/;
var rexArg = /^(save|remove|search|load|show|forget|help)\s*([a-zA-Z_-][A-Za-z0-9_]*)\s*$/;
var rexNoArg = /^(load|show|reset|exit|help|history|flushistory)\s*$/;
var rexPow = /\*{2,2}/;
var rexPowInvalid = /\*{3,}/g;

var okStr = '['+'√'.green.bold+'] ';
var badStr = '['+'×'.red.bold+'] ';
var listProtected = (' (for listing, type: '+'help -p'.bold+')').grey;
var listMath = (' (for listing, type: '+'help -m'.bold+')').grey; 
var liStr = '. ';

var context;
var globalPropCopy = [];
var protectedProp = [];
var powaFragments = [];

var helpInterface = false;
var helpNum = 0;

var mapCmd = {};
var declared = {};

var prmpt = '> ';
var optL = false;

process.argv.forEach(function(val, index, array) {
 	if (index == 2 && val == "-l") {
		prmpt = ''
		optL = true;
	}
});

var opts = { 
			'prompt' : prmpt,
			'eval' : customEval
		};

function init() {
	globalPropCopy = Object.getOwnPropertyNames(global);
	Object.getOwnPropertyNames(Math).forEach(function(mathFunc) {
		global[mathFunc] = Math[mathFunc];
	});
	Object.getOwnPropertyNames(MathExtent).forEach(function(mathFunc) {
		global[mathFunc] = MathExtent[mathFunc];
	});
	protectedProp = Object.getOwnPropertyNames(Math).concat(Object.getOwnPropertyNames(MathExtent));
	context = repl.start(opts).context;
	history.start(repl.repl, process.env.HOME + '/.sc_history');
	
	var fd = fs.openSync(funcFile,'a'); // create save file if not exists
	fs.closeSync(fd);
	
	repl.repl.commands = []; // erase native repl commands
}

function customEval(cmd, ctx, filename, callback) {
	if (helpInterface) {
		helpNum++;
		commands.help();
	} else {
		//if (ctx) cmd = cmd.substring(1,cmd.length-2);
		var globalAttack = false;
		globalPropCopy.forEach(function(prop) { // check if cmd involves in any part a protected global name
			if (cmd.match('^'+prop+'(\\.|$)')) globalAttack = true;
		});
		if (globalAttack) {
			console.log('GlobalError: Cannot access global variable'.red+listProtected);
			repl.repl.displayPrompt();
		} else {
			powaFragments = [];
			var goodPowa = checkPowa(cmd); // check and parse ** to pow
			if (goodPowa) cmd = treatPowa(cmd);
			if (!cmd) {
				repl.repl.displayPrompt();
			} else if (cmd.match(rexVar)) { // variable declaration
				var prep = treatVarCmd(cmd);	
				declare(prep.name,prep.str,cmd);
				if (ctx) repl.repl.displayPrompt();
			} else if (cmd.match(rexFunc)) { // function declaration
				var prep = treatFuncCmd(cmd);	
				declare(prep.name,prep.str,cmd);
				if (ctx) repl.repl.displayPrompt();
			} else if (cmd.match(rexArg)) { // UI command with arg
				var c = rexArg.exec(cmd);
				try {
					commands[c[1]](c[2]);
				} catch(e) {
					console.log(e.toString().red);
				}
				repl.repl.displayPrompt();
			} else if (cmd.match(rexNoArg)) { // UI command without arg
				try {
					commands[rexNoArg.exec(cmd)[1]]();
				} catch(e) {
					console.log(e.toString().red);
				}
				if (!helpInterface) repl.repl.displayPrompt();
			} else { // try to eval entry
				try {
					if (goodPowa) {
						var result = global.eval(cmd);
						if (typeof(result) === 'undefined') {
							repl.repl.displayPrompt();
						} else if (typeof(result) === 'function') {
							logFunction(result);
						} else if (typeof(result) === 'number') {
							global.Ans = global.ans = result;
							result = formatResult(result);
							if (optL) console.log(result);
							else console.log(result.blue.bold);
							repl.repl.displayPrompt();
						} else {
							callback(null, result);
						}
					} else {
						repl.repl.displayPrompt();
					}
				} catch(e) {
					if (e.type === 'not_defined') console.log('undefined'.grey);
					else console.log(e.toString().red);
					repl.repl.displayPrompt();
				}
			}
		}
	}
}

function formatResult(result) {
	if (result.toString().length > 14) result = parseFloat(result.toPrecision(PRECISION));
	if (result >= MAX_SCI || (result <= MIN_SCI && result != 0)) result = result.toExponential();
	return result.toString();
}

function treatFuncCmd(cmd) {
	var split = rexFunc.exec(cmd);
	return {
		'name': split[1],
		'varName': split[2],
		'lhs': split[3],
		'str': '(function() { return function('+split[2]+') { return '+split[3]+'} })()'
	};
}

function declare(name,str,cmd) {
	var pureCmd = cmd.replace(/ /g,'');
	if (notInGlobal(name)) {
		try {
			var result = eval(str);
			global[name] = result;
			mapCmd[name] = pureCmd;
			declared[name] = pureCmd;
		} catch(e) {
			console.log(e.toString().red);
		}
	}
}

function treatVarCmd(cmd) {
	var split = rexVar.exec(cmd);
	return {
		"name": split[1],
		"lhs": split[2],
		"str": '(function() { return '+split[2]+'})()'
	};
}

function logFunction(func) {
	console.log('[Function] '.cyan+(func.toString().replace(/(\n|\t| |return|function|})/g,'').replace('{',' => ')));
	repl.repl.displayPrompt();
}

function notInGlobal(name) {
	var not = true;
	protectedProp.forEach(function(prop) {
		if (name === prop) {
			not = false;
			console.log(('AssignmentError: Native constant or function '+name.bold+' cannot be overwritten').red+listMath);
		}
	});
	globalPropCopy.forEach(function(prop) {
		if (name === prop) {
			not = false;
			console.log('GlobalError: Cannot access global variable'.red+listProtected);
		}
	});
	return not;
}

function checkPowa(cmd) {
	var inv = cmd.match(rexPowInvalid);
	if (inv) {
		console.log(('SyntaxError: Invalid power token '+inv[0]).red);
		return false;
	} else return true;
}

function treatPowa(cmd) {
	var found = cmd;
	var newCmd = cmd
	while(found) {
		found = loopPowa(newCmd);
		if (found) newCmd = found;
	}
	if (newCmd != cmd) console.log(('[ '+newCmd+' ]').grey);
	return newCmd;
}

function findScope(cmd,id,incr) {
	var inc = incr/abs(incr);
	var s = []; s[1] = '('; s[-1] = ')';
	var rexOp = new RegExp('[-\\+\\*\\/\\'+s[-inc]+'= ]');
	var scope;
	var scOpen = 0;
	var found = cmd[id+inc] == s[inc];
	var i,j,k;
	for (i=id+inc; i>=0 && i<cmd.length; i+=inc) {
		if (found) {
			if (cmd[i] == s[inc]) {
				scOpen++;
				for (j=i+inc; j>=0 && j<cmd.length; j+=inc) {
					if (cmd[j] == s[inc]) scOpen++;
					if (cmd[j] == s[-inc]) {
						scOpen--;
						if (scOpen == 0) {
							if (inc<0) {
								if (j==0) {
									scope = cmd.substring(j,id+inc+1);
									break;
								} else if (cmd[j-1].match(rexOp)) {
									scope = cmd.substring(j,id+inc+1);
									break;
								} else {
									for (k=j-1; k>=0; k--) {
										if (cmd[k].match(rexOp)) {
											scope = cmd.substring(k+1,id+inc+1);
											break;
										} else if (k==0) {
											scope = cmd.substring(k,id+inc+1);
										}
									}
								}
							} else {
								scope = cmd.substring(id+inc,j+1);
								break;
							}
						}
					}
					if (scope) break;
				}
			}
			if (scope) break;
		} else {
			if (inc>0 && cmd[i].match('\\'+s[inc])) {
				found = true;
				i--;
			} else if (cmd[i].match(rexOp)) {
				scope = inc>0 ? cmd.substring(id+inc,i) : cmd.substring(i+1,id+inc+1);
				break;
			} else if (i==0) {
				scope = cmd.substring(i,id+inc+1);
			} else if (i==cmd.length-1) {
				scope = cmd.substring(id+inc,i+1);
			}
		}
	}	
	return scope;
}

function loopPowa(cmd) {
	var powa = cmd.match(rexPow);
	if (powa) {
		var scl = findScope(cmd,powa.index,-1);
		var scr = findScope(cmd,powa.index+1,1);
		return cmd.replace(scl+'**'+scr,'pow('+removeBraKets(scl)+','+removeBraKets(scr)+')');
	} else return false;
}

function removeBraKets(scope) {
	var len = scope.length;
	if (scope[0] == '(' && scope[len-1] == ')') return scope.substring(1,len-1);
	else return scope;
}

function del(func) {
	delete global[func];
	delete mapCmd[func];
	delete declared[func];
}

function showHelp(num) {
	switch (num) {
		case 0: console.log(help.general.join('\n')); break;
		case 1: console.log(help.commands.join('\n')); break;
		case 2: console.log(help.math.join('\n')); 
		        writePropCol(protectedProp);
						break;
		case 3: console.log(help.protected.join('\n')); 
		        writePropCol(globalPropCopy);
						break;
	}
	if (num < 3) process.stdout.write('(NEXT)');
	else {
		helpInterface = false;
		helpNum = 0;
		repl.repl.displayPrompt();
	}
}

function writePropCol(array) {
	var maxSize = 0;
	var cols = process.stdout.columns;
	array.forEach(function(prop) {
		if (prop.length > maxSize) maxSize = prop.length;
	});
	maxSize+=5;
	var numCol = floor(cols/maxSize);
	var blank = '';
	for (var i=0; i<maxSize+1; i++) blank += ' ';
	array.forEach(function(prop,i) {
		process.stdout.write(prop+blank.substring(0,maxSize-prop.length));
		if ((i+1)%numCol == 0 || i == array.length-1) process.stdout.write('\n');
	});
	process.stdout.write('\n');
}

var commands = {

	save: function(func) {
		var cmd = mapCmd[func];
		var undef = false;
		try {
			eval(func); 
		} catch(e)	{
			undef = true;
			console.log(badStr+('cannot saved undefined declaration of '+func.bold).grey);
		}
		if (!undef) {
			var exist = false;
			if (commands.search(func,true)) {
				exist = true;
				commands.remove(func,true);
			}
			fs.appendFileSync(funcFile, '\n'+cmd);
			if(!exist) console.log(okStr+'saved'.grey);
			else console.log(okStr+'saved (removed old declaration)'.grey);
		}
	},

	load: function(func) {
		var loaded = false;
		var id = (func ? commands.search(func) : 0);
		fs.readFileSync(funcFile).toString().split('\n').forEach(function(line,i) {
			if (line) {
				if (func === undefined) {
					customEval(line);	
					console.log(' '+liStr.green+' '+line);
					loaded = true;
				} else {
					if (id && i == id-1) {
						customEval(line);
						console.log(' -> '+line);
						loaded = true;
					}
				}
			}
		});
		if (loaded) console.log(okStr+'loaded'.grey);
		else console.log(badStr+'not loaded'.grey);
	},

	forget: function(func) {
		del(func);
		console.log(okStr+('function or variable '+func.bold+' forgotten').grey);
	},

	reset: function() {
		var forgotten = '';
		var empty = true;
		Object.getOwnPropertyNames(declared).forEach(function(func) {
			empty = false;
			del(func);
			forgotten += func.bold+', ';
		});
		if (empty) console.log(badStr+('nothing to reset').grey);
		else console.log(okStr+('function(s) and/or variable(s) '+forgotten+'forgotten').grey);
	},

	show: function(opt) {
		var s = true, d = true;
		if (opt === 'saved') d = false;
		else if (opt === 'declared') s = false;
		if (s) {
			console.log('saved'.cyan.underline+': '.cyan);
			fs.readFileSync(funcFile).toString().split('\n').forEach(function(line) {
				if (line) {
					console.log(liStr.cyan+line);
				}
			});
		}
		if (d) {
			console.log('declared'.yellow.underline+': '.yellow);
			Object.getOwnPropertyNames(declared).forEach(function(func) {
				console.log(liStr.yellow+declared[func]);
			});
		}
	},

	remove: function(func,silent) {
		var id = commands.search(func,silent);
		var buffer = '';
		if (id) {
			var array = fs.readFileSync(funcFile).toString().split('\n');
			array.forEach(function(line,i) {
				if (line && i != id-1) {
					if (i == 0 || (i == 1 & id == 1)) buffer += line;
					else buffer += '\n'+line;
				}
			});
			var fd = fs.openSync(funcFile, 'w');
			fs.writeSync(fd, buffer);
			fs.closeSync(fd);
			del(func);
			if (!silent) console.log(okStr+'removed'.grey);
		}
	},

	search: function(func,silent) {
		var rex = new RegExp('^'+func+'(\\(|=)');
		var id = 0;
		fs.readFileSync(funcFile).toString().split('\n').forEach(function(line,i) {
			if (line && line.match(rex)) id = i+1;
		});
		if (!silent) {
			if (id) console.log(okStr+'found'.grey);
			else console.log(badStr+'not found'.grey);
		}
		return id;
	},

	help: function(opt) {
		if (opt === undefined) {
			helpInterface = true;
			if (helpNum == 0) console.log(help.title.join('\n'));
			showHelp(helpNum);
		} else if (opt === '-g' || opt === '--general') {
			showHelp(0);
		} else if (opt === '-c' || opt === '--commands') {
			showHelp(1);
		} else if (opt === '-m' || opt === '--math') {
			showHelp(2);
		} else if (opt === '-p' || opt === '--protected') {
			showHelp(3);
		} else {
			console.log(badStr+('unknown help option '+opt.toString().bold).grey);
		}
	},

	flushistory: function() {
		history.flush();
		console.log(okStr+'history flushed'.grey);
	},

	history: function() {
		history.show();
	},

	exit: function() {
		process.exit();
	}

}

process.openStdin().on('keypress', function(chunk, key) {
  if (key && key.name === 'c' && key.ctrl) {
  	helpInterface = false;
		helpNum = 0;
	} else if (helpInterface && (key.name === 'up' || key.name === 'down')) { //hack not show historic traversing in help
		var blank = '';
		for (var i=0; i<process.stdout.columns; i++) blank += ' ';
		setTimeout(function(){process.stdout.write('\r'+blank+'\r(NEXT)')},5);
	}
});

module.exports = {
	'init' : init
};
