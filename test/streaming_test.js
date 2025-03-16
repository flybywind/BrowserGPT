import dotenv from 'dotenv';
import {ChatOpenAI} from '@langchain/openai';
import {HumanMessage} from '@langchain/core/messages';

// 加载环境变量
dotenv.config();

async function testStreamingOutput() {
  console.log('开始测试 ChatOpenAI 流式输出...');

  // 检查必要的环境变量
  if (!process.env.OPENAI_API_BASE_URL || !process.env.OPENAI_API_KEY) {
    console.error(
      '错误: 请确保设置了 OPENAI_API_BASE_URL 和 OPENAI_API_KEY 环境变量'
    );
    process.exit(1);
  }

  const apiBaseUrl = process.env.OPENAI_API_BASE_URL;
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.TEST_MODEL || 'qwen-max';

  try {
    // 初始化 ChatOpenAI
    const chat = new ChatOpenAI({
      temperature: 0.7,
      model: model,
      streaming: true,
      configuration: {
        apiKey: apiKey,
        baseURL: apiBaseUrl,
      },
    });

    const question =
      '请给我讲一个关于人工智能的小故事，故事要包含起承转合，并且有一个出人意料的结局。';
    console.log(`\n问题: ${question}\n`);

    const message = new HumanMessage(question);

    console.log('开始流式输出...\n');
    console.time('总响应时间');

    // 使用流式输出
    let fullResponse = '';

    const stream = await chat.stream([message]);

    process.stdout.write('响应: ');
    for await (const chunk of stream) {
      if (chunk.content) {
        process.stdout.write(chunk.content);
        fullResponse += chunk.content;
      }
    }

    console.timeEnd('总响应时间');
    console.log('\n\n流式输出测试完成！');

    // 输出总字符数
    console.log(`\n总响应字符数: ${fullResponse.length}`);
  } catch (error) {
    console.error('测试失败:', error);
    process.exit(1);
  }
}

// 执行测试
testStreamingOutput().catch((error) => {
  console.error('测试执行失败:', error);
  process.exit(1);
});
