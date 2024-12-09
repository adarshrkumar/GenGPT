var fs = require('fs');
var request = require('request'); 

var config = require('./config').default
var systemPrompt = config.systemPrompt

var checkPrompt = config.checkPrompt;
var errorCheck = config.errorCheck;

var defaultId = config.defaultSystemId;

// OpenAI API Key
var api_key = process.env['OPENAI_API_KEY']

function getOutputFromBody(response) {
  if (response.error) {
    var error = response.error
    output = error.message
  }
  else {
    var choices = response.choices
    choices.forEach(function(choice) {
      var finish_reason = choice.finish_reason
      if (finish_reason == 'stop') {
        var message = choice.message
        output = message.content
      }
    })
  }
  return output
}

function newRequest(res, prompt, model, type, urls, voice, size, systemId, startingMessage) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${api_key}`,
  };

  switch (type) {
    case 'create-image': 
      model = !!model ? model : 3
      model = `dall-e-${model}`
      imageRequest(headers, res, prompt, model, size)
      break;
    default:
      model = !!model ? model : 'turbo-preview'
      model = `gpt-4-${model}`
      textRequest(headers, res, prompt, model, type, urls, systemId, startingMessage)
      break;
  }
}

function textRequest(headers, res, prompt, model, type, urls, systemId, startingMessage) {
  if (!!systemId === false) systemId = defaultId

  if (systemPrompt && startingMessage !== 'true') {
    if (prompt.endsWith(' ')) {
      prompt = prompt.slice(0, -1)
    }
    if (
      prompt.endsWith('.') || 
      prompt.endsWith('?') || 
      prompt.endsWith('!')
    ) {
      systemPrompt = `\n${systemPrompt}`
    }
    else {
      systemPrompt = `.\n${systemPrompt}`
    }
    prompt += systemPrompt
  }

  const pContent = [
    {
      'type': 'text',
      'text': prompt
    },
  ]

  // console.log(pContent)

  const payloadTemplate = {
    'model': model,
    'messages': [
      {
        'role': 'user',
        'content': pContent
      }
    ],
    'max_tokens': 300
  }

  var payload = payloadTemplate

  if (type == 'image') {
    if (!!urls) {
      urls.forEach(function(u) {
        payload.messages[0].content.push({
          'type': 'image_url',
          'image_url': {
            'url': u
          }
        })
      })
    }
  }

request.post(
    {
      headers: headers, 
      url: 'https://api.openai.com/v1/chat/completions', 
      body: JSON.stringify(payload), 
    }, 
    function(error, result, body) {
      body = JSON.parse(body)
      var output = getOutputFromBody(body)
      // console.log(startingMessage)
      /*if (startingMessage === 'true') */res.send({status: 'OK', content: output})
      // else {
      //   if (checkPrompt.includes('{userPrompt}')) checkPrompt = checkPrompt.replace('{userPrompt}', prompt)
      //   if (checkPrompt.includes('{aiResponse}')) checkPrompt = checkPrompt.replace('{aiResponse}', output)
        
      //   var cPayload = payloadTemplate
      //   cPayload.messages[0].content[0].text = checkPrompt
        
      //   request.post(
      //     {
      //       headers: headers, 
      //       url: 'https://api.openai.com/v1/chat/completions', 
      //       body: JSON.stringify(cPayload), 
      //     }, 
      //     function(cError, cResult, cBody) {
      //       cBody = JSON.parse(cBody)
      //       var cOutput = getOutputFromBody(cBody)
      //       if (cOutput === 'not good') {
      //         if (errorCheck.includes('{errorMessage}')) {
      //           errorCheck = errorCheck.replace('{errorMessage}', output)
      //         }
      //         var ePayload = payloadTemplate
      //         ePayload.messages[0].content[0].text = errorCheck
      //         request.post(
      //           {
      //             headers: headers, 
      //             url: 'https://api.openai.com/v1/chat/completions', 
      //             body: JSON.stringify(ePayload), 
      //           }, 
      //           function(cError, cResult, eBody) {
      //             eBody = JSON.parse(eBody)
      //             output = getOutputFromBody(eBody)
      //             res.send({status: 'Error', content: output})
      //           }
      //         )
      //       }
      //       else {
      //         res.send({status: 'OK', content: output})
      //       }
      //     }
      //   )
      // }
    }
  )
}

function imageRequest(headers, res, prompt, model, size='1024x1024') {
  const payload = {
    model: model,
    prompt: prompt,
    n: 1,
    size: size, 
  };

  request.post(
    {
      headers: headers,
      url: 'https://api.openai.com/v1/images/generations',
      body: JSON.stringify(payload),
    },
    function (error, result, body) {
      body = JSON.parse(body);
      if (body.error) {
        var err = body.error.message
        res.send({content: err, status: 'Error'})
      }
      else {
        data = body['data'];
        data.forEach(function (d) {
          url = d['url'];
          var status = url.includes('://') ? 'Success' : 'Error'
          res.send({status: status, content: url});
        });
      }
    },
  );
}

exports.default = newRequest