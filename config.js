var config = {
  defaultSystemId: '$[systemPrompt]', 
  systemPrompt: 'PLEASE MAKE NO MENTION OF ANY TRANSPARENT PORTIONS OF THE IMAGES. PLEASE DO NOT ADD ANYTHING ELSE TO THE DESCRIPTION. ONLY PROVIDE THE DESCRIPTION. PLEASE MAKE NO MENTION OF ME.', 
  checkPrompt: `Do you think that the AI has fulfilled the users request? If yes, then respond with "good" and if no, then respond with "not good", if you don't know respond with "not good".

Users request: \`\`\`{userPrompt}\`\`\`

AI Response: \`\`\`{aiResponse}\`\`\``, 
  errorCheck: `Reword this error message to plain terms without any technical details. MAKE SURE TO EXPLAIN WHY THE AI IS NOT ABLE TO FULFILL THE USERS REQUEST. DO NOT USE ANY QUOTES IN YOUR RESPONSE.

Error message: \`\`\`{errorMessage}\`\`\``, 
}

exports.default = config