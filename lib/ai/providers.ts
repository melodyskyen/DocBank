import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';
import {createOpenAI} from "@ai-sdk/openai";
const openai =  createOpenAI({
  // 若没有配置环境变量，请用百炼API Key将下行替换为：apiKey: "sk-xxx",
  apiKey: 'sk-8640b9894b214543b4f6e3a5c99d84c1',
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        'chat-model': openai('qwen-max-latest'),
        'chat-model-reasoning': wrapLanguageModel({
          model: openai('qwen-max-latest'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': openai('qwen-max-latest'),
        'artifact-model': openai('qwen-max-latest'),
      },
      imageModels: {
        'small-model': openai('qwen-max-latest'),
      },
    });
