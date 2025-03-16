import {parseSite} from './pageParser';
export async function findTextInPage(page, query) {
  const pageHtml = await parseSite(page);
  // find query string in pageHtml and return the surrounding text about 1000 characters
  const index = pageHtml.indexOf(query);
  if (index === -1) {
    return null;
  }
  return pageHtml.slice(index - 500, index + 500);
}

export async function findElementInPage(page, element) {
  // page is the html instance of playwrite returned, element is
  // one valid html tag name, query all elements with this tag name
  const elements = page.locator(element);
  return elements.all();
}
