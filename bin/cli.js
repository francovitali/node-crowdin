#!/usr/bin/env node

'use strict';

var program = require('commander');
var scripts = require('./scripts.js');
program.version('0.0.2');

program
	.command('gettext')
	.description('Scan sources code and generate source message file')
	.action(function() {
		scripts.generateSources(scripts.messagesFilename, console.log);
	});

program
	.command('download')
	.description('Download translations from crowdin')
	.action(function() {
		scripts.downloadTranslations(console.log);
	});

program
	.command('upload')
	.description('Upload translations to crowdin')
	.option('-f, --force', 'Force upload, removing source messages not present in the current upload')
	.action(function(option) {
		scripts.uploadSources(option.force, console.log);
	});

program.parse(process.argv);