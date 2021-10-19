## Generate Custom Metadata
#### Table of Contents
- [Setup](#setup)
- [How To Use It?](#how-to-use-it)
  - [Create The CSV](#create-the-csv)
  - [Run The Command](#run-the-command)
- [Example](#example)
### Setup
1. If not already installed, download and install NodeJS from [here](https://nodejs.org/en/download/)
2. Clone or download the repository
3. Navigate to the root of the repository
4. Run `npm install` to download dependencies
### How To Use It?
#### Create The CSV
The CSV file should be generated so that one column represents the label of the Custom Metadata record and the other columns represent the API name of the fields to map to.

| Label | ApiName1__c | ApiName2__c | ... | ApiNameN__c |
|-------|-------------|-------------|-----|-------------|
| Test1 | Value1      | Value2      | ... | ValueN      |
| Test2 | Value1      | Value2      | ... | ValueN      |
#### Run The Command
```
USAGE
  $ node metadata-creator.js -f <filepath> -l <string> -t <string> [-o <filepath>]
  
OPTIONS
  -f, --file                   path to csv file to load
  
  -h, --help                   command reference
  
  -l, --label                  column header in csv that represents 
                               the label of the metadata type
                               
  -o, --output-dir             path to output directory
  
  -t, --metadata-type          api name of the metadata type to use
```
### Example
**_Test.csv_** is included as an example in the repo. To run, execute the following command...

`node metadata-creator.js -f test.csv -l Label -t Test__mdt`