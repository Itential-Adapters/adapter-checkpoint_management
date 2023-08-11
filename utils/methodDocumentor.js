/* eslint global-require:warn */
/* eslint import/no-dynamic-require:warn */
/* eslint no-param-reassign:warn */

const fs = require('fs-extra');
const esprima = require('esprima');

// Getting the base directory:
let adaptdir = __dirname;
if (adaptdir.endsWith('/utils')) {
  adaptdir = adaptdir.substring(0, adaptdir.length - 6);
}

function createObjectForFunction(
  funcName,
  funcArgs,
  entityPath,
  description,
  workflow
) {
  const funcObject = {};
  // if the entity path is not set, then the object is not created.
  if (entityPath !== undefined) {
    funcObject.method_signature = `${funcName}(${funcArgs.join(', ')})`;
    funcObject.path = entityPath;
    if (description === undefined) {
      funcObject.description = '';
      funcObject.workflow = 'No';
    } else {
      funcObject.description = description;
      funcObject.workflow = workflow;
    }
  }
  return funcObject;
}

function getPathFromEntity(entity, funcName) {
  let epath;
  if (entity === undefined || entity === '.generic') {
    epath = undefined;
  } else {
    // Access the action.js file for the certain entity to get the path
    const entityPath = `${adaptdir}/entities/${entity}/action.json`;
    const actionJSON = require(entityPath);
    actionJSON.actions.forEach((action) => {
      if (action.name === funcName) {
        epath = action.entitypath;
      }
    });
  }
  return epath;
}

function readFileUsingLib(filename, descriptionObj, workflowObj, functionList) {
  // read the file
  const aFile = fs.readFileSync(filename, 'utf8');
  // parsing the file to get the function and class declarations.
  const aFileFuncArgs = esprima.parseScript(aFile);

  // Looping through all the declarations parsed:
  aFileFuncArgs.body.forEach((e) => {
    // Getting only the class declaration as it has our required functions.
    if (e.type === 'ClassDeclaration') {
      const methodDefinition = e.body;
      methodDefinition.body.forEach((method) => {
        // Getting method name and its params in the class.
        const funcName = method.key.name;
        const funcArgs = [];
        method.value.params.forEach((param) => {
          if (param.type === 'Identifier') {
            funcArgs.push(param.name);
          } else {
            const args = `${param.left.name} = ${param.right.value}`;
            funcArgs.push(args);
          }
        });

        // Getting the entity for the method:
        let entity;
        method.value.body.body.forEach((statementType) => {
          if (statementType.type === 'TryStatement') {
            entity = statementType.block.body[0].argument.arguments[0].value;
          }
        });
        const entityPath = getPathFromEntity(entity, funcName);

        // Creating and storing the object for the method.
        if (entityPath !== undefined) {
          functionList.push(
            createObjectForFunction(
              funcName,
              funcArgs,
              entityPath,
              descriptionObj[funcName],
              workflowObj[funcName]
            )
          );
        }
      });
    }
  });
}

function readJSONFile(filename, descriptionObj, workflowObj) {
  // Accessing the JSON file.
  const phJSON = require(filename);
  // Getting the methods array.
  const methodArray = phJSON.methods;
  methodArray.forEach((methodName) => {
    // Getting the method description and workflow:
    const funcName = methodName.name;
    descriptionObj[funcName] = methodName.description;
    workflowObj[funcName] = methodName.task ? 'Yes' : 'No';
  });
}

function readMDFile(filename, functionList) {
  // Reading in the .md file and creating an array with each line as an element.
  const mdFile = fs.readFileSync(filename, 'utf-8');
  const fileSplit = mdFile.split('\n');
  // Storing the data that should added later to the updated data.
  const linesToAddLater = [];
  let index = fileSplit.length - 1;

  // Removing all the blank lines at the end of the file.
  if (fileSplit[index] === '') {
    while (fileSplit[index] === '') {
      linesToAddLater.push(fileSplit.pop());
      index -= 1;
    }
  }

  // Checking if the last 2 lines are <br> and </table>. If not, the file is corrupted and the
  // data at the end of the file should be fixed.
  if (fileSplit[index] === '<br>' || fileSplit[index - 1] === '</table>') {
    // Storing <br> and </table> to add later.
    linesToAddLater.push(fileSplit.pop());
    linesToAddLater.push(fileSplit.pop());
    index -= 2;
  } else {
    console.log('The file has bad content at the end.');
    return;
  }
  // if (fileSplit[index] !== '<br>' && fileSplit[index - 1] !== '</table>') {
  //   console.log('The file has bad content at the end.');
  //   return;
  // } else {
  //   // Storing <br> and </table> to add later.
  //   linesToAddLater.push(fileSplit.pop());
  //   linesToAddLater.push(fileSplit.pop());
  //   index -= 2;
  // }

  // Removing all the lines until the header tags are reached.
  while (!fileSplit[index].includes('<th')) {
    fileSplit.pop();
    index -= 1;
  }
  // Adding </tr> for the header row, because it got removed in the above loop.
  fileSplit.push('  </tr>');

  // Creating the tags for each method to be appended to the file.
  const tdBeginTag = '    <td style="padding:15px">';
  const tdEndTag = '</td>';
  functionList.forEach((func) => {
    const signCommand = `${tdBeginTag}${func.method_signature}${tdEndTag}`;
    const descCommand = `${tdBeginTag}${func.description}${tdEndTag}`;
    const pathCommand = `${tdBeginTag}${func.path}${tdEndTag}`;
    const workflowCommand = `${tdBeginTag}${func.workflow}${tdEndTag}`;
    fileSplit.push('  <tr>');
    fileSplit.push(signCommand);
    fileSplit.push(descCommand);
    fileSplit.push(pathCommand);
    fileSplit.push(workflowCommand);
    fileSplit.push('  </tr>');
  });

  // Adding </table> and <br> at the end of the file to complete the table and the file.
  while (linesToAddLater.length > 0) {
    fileSplit.push(linesToAddLater.pop());
  }

  // Writing all the content back into the file.
  fs.writeFileSync(filename, fileSplit.join('\n'), {
    encoding: 'utf-8',
    flag: 'w'
  });
}

function getFileInfo() {
  // If files don't exist:
  if (!fs.existsSync(`${adaptdir}/adapter.js`)) {
    console.log('Missing - utils/adapter.js');
    return;
  }
  if (!fs.existsSync(`${adaptdir}/pronghorn.json`)) {
    console.log('Missing - pronghorn.json');
    return;
  }
  if (!fs.existsSync(`${adaptdir}/CALLS.md`)) {
    console.log('Missing - CALLS.md');
    return;
  }

  const descriptionObj = {};
  const workflowObj = {};

  // Get the method descriptions and the workflow values from pronghorn.json file.
  readJSONFile(`${adaptdir}/pronghorn.json`, descriptionObj, workflowObj);

  // Get the method signature, entity path and create an object that contains all the info regarding
  // the method and push it to the functionList array.
  const functionList = [];
  readFileUsingLib(
    `${adaptdir}/adapter.js`,
    descriptionObj,
    workflowObj,
    functionList
  );

  // createMarkDown(functionList);
  readMDFile(`${adaptdir}/CALLS.md`, functionList);
}

getFileInfo();
