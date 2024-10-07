 const variablesRe = /[#=]{2}[\-a-zA-Z0-9\:]+/gi
 const htmlTags = /\<[a-zA-Z\ \/]+\>/gi

export const cleanShapeContent = (shapeContent: string, stripHtml: boolean = false): string => {
  const withoutHtmlTags = shapeContent.split('<p>').join('').split('</p>').join('')
  const variables = withoutHtmlTags.match(variablesRe)
  const withoutVariables = Array.isArray(variables) ? variables.reduce((content, variable) => content.split(variable).join(''), withoutHtmlTags) : withoutHtmlTags

  if (stripHtml) {
    const tags = withoutVariables.match(htmlTags)
    const withoutTags = Array.isArray(variables) ? tags.reduce((content, tag) => content.split(tag).join(''), withoutVariables) : withoutVariables
    return withoutTags
  } else {
    return withoutVariables
  }
}