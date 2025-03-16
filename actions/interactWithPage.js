import {retry} from '@lifeomic/attempt';
import {HumanMessage, SystemMessage} from '@langchain/core/messages';
import {expect} from '@playwright/test';
import {
  parseSite,
  preprocessJsonInput,
  appendToTestFile,
} from '../util/index.js';

const AsyncFunction = async function () {}.constructor;

export async function interactWithPage(chatApi, page, task, options) {
  const code = await getPlayWrightCode(page, chatApi, task);

  if (options.outputFilePath) {
    appendToTestFile(task, code, options.outputFilePath);
  }

  return execPlayWrightCode(page, code);
}

async function queryGPT(chatApi, messages) {
  console.time('chatApt.call');
  const completion = await retry(async () => chatApi.call(messages));
  console.timeEnd('chatApt.call');
  console.log('Commands to be executed'.green);
  let cleanedCommands = null;
  try {
    cleanedCommands = preprocessJsonInput(completion.text);
    console.log(cleanedCommands);
  } catch (e) {
    console.log(
      `No code found, \nreturn of gpt: ${completion.text}\nexception: ${e}`.red
    );
  }

  console.log('EOF'.green);

  return cleanedCommands;
}
// 这里我们不要直接处理html文本，因为文本太长了，很容易超出大模型上限。
// 而且也浪费token。此时我们需要和gpt进行多轮交互，直到找到gpt认为符合用户要求的html文本片段，
//
async function getPlayWrightCode(page, chatApi, task) {
  const systemPrompt = `
您是一名负责编写 Playwright 测试代码的高级软件开发工程师。您的任务是根据提供的指令，在一个较大的测试文件中实现特定的任务代码段。假设文件顶部已经有 '@playwright/test' 中的 'test' 和 'expect' 等常见导入。

背景信息：
- 您的电脑是 Mac。Cmd 是元键，META。
- 浏览器已经打开。
- 当前页面 URL：${await page.evaluate('location.href')}。
- 当前页面标题：${await page.evaluate('document.title')}。
- 网站的 HTML 格式概述：
\`\`\`
${await parseSite(page)}
\`\`\`

关键点：
- 直接从用户任务描述的 Playwright 操作开始，不要添加多余的步骤或断言。
- 仅在用户任务中明确要求时，才包括 'expect' 语句或 'waitForLoadState' 等等待函数。
- 使用简洁、相关的注释来澄清复杂操作或测试目的的重要方面。
- 根据任务要求，应用 'frameLocator' 处理嵌套 iframe 中的内容。

用户任务：[在此插入具体的用户任务，包括与执行、等待特定条件或明确请求的断言和等待相关的详细指令。]

预期代码格式：
\`\`\`
   // 点击一个链接
   await page.click('a[href="/desired-path"]');
   //or, 向下滚动
   await page.evaluate(() => {
       window.scrollBy(0, window.innerHeight);
     });
\`\`\`

目标是创建高效、精确且完全符合任务要求的 Playwright 代码，能够无缝集成到较大的测试文件中。
  `;
  console.log(`system prompt length = ${systemPrompt.length}`);
  return await queryGPT(chatApi, [
    new SystemMessage(systemPrompt),
    new HumanMessage(task),
  ]);
}

async function execPlayWrightCode(page, code) {
  const dependencies = [
    {param: 'page', value: page},
    {param: 'expect', value: expect},
  ];

  const func = AsyncFunction(...dependencies.map((d) => d.param), code);
  const args = dependencies.map((d) => d.value);
  return await func(...args);
}
