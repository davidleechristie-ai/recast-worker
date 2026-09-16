const OPERATIONS = Object.freeze({
  json2csv:{label:'JSON to CSV',category:'convert',input:['json'],output:'csv',description:'Convert JSON records into CSV.'},
  csv2json:{label:'CSV to JSON',category:'convert',input:['csv'],output:'json',description:'Convert CSV rows into JSON records.'},
  json2xml:{label:'JSON to XML',category:'convert',input:['json'],output:'xml',description:'Convert JSON into XML.'},
  xml2json:{label:'XML to JSON',category:'convert',input:['xml'],output:'json',description:'Convert XML into JSON.'},
  flatten:{label:'Flatten',category:'reshape',input:['json'],output:'json',description:'Flatten nested JSON fields.'},
  unflatten:{label:'Unflatten',category:'reshape',input:['json'],output:'json',description:'Rebuild nested JSON from flattened fields.'},
  json2yaml:{label:'JSON to YAML',category:'convert',input:['json'],output:'yaml',description:'Convert JSON into YAML.'},
  yaml2json:{label:'YAML to JSON',category:'convert',input:['yaml'],output:'json',description:'Convert YAML into JSON.'},
  json2markdown:{label:'JSON to Markdown',category:'convert',input:['json'],output:'markdown',description:'Convert JSON records into a Markdown table.'},
  markdown2json:{label:'Markdown to JSON',category:'convert',input:['markdown'],output:'json',description:'Convert a Markdown table into JSON.'},
  transformSelect:{label:'Select fields',category:'transform',input:['json'],output:'json',description:'Keep only selected fields.',params:['paths']},
  transformRemove:{label:'Remove fields',category:'transform',input:['json'],output:'json',description:'Remove selected fields.',params:['paths']},
  transformRename:{label:'Rename field',category:'transform',input:['json'],output:'json',description:'Rename a field.',params:['from','to']},
  transformFilter:{label:'Filter records',category:'transform',input:['json'],output:'json',description:'Keep records matching a condition.',params:['field','condition','value']},
  transformSort:{label:'Sort records',category:'transform',input:['json'],output:'json',description:'Sort records by a field.',params:['field','direction']},
  transformConvertType:{label:'Convert field type',category:'transform',input:['json'],output:'json',description:'Convert values in a field to another type.',params:['field','type']},
  transformAddField:{label:'Add field',category:'transform',input:['json'],output:'json',description:'Add a default field to records.',params:['field','value']},
  transformCombine:{label:'Combine fields',category:'transform',input:['json'],output:'json',description:'Build a new field from existing values.',params:['template','newField']},
  jsonPath:{label:'Extract with JSONPath',category:'extract',input:['json'],output:'json',description:'Extract data using a JSONPath expression.',params:['path']},
  validateJsonStep:{label:'Validate JSON',category:'validate',input:['json'],output:'json',description:'Verify that the input is valid JSON.'},
  validateXmlStep:{label:'Validate XML',category:'validate',input:['xml'],output:'xml',description:'Verify that the input is valid XML.'},
  sortJson:{label:'Sort JSON keys',category:'transform',input:['json'],output:'json',description:'Sort object keys consistently.'},
  formatJson:{label:'Format JSON',category:'format',input:['json'],output:'json',description:'Parse and pretty-print JSON.'}
});

const SUPPORTED_MODES = new Set(Object.keys(OPERATIONS));
function getOperation(mode){ return OPERATIONS[mode] || null; }
function describeStep(step){
  const op=getOperation(step?.mode);
  return op ? {mode:step.mode,label:op.label,description:op.description,category:op.category,params:step.params||{}} : null;
}
function normalizePipeline(def={}){
  const steps=Array.isArray(def.steps)?def.steps.map((step,index)=>({id:step.id||`step-${index+1}`,mode:step.mode,params:step.params||{},...describeStep(step)})):[];
  return {version:2,goal:def.goal||'',input:def.input||{type:'unknown'},steps};
}
function validatePipeline(def={}){
  const pipeline=normalizePipeline(def);
  if(!pipeline.steps.length) throw new Error('pipeline must contain at least one step');
  for(const [index,step] of pipeline.steps.entries()) if(!getOperation(step.mode)) throw new Error(`unsupported pipeline step ${index+1}: ${step.mode||'missing mode'}`);
  return pipeline;
}

export { OPERATIONS, SUPPORTED_MODES, getOperation, describeStep, normalizePipeline, validatePipeline };
