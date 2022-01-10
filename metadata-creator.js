const { program } = require('commander');
const csv = require('csvtojson');
const convert = require('xml-js');
const fs = require('fs');

main();

async function main() {
    program
        .version('0.0.1')
        .requiredOption('-f, --file <file>', 'name of the csv file')
        .requiredOption('-l, --label <label>', 'the field in the csv file that represents the label of the custom metadata record')
        .option('-a, --api-name <api-name>', 'the field in the csv file that represents the api name of the custom metadata record')
        .requiredOption('-t, --metadata-type <type>', 'the api name of the metadata type to generate')
        .option('-o, --output-directory <directory>', 'the directory to output the generated Custom Metadata files', './output')
        .parse(process.argv);

    const args = program.opts();

    const path = __dirname + '/' + args.file;
    const rows = await csv().fromFile(path);

    const metadataFields = [];
    for (const key of Object.keys(rows[0])) {
        if (key !== args.label) metadataFields.push(key);
    }

    const apiName = !!args.apiName ? args.apiName : args.label;

    createMetadataFiles(args.metadataType, args.label, apiName, metadataFields, rows, args.outputDirectory);
}

function createMetadataFiles(type, label, apiName, metadataFields, rows, outputDirectory) {
    for (const row of rows) {
        const values = [];
        for (let i = 0; i < metadataFields.length; i++) {
            const isPopulated = !!row[metadataFields[i]];
            values.push({
                field: metadataFields[i],
                value: {
                    '_attributes': {
                        ...isPopulated && {'xsi:type': 'xsd:string'},
                        ...!isPopulated && {'xsi:nil': 'true'}
                    },
                    ...isPopulated && {'_text': row[metadataFields[i]]}
                }
            });
        }
        const metadataXML = {
            '_declaration': {
                '_attributes': {
                    'version': '1.0',
                    'encoding': 'UTF-8'
                }
            },
            CustomMetadata: {
                '_attributes': {
                    'xmlns': 'http://soap.sforce.com/2006/04/metadata',
                    'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
                    'xmlns:xsd': 'http://www.w3.org/2001/XMLSchema'
                },
                label: row[label].substr(0, 40),
                protected: false,
                values
            }
        };
        const options = {compact: true, ignoreComment: true, spaces: 4};
        const xml = convert.js2xml(metadataXML, options) + '\n';
        const fileName = type + '.' + createValidFileName(row[apiName].substr(0, 40), '.md-meta.xml');
        writeXMLFile(outputDirectory, fileName, xml);
    }
}

function writeXMLFile(directory, fileName, xml) {
    const dirPath = __dirname + (directory ? '/' + stripTrailingSlash(directory) : '');
    if (!fs.existsSync(dirPath)){
        fs.mkdirSync(dirPath);
    }

    const path = dirPath + '/' + fileName;
    fs.writeFileSync(path, xml);
}

function createValidFileName(name, extension) {
    name = !isNaN(name.charAt(0)) ? 'X' + name.replace(/[^0-9a-z]+/gi, '_') : name.replace(/[^0-9a-z]+/gi, '_');
    if(name[name.length - 1] === "_") {
        name = name.substr(0, name.length - 1);
    }
    return name + extension;
}

function stripTrailingSlash(str) {
    if(str.substr(-1) === '/') {
        return str.substr(0, str.length - 1);
    }
    return str;
}