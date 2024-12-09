var request = require('request');
const { defaultId, systemPrompt, getOutputFromBody, appsList, checkPrompt, errorCheck } = require('./request');

function textRequest(headers, res, prompt, model, type, urls, systemId, startingMessage) {
    if (!!systemId === false) systemId = defaultId;

    if (systemPrompt && startingMessage !== 'true') {
        if (prompt.endsWith(' ')) {
            prompt = prompt.slice(0, -1);
        }
        if (prompt.endsWith('.') ||
            prompt.endsWith('?') ||
            prompt.endsWith('!')) {
            systemPrompt = `\n${systemPrompt}`;
        }
        else {
            systemPrompt = `.\n${systemPrompt}`;
        }
        prompt += systemPrompt;
    }

    const pContent = [
        {
            'type': 'text',
            'text': prompt
        },
    ];

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
    };

    var payload = payloadTemplate;

    if (type == 'image') {
        if (!!urls) {
            urls.forEach(function(u) {
                payload.messages[0].content.push({
                    'type': 'image_url',
                    'image_url': {
                        'url': u
                    }
                });
            });
        }
    }

    request.post(
        {
            headers: headers,
            url: 'https://api.openai.com/v1/chat/completions',
            body: JSON.stringify(payload),
        },
        function(error, result, body) {
            body = JSON.parse(body);
            var output = getOutputFromBody(body);
            var currentApp;
            if (!!appsList) {
                appsList.forEach(function(a) {
                    if (output.startsWith(`${a}(`) &&
                        (output.endsWith(')') || output.endsWith(');'))) {
                        currentApp = a;
                    }
                });
            }
            var isApp = false;
            if (!!currentApp) {
                isApp = true;
            }

            // console.log(startingMessage)
            if (startingMessage === 'true') res.send({ status: 'OK', content: output });
            else if (isApp) res.send({ status: 'appOK', content: output });
            else {
                var cPayload = payloadTemplate;
                cPayload.messages[0].content[0].text = checkPrompt;
                console.log(checkPrompt);
                request.post(
                    {
                        headers: headers,
                        url: 'https://api.openai.com/v1/chat/completions',
                        body: JSON.stringify(cPayload),
                    },
                    function(cError, cResult, cBody) {
                        cBody = JSON.parse(cBody);
                        var cOutput = getOutputFromBody(cBody);
                        if (cOutput === 'not good') {
                            if (errorCheck.includes('{errorMessage}')) {
                                errorCheck = errorCheck.replace('{errorMessage}', output);
                            }
                            var ePayload = payloadTemplate;
                            ePayload.messages[0].content[0].text = errorCheck;
                            request.post(
                                {
                                    headers: headers,
                                    url: 'https://api.openai.com/v1/chat/completions',
                                    body: JSON.stringify(ePayload),
                                },
                                function(cError, cResult, eBody) {
                                    eBody = JSON.parse(eBody);
                                    output = getOutputFromBody(eBody);
                                    res.send({ status: 'Error', content: output });
                                }
                            );
                        }
                        else {
                            res.send({ status: 'OK', content: output });
                        }
                    }
                );
            }
        }
    );
}
exports.textRequest = textRequest;
