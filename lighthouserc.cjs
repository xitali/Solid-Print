module.exports={ci:{
  collect:{url:['http://127.0.0.1:3000/','http://127.0.0.1:3000/projekty'],numberOfRuns:3,settings:{chromeFlags:'--no-sandbox --headless',onlyCategories:['performance','accessibility']}},
  assert:{assertions:{'cumulative-layout-shift':['error',{maxNumericValue:0.1}],'largest-contentful-paint':['error',{maxNumericValue:3000}],'total-blocking-time':['error',{maxNumericValue:200}],'total-byte-weight':['error',{maxNumericValue:1500000}] }},
  upload:{target:'filesystem',outputDir:'artifacts/lighthouse'}
}}
