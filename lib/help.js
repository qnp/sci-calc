/*
 * mathematical functions for sci-calc
 * https://github.com/francoisrisoud/sci-calc
 *
 * Copyright (c) 2013 François Risoud
 * Licensed under the MIT license.
 */

'use strict';

module.exports = {

	title: [
		'                                                                         '.magenta.underline,
		'                               SCI-CALC HELP                             '.magenta.underline
	],

	general: [
		'GENERAL'.bold,
		'This calculator relies on '+'Javascript'.bold+' and supports all the fantastic',
		'features of this langage. For help about standard calculations, ',
		'please refer to Javascript topics. We added some powerfull features:',
		'Power'.bold.underline+':',
		'  operation '+'**'.red+' is supported and will be parsed with a '+'pow'.bold+' function',
		'  eg: (4+x)**2 => pow(4+x,2), cos(x)**2 => pow(cos(x),2)'.grey,
		'Variable declaration'.bold.underline+':'+' {name}'.cyan+'='+'{expression}'.cyan,
		'  eg: c=4, k=sin(0.1)*PI, z=c+k'.grey,
		'Function declaration'.bold.underline+': '+'{name}'.cyan+'('.bold+'{var}'.cyan+')'.bold+'='+'{expression}'.cyan,
		'  eg: f(x)=4*x, Fk(x,y,z)=k*x+3*y+exp(z)'.grey,
		'  For a list of the protected names, type '+'help -p'.bold,
		' '
	],

	commands: [
		'COMMANDS'.bold,
		
		'save x'.bold+': save declared variable or function '+'x'.bold,
		'load x'.bold+': load saved variable or function '+'x'.bold,
		'show [opt]'.bold+': show [-s --saved] and [-d --declared] variables and functions',
		'search x'.bold+': search if variable or function '+'x'.bold+' is saved',
		'remove'.bold+': remove saved variable or function '+'x'.bold,
		' ',
		'forget x'.bold+': forget declared variable or function '+'x'.bold,
		'reset'.bold+': forget all declared variables and functions',
		' ',
		'flushistory'.bold+': clear all history',
		'help [opt]'.bold+': show this help, or special sections [opt]:',
		'            [-g --general]   general help',
		'            [-c --commands]  list of commands',
		'            [-m --math]      list of available math functions',
		'            [-p --protected] list of protected names',
		'exit'.bold+': exit sci-calc',
		' '
	],

	math: [
		'MATH'.bold,
		'List of the available math constants and functions (read-only):'.grey
	],

	protected: [
		'PROTECTED'.bold,
		'The following names are protected and cannot be accesed or overwritten:'.grey
	]

}

