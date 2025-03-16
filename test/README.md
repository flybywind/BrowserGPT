# ChatOpenAI 测试

本目录包含了用于测试 ChatOpenAI 与不同 LLM 模型集成的脚本。

## 环境配置

在运行测试之前，请确保已经配置好以下环境变量：

```bash
# 主要配置
OPENAI_API_BASE_URL=https://api.openai.com/v1  # 或者其他兼容的 API 端点
OPENAI_API_KEY=your_api_key_here

# 可选配置
TEST_MODEL=qwen-max  # 指定要测试的模型
TEST_MODELS=qwen-max,gpt-3.5-turbo  # 用于模型比较测试，逗号分隔
```

## 测试脚本

### 1. 基本测试

运行简单的 API 调用测试，验证基本功能是否正常：

```bash
node test/chat_test.js
```

### 2. 模型比较测试

测试不同模型在同一组问题上的表现：

```bash
node test/model_comparison.js
```

你可以通过设置 `TEST_MODELS` 环境变量来指定要比较的模型：

```bash
TEST_MODELS=qwen-max,qwen-plus,gpt-4,gpt-3.5-turbo node test/model_comparison.js
```

### 3. 错误处理测试

测试 API 在各种异常情况下的错误处理能力：

```bash
node test/error_handling.js
```

### 4. 流式输出测试

测试 API 的流式输出功能：

```bash
node test/streaming_test.js
```

## 注意事项

1. 这些测试会消耗 API 配额，请注意控制使用频率
2. 某些错误处理测试可能会产生多个错误日志，这是正常现象
3. 流式输出测试可能会根据网络状况有不同的表现
4. 确保你有足够权限访问指定的模型，否则可能会收到权限错误
