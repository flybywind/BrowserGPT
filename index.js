import dotenv from 'dotenv';
import {chromium} from 'playwright';
import prompt from 'prompt';
// eslint-disable-next-line no-unused-vars
import colors from '@colors/colors';
import {Command} from 'commander';

import {ChatOpenAI} from '@langchain/openai';
import {doActionWithAutoGPT} from './autogpt/index.js';
import {interactWithPage} from './actions/index.js';
import {createTestFile, gracefulExit, logPageScreenshot} from './util/index.js';

dotenv.config();

async function main(options) {
  const url = options.url;
  const browser = await chromium.launch({headless: options.headless});

  // Parse the viewport option
  const [width, height] = options.viewport.split(',').map(Number);

  const browserContext = await browser.newContext({
    viewport: {width, height},
  });

  const page = await browserContext.newPage();
  await page.goto(url);

  prompt.message = 'BrowserGPT'.green;
  const promptOptions = [];
  if (options.autogpt) {
    promptOptions.push('+AutoGPT');
  }
  if (options.headless) {
    promptOptions.push('+headless');
  }
  if (promptOptions.length > 0) {
    prompt.message += ` (${promptOptions.join(' ')})`.green;
  }
  prompt.delimiter = '>'.green;

  prompt.start();
  // 检查必要的环境变量
  if (!process.env.OPENAI_API_BASE_URL) {
    console.log(
      '请设置 OPENAI_API_BASE_URL 环境变量,例如: https://api.openai.com/v1 或 https://dashscope.aliyuncs.com/api/v1'
        .red
    );
    process.exit(1);
  }

  if (!process.env.OPENAI_API_KEY) {
    console.log('请设置 OPENAI_API_KEY 环境变量'.red);
    process.exit(1);
  }

  // 配置自定义API基础URL
  const apiBaseUrl = process.env.OPENAI_API_BASE_URL;
  const apiKey = process.env.OPENAI_API_KEY;

  // 验证URL格式
  try {
    new URL(apiBaseUrl);
  } catch (e) {
    console.log('OPENAI_API_BASE_URL 格式无效,请输入有效的URL'.red);
    process.exit(1);
  }

  const chatApi = new ChatOpenAI({
    temperature: 0.1,
    model: options.model ? options.model : 'qwen-max',
    configuration: {
      apiKey: apiKey,
      baseURL: apiBaseUrl,
    },
  });

  if (options.outputFilePath) {
    createTestFile(options.outputFilePath);
  }

  process.on('exit', () => {
    gracefulExit(options);
  });

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const {task} = await prompt.get({
      properties: {
        task: {
          message: ' Input a task\n',
          required: false,
        },
      },
    });

    if (task === '') {
      console.log('Please input a task or press CTRL+C to exit'.red);
    } else {
      try {
        if (options.autogpt) {
          await doActionWithAutoGPT(page, chatApi, task, options);
        } else {
          await interactWithPage(chatApi, page, task, options);
        }
        if (options.headless) {
          await logPageScreenshot(page);
        }
      } catch (e) {
        console.log('Execution failed');
        console.log(e);
      }
    }
  }
}

const program = new Command();

program
  .option('-a, --autogpt', 'run with autogpt', false)
  .option('-m, --model <model>', 'openai model to use', 'gpt-4-1106-preview')
  .option('-o, --outputFilePath <outputFilePath>', 'path to store test code')
  .option('-u, --url <url>', 'url to start on', 'https://www.google.com')
  .option('-v, --viewport <viewport>', 'viewport size to use', '1280,720')
  .option('-h, --headless', 'run in headless mode', false);

program.parse();

main(program.opts());
