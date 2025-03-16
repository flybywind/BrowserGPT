import dotenv from 'dotenv';
import {ChatOpenAI} from '@langchain/openai';
import {HumanMessage} from '@langchain/core/messages';

// 加载环境变量
dotenv.config();

async function testChatModel() {
  console.log('开始测试 ChatOpenAI...');

  // 检查必要的环境变量
  if (!process.env.OPENAI_API_BASE_URL) {
    console.error('错误: 请设置 OPENAI_API_BASE_URL 环境变量');
    process.exit(1);
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('错误: 请设置 OPENAI_API_KEY 环境变量');
    process.exit(1);
  }

  // 配置 API 参数
  const apiBaseUrl = process.env.OPENAI_API_BASE_URL;
  const apiKey = process.env.OPENAI_API_KEY;

  try {
    // 验证 URL 格式
    new URL(apiBaseUrl);
  } catch (e) {
    console.error('错误: OPENAI_API_BASE_URL 格式无效，请输入有效的 URL');
    process.exit(1);
  }

  console.log(`使用 API URL: ${apiBaseUrl}`);
  console.log(
    `API 密钥: ${apiKey.substring(0, 3)}...${apiKey.substring(
      apiKey.length - 3
    )}`
  );

  try {
    // 初始化 ChatOpenAI
    const model = process.env.TEST_MODEL || 'qwen-max';
    console.log(`使用模型: ${model}`);

    const chat = new ChatOpenAI({
      temperature: 0.7,
      model: model,
      configuration: {
        apiKey: apiKey,
        baseURL: apiBaseUrl,
      },
    });

    console.log('发送消息到 API...');
    const message = new HumanMessage(
      '你好，请用中文回答：你是谁？你能做什么？'
    );

    console.time('API 响应时间');
    const response = await chat.invoke([message]);
    console.timeEnd('API 响应时间');

    console.log('\n模型响应:');
    console.log('----------------------------------------');
    console.log(response.content);
    console.log('----------------------------------------');
    console.log('测试完成！');
  } catch (error) {
    console.error('测试失败:', error);
    process.exit(1);
  }
}

// 执行测试
testChatModel();
