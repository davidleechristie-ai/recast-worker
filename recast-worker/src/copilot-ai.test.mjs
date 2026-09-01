
import assert from 'node:assert/strict';
import { normaliseAiDefinition, applyExplicitComparisonOutput, interpretWithAi, extractOutputText } from './copilot-ai.js';

let passed=0;

{
  const def=normaliseAiDefinition({
    name:'CSV comparison',
    steps:[{mode:'compareStep',params:{format:'csv',outputFormat:'xml',differencesOnly:true}}],
    notes:['Compare by reference input.'],
    requiresConfiguration:true,automation:false,directTool:null
  });
  assert.equal(def.steps[0].mode,'compareStep');
  assert.equal(def.steps[0].params.format,'csv');
  assert.equal(def.steps[0].params.outputFormat,'xml');
  assert.equal(def.source,'ai');
  passed++;
}
{
  const def=applyExplicitComparisonOutput(normaliseAiDefinition({
    name:'Compare',steps:[{mode:'compareStep',params:{format:'csv'}}],notes:[],
    requiresConfiguration:true,automation:false,directTool:null
  }),'compare two CSV files and output differences in XML');
  assert.equal(def.steps[0].params.outputFormat,'xml');
  passed++;
}
{
  const def=normaliseAiDefinition({
    name:'Schema',
    steps:[],notes:[],requiresConfiguration:false,automation:false,
    directTool:{slug:'json-schema-generator',label:'JSON Schema Generator'}
  });
  assert.equal(def.directAction.href,'/tools/json-schema-generator.html');
  passed++;
}
{
  const def=normaliseAiDefinition({
    name:'Hallucinated',
    steps:[{mode:'deleteDatabase',params:{}}],
    notes:[],requiresConfiguration:false,automation:false,directTool:null
  });
  assert.equal(def.steps.length,0);
  assert.ok(def.directAction?.fallback);
  passed++;
}
{
  const def=normaliseAiDefinition({
    name:'Clean and export',
    steps:[
      {mode:'flatten',params:{dangerous:'ignored'}},
      {mode:'transformRemove',params:{paths:['internal_id','secret']}},
      {mode:'json2csv',params:{}}
    ],
    notes:[],requiresConfiguration:false,automation:false,directTool:null
  });
  assert.deepEqual(def.steps.map(x=>x.mode),['flatten','transformRemove','json2csv']);
  assert.deepEqual(def.steps[1].params.paths,['internal_id','secret']);
  passed++;
}
{
  const def=normaliseAiDefinition({
    name:'Recurring export',
    steps:[{mode:'json2csv',params:{}}],
    notes:[],requiresConfiguration:false,automation:true,directTool:null
  });
  assert.equal(def.automation,true);
  passed++;
}
{
  const def=normaliseAiDefinition({
    name:'Fetch API',
    steps:[{mode:'apiRequestStep',params:{method:'get',url:'http://unsafe.example.com'}}],
    notes:[],requiresConfiguration:false,automation:false,directTool:null
  });
  assert.equal(def.steps.length,0); // only HTTPS survives validation
  passed++;
}
{
  const data={output:[{content:[{type:'output_text',text:'{"ok":true}'}]}]};
  assert.equal(extractOutputText(data),'{"ok":true}');
  passed++;
}
{
  const mockFetch=async (url,opts)=>({
    ok:true,status:200,
    async json(){return {output_text:JSON.stringify({
      name:'Compare CSV by meaning',
      steps:[{mode:'compareStep',params:{format:'csv',differencesOnly:true}}],
      notes:['Reference file required'],
      requiresConfiguration:true,automation:false,directTool:null
    })};}
  });
  const def=await interpretWithAi('tell me what changed between these two spreadsheet exports',{
    OPENAI_API_KEY:'test-key',OPENAI_MODEL:'gpt-5.6-luna'
  },{fetch:mockFetch,resolveSecret:async x=>x});
  assert.equal(def.steps[0].mode,'compareStep');
  assert.equal(def.steps[0].params.format,'csv');
  passed++;
}
{
  let body;
  const mockFetch=async (url,opts)=>{
    body=JSON.parse(opts.body);
    return {ok:true,status:200,async json(){return {output_text:JSON.stringify({
      name:'Schema tool',steps:[],notes:[],requiresConfiguration:false,automation:false,
      directTool:{slug:'json-schema-generator',label:'JSON Schema Generator'}
    })};}};
  };
  await interpretWithAi('work out a contract for the shape of this JSON',{OPENAI_API_KEY:'x'},{fetch:mockFetch,resolveSecret:async x=>x});
  assert.equal(body.text.format.type,'json_schema');
  assert.equal(body.text.format.strict,true);
  assert.ok(body.instructions.includes('Understand intent semantically'));
  passed++;
}

{
  const bodies=[];
  let calls=0;
  const mockFetch=async (url,opts)=>{
    bodies.push(JSON.parse(opts.body));
    calls++;
    if (calls === 1) return {
      ok:false,status:400,
      async json(){return {error:{message:'Invalid schema for response_format: text.format schema is not valid'}};}
    };
    return {ok:true,status:200,async json(){return {output_text:JSON.stringify({
      name:'CSV export',steps:[{mode:'json2csv',params:{}}],notes:[],
      requiresConfiguration:false,automation:false,directTool:null
    })};}};
  };
  const def=await interpretWithAi('convert JSON to CSV',{OPENAI_API_KEY:'x'},{fetch:mockFetch,resolveSecret:async x=>x});
  assert.equal(calls,2);
  assert.equal(bodies[0].text.format.type,'json_schema');
  assert.equal(bodies[1].text.format.type,'json_object');
  assert.equal(def.steps[0].mode,'json2csv');
  passed++;
}

{
  let calls=0;
  const mockFetch=async ()=>{
    calls++;
    return {ok:false,status:401,async json(){return {error:{message:'invalid API key'}};}};
  };
  await assert.rejects(
    interpretWithAi('convert JSON to CSV',{OPENAI_API_KEY:'bad'},{fetch:mockFetch,resolveSecret:async x=>x}),
    e=>e.code==='ai_provider_error' && e.status===502
  );
  assert.equal(calls,1); // authentication failures must not be retried
  passed++;
}

{
  for (const failure of [
    {status:429,message:'Rate limit reached'},
    {status:400,message:'You have no credits remaining. Add credits to continue using the API.'},
    {status:429,message:'You exceeded your current quota'}
  ]) {
    const mockFetch=async ()=>({
      ok:false,status:failure.status,
      async json(){return {error:{message:failure.message}};}
    });
    await assert.rejects(
      interpretWithAi('convert JSON to CSV',{OPENAI_API_KEY:'x'},{fetch:mockFetch,resolveSecret:async x=>x}),
      e=>e.code==='ai_unavailable' && e.status===503 &&
        e.message==='AI interpretation is temporarily unavailable'
    );
  }
  passed++;
}


{
  const { schema } = await import('./copilot-ai.js');
  function assertClosed(node, path='root') {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'object') {
      assert.equal(node.additionalProperties,false,`${path}: object schema must set additionalProperties:false`);
      const props=node.properties||{};
      assert.deepEqual(new Set(node.required||[]),new Set(Object.keys(props)),`${path}: strict object must require every property`);
    }
    for (const [k,v] of Object.entries(node)) {
      if (Array.isArray(v)) v.forEach((x,i)=>assertClosed(x,`${path}.${k}[${i}]`));
      else if (v && typeof v === 'object') assertClosed(v,`${path}.${k}`);
    }
  }
  assertClosed(schema());
  passed++;
}

console.log(`\n${passed} AI Copilot tests passed, 0 failed`);

