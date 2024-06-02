const rrmlElementToHtmlElement = {
  body: "p",
  header: "h1",
  subheader: "h2",
  card: "div",
};

const rrmlElementToStyles = {
  card: "style='border: 1px solid black; padding: 20px; margin: 10px 0px; border-radius: 10px;'",
};

const RRML2HTML = (rrml) => {
  let htmlString = rrml;
  for (const [rrmlTag, htmlTag] of Object.entries(rrmlElementToHtmlElement)) {
    const style = rrmlElementToStyles[rrmlTag];
    const openTagRegex = new RegExp(`<${rrmlTag}>`, "g");
    const closeTagRegex = new RegExp(`</${rrmlTag}>`, "g");
    const openHtmlString = style ? `<${htmlTag} ${style}>` : `<${htmlTag}>`;
    htmlString = htmlString.replace(openTagRegex, openHtmlString);
    htmlString = htmlString.replace(closeTagRegex, `</${htmlTag}>`);
  }
  const linkRegex = /<link href="(.*?)">(.*?)<\/link>/g;
  htmlString = htmlString.replace(linkRegex, '<a href="$1">$2</a>');

  return htmlString;
};

module.exports = RRML2HTML;
