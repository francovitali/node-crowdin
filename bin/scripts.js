"use strict";
//Config loggin level
var logger = require('winston');
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
	level: 'debug',
	colorize: true,
	timestamp: true
});

var path = require('path');
var fs = require('fs');
var request = require('request');
var exec = require('child_process').exec;
var AdmZip = require('adm-zip');

var CONFIG_PATH = path.join(process.cwd(), 'i18n.json');
var i18nConfig = require(CONFIG_PATH);
var messagesFilename = 'messages.po';
var serviceUrl = 'http://i18n.ml.com';

function downloadTranslationsAndUnzip(callback) {
	logger.debug("Downloading translation.");

	request
		.get({ url: serviceUrl + '/apps/' + i18nConfig.app + '/translations' })
		.on('error', function (err) {
			logger.error('problem with request: ' + err.message);
			callback(err);
		})
		.pipe(fs.createWriteStream('./all.zip')
			.on('finish', function () {
				logger.info("Translations Dowloaded.");
				callback();
			}));
}

function zipAndUploadSources(filename, force, callback) {
	logger.debug('Zipping sources...');
	var filePath = './i18n/' + filename;
	var zippedFilePath = filePath + '.zip';

	// usage: https://www.npmjs.com/package/adm-zip
	var zip = new AdmZip();
	zip.addLocalFile(filePath);
	zip.writeZip(zippedFilePath);

	logger.debug('Uploading sources...');
	var formData = {};
	formData['sources.zip'] = fs.createReadStream(zippedFilePath);

	request.post({
		url: serviceUrl + '/apps/' + i18nConfig.app + '/sources?project_name=' + i18nConfig.project + '&force=' + force,
		formData: formData
	}, function (err) {
		if (err) {
			logger.error('Upload failed.', err);
		} else {
			logger.info('Sources uploaded successfully!');
		}
		callback(err);
	});
}

function initPaths(filename) {
	logger.info('Initializing...');
	if (!fs.existsSync('./i18n')) {
		fs.mkdirSync('./i18n');
	}
	if (fs.existsSync('./i18n/' + filename)) {
		fs.truncateSync('./i18n/' + filename, 0);
	} else {
		fs.writeFileSync('./i18n/' + filename, ' ');
	}
}

function removeDirectory(path) {
	exec('rm -rf ' + path, function (err) {
		if (err) {
			logger.warn("Error removing " + path + ". " + err);
		}
	});
}

function cleanOldTranslations(callback) {
	fs.unlink('./all.zip', function (error) {
		if (!error || error.code === 'ENOENT') {
			var files = fs.readdirSync('./i18n');
			files.map(function (file) {
				return path.join('./i18n', file);
			}).forEach(function (file) {
				var stats = fs.statSync(file);
				if (stats.isDirectory()) {
					removeDirectory(file);
				}
			});
			callback();
		} else {
			callback(error);
		}
	});
}

function unzipTranslations(callback) {
	logger.debug("Unziping.");
	exec('unzip ./all.zip -d i18n',
		function (err) {
			if (err !== null) {
				logger.error('exec error: ' + err);
			}
			callback();
		});
}

function scanDirectory(directory, fileName, callback) {
	logger.debug("Scaning " + directory + " for source messages.");
	exec('find ' + directory + ' -iname "*.js" | xargs xgettext -j --from-code=UTF-8 --force-po --no-wrap -ktr:1 -ktrd:1 -ktrn:1,2 -ktrnd:1,2 -o i18n/' + fileName + ' -LJavaScript',
		function (error) {
			if (error) {
				logger.warn("Error scaning directory " + directory);
			}
			callback(error);
		});
}

/*******************************/

function generateSources(fileName, callback) {
	initPaths(fileName);
	scanDirectory(i18nConfig.srcPath, fileName, callback);
}

function downloadTranslations(callback) {
	if (!fs.existsSync('./i18n')) {
		fs.mkdirSync('./i18n');
	}
	cleanOldTranslations(function (error) {
		if (error) {
			logger.error("Error cleaning up old translations.");
			callback(error);
		} else {
			downloadTranslationsAndUnzip(function (error) {
				if (error) {
					logger.error("Error dowloading translations.");
					callback(error);
				} else {
					unzipTranslations(function (error) {
						if (error) {
							logger.error("Error Unziping translations.");
						} else {
							logger.info("Tranlations updated sucessfull!");
						}
						callback(error);
					});
				}
			});
		}
	});
};

function uploadSources(force, callback) {
	force = (force === true || force === 'true');

	generateSources(messagesFilename, function (error) {
		if (error) {
			callback(error);
		} else {
			zipAndUploadSources(messagesFilename, force, callback);
		}
	});
};

module.exports.generateSources = generateSources;
module.exports.downloadTranslations = downloadTranslations;
module.exports.uploadSources = uploadSources;
module.exports.messagesFilename = messagesFilename;