<!--
AI问答功能调试页面

功能：
- 提供预设问题选项，方便快速测试
- 支持自定义问题输入
- 同时调用streamFromAI和streamFromAIEdge，显示两者的对比结果
- 实时显示AI响应
- 显示API调用结果和错误信息

使用方法：
1. 选择预设问题或输入自定义问题
2. 点击"询问AI"按钮
3. 在AI响应区域查看两个服务的回答对比
4. 在成功/错误响应区域查看API调用详情
-->
<template>
  <div class="debug-ai-container">
    <h2>AI问答功能调试页面（对比版）</h2>
    
    <div class="debug-form">
      <div class="form-group">
        <label for="question">问题:</label>
        <select v-model="selectedPreset" @change="onPresetChange" class="preset-select">
          <option value="">选择预设问题</option>
          <option value="hello">你好</option>
          <option value="fee-comparison">华泰柏瑞中证红利低波和南方红利低波的管理费率有什么差异</option>
        </select>
        <textarea
          id="question"
          v-model="question"
          rows="4"
          placeholder="输入你的问题"
        />
      </div>
      
      <div class="form-group">
        <label for="docId">文档ID（可选）:</label>
        <input
          id="docId"
          v-model="docId"
          type="text"
          placeholder="限制在特定文档中检索（可选）"
        />
      </div>
      
      <div class="button-group">
        <button @click="testAskAI" :disabled="isAsking" class="btn-ask">
          {{ isAsking ? '询问中...' : '询问AI（对比版）' }}
        </button>
        
        <button @click="resetForm" class="btn-reset">
          重置
        </button>
      </div>
    </div>
    
    <!-- streamFromAI 结果 -->
    <div class="service-result-container">
      <h3>streamFromAI 结果</h3>
      
      <!-- streamFromAI 成功响应容器 -->
      <div v-if="successResultStreamFromAI" class="success-container">
        <h4>成功响应:</h4>
        <pre class="success">{{ JSON.stringify(successResultStreamFromAI, null, 2) }}</pre>
      </div>
      
      <!-- streamFromAI 错误响应容器 -->
      <div v-if="errorResultStreamFromAI" class="error-container">
        <h4>错误响应:</h4>
        <pre class="error">{{ JSON.stringify(errorResultStreamFromAI, null, 2) }}</pre>
      </div>
      
      <!-- streamFromAI 其他错误容器 -->
      <div v-if="errorStreamFromAI" class="error-container">
        <h4>错误信息:</h4>
        <pre class="error">{{ errorStreamFromAI }}</pre>
      </div>
      
      <!-- streamFromAI 响应容器 -->
      <div v-if="aiResponseStreamFromAI" class="ai-response-container">
        <h4>AI响应:</h4>
        <div class="ai-response">{{ aiResponseStreamFromAI }}</div>
      </div>
    </div>
    
    <!-- streamFromAIEdge 结果 -->
    <div class="service-result-container">
      <h3>streamFromAIEdge 结果</h3>
      
      <!-- streamFromAIEdge 成功响应容器 -->
      <div v-if="successResultStreamFromAIEdge" class="success-container">
        <h4>成功响应:</h4>
        <pre class="success">{{ JSON.stringify(successResultStreamFromAIEdge, null, 2) }}</pre>
      </div>
      
      <!-- streamFromAIEdge 错误响应容器 -->
      <div v-if="errorResultStreamFromAIEdge" class="error-container">
        <h4>错误响应:</h4>
        <pre class="error">{{ JSON.stringify(errorResultStreamFromAIEdge, null, 2) }}</pre>
      </div>
      
      <!-- streamFromAIEdge 其他错误容器 -->
      <div v-if="errorStreamFromAIEdge" class="error-container">
        <h4>错误信息:</h4>
        <pre class="error">{{ errorStreamFromAIEdge }}</pre>
      </div>
      
      <!-- streamFromAIEdge 响应容器 -->
      <div v-if="aiResponseStreamFromAIEdge" class="ai-response-container">
        <h4>AI响应:</h4>
        <div class="ai-response">{{ aiResponseStreamFromAIEdge }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { streamFromAI, streamFromAIEdge } from '@/services/aiService';

const question = ref('');
const selectedPreset = ref('');
const docId = ref('');
const isAsking = ref(false);

// streamFromAI 相关响应变量
const successResultStreamFromAI = ref<any>(null);
const errorResultStreamFromAI = ref<any>(null);
const errorStreamFromAI = ref('');
const aiResponseStreamFromAI = ref('');

// streamFromAIEdge 相关响应变量
const successResultStreamFromAIEdge = ref<any>(null);
const errorResultStreamFromAIEdge = ref<any>(null);
const errorStreamFromAIEdge = ref('');
const aiResponseStreamFromAIEdge = ref('');

// 组件挂载时设置默认问题
onMounted(() => {
  question.value = '华泰柏瑞中证红利低波和南方红利低波的管理费率有什么差异';
  selectedPreset.value = 'fee-comparison';
});

const onPresetChange = () => {
  if (selectedPreset.value === 'hello') {
    question.value = '你好';
  } else if (selectedPreset.value === 'fee-comparison') {
    question.value = '华泰柏瑞中证红利低波和南方红利低波的管理费率有什么差异';
  }
};

const testAskAI = async () => {
  // 检查问题是否为空
  if (!question.value || !question.value.trim()) {
    alert('请输入问题');
    return;
  }
  
  // 重置之前的所有结果
  resetForm();
  isAsking.value = true;
  
  try {
    console.log('准备询问AI，问题:', question.value, '文档ID:', docId.value);
    
    // 确保在异步调用前，问题内容是有效的
    const currentQuestion = question.value.trim();
    console.log('当前问题内容:', currentQuestion);
    if (!currentQuestion) {
      alert('问题不能为空');
      isAsking.value = false;
      return;
    }
    
    // 并行调用两个服务
    const [streamFromAIResult, streamFromAIEdgeResult] = await Promise.allSettled([
      // 调用 streamFromAI
      new Promise((resolve, reject) => {
        let responseText = '';
        
        // 构建消息数组格式，符合streamFromAI函数要求
        const messages = [{
          id: 'temp-user-message',
          text: currentQuestion,
          isuser: true,
          timestamp: new Date()
        }];
        
        streamFromAI(
          messages,
          (chunk) => {
            // 累积AI响应
            responseText += chunk;
            aiResponseStreamFromAI.value = responseText;
          }
        ).then(resolve).catch(reject);
      }),
      
      // 调用 streamFromAIEdge
      new Promise((resolve, reject) => {
        let responseText = '';
        
        streamFromAIEdge(
          currentQuestion, 
          (chunk) => {
            // 累积AI响应
            responseText += chunk;
            aiResponseStreamFromAIEdge.value = responseText;
          },
          docId.value || undefined
        ).then(resolve).catch(reject);
      })
    ]);
    
    // 处理 streamFromAI 的结果
    if (streamFromAIResult.status === 'fulfilled') {
      const result = streamFromAIResult.value as { success: boolean; error?: string };
      
      if (result && result.error) {
        errorResultStreamFromAI.value = result;
        console.error('streamFromAI 服务返回错误:', result);
      } else if (result && result.success) {
        successResultStreamFromAI.value = result;
        console.log('streamFromAI 问答调用成功:', result);
      } else {
        console.warn('streamFromAI 服务返回未知格式响应:', result);
        successResultStreamFromAI.value = result;
      }
    } else {
      errorStreamFromAI.value = streamFromAIResult.reason?.message || 'streamFromAI 询问过程中发生未知错误';
      console.error('streamFromAI 询问失败:', streamFromAIResult.reason);
    }
    
    // 处理 streamFromAIEdge 的结果
    if (streamFromAIEdgeResult.status === 'fulfilled') {
      const result = streamFromAIEdgeResult.value as { success: boolean; error?: string };
      
      if (result && result.error) {
        errorResultStreamFromAIEdge.value = result;
        console.error('streamFromAIEdge 服务返回错误:', result);
      } else if (result && result.success) {
        successResultStreamFromAIEdge.value = result;
        console.log('streamFromAIEdge 问答调用成功:', result);
      } else {
        console.warn('streamFromAIEdge 服务返回未知格式响应:', result);
        successResultStreamFromAIEdge.value = result;
      }
    } else {
      errorStreamFromAIEdge.value = streamFromAIEdgeResult.reason?.message || 'streamFromAIEdge 询问过程中发生未知错误';
      console.error('streamFromAIEdge 询问失败:', streamFromAIEdgeResult.reason);
    }
    
  } catch (err: any) {
    // 这里处理其他可能的错误
    console.error('询问AI失败:', err);
  } finally {
    isAsking.value = false;
  }
};

const resetForm = () => {
  // question.value = '';
  // selectedPreset.value = '';
  docId.value = '';
  
  // 重置 streamFromAI 相关响应变量
  successResultStreamFromAI.value = null;
  errorResultStreamFromAI.value = null;
  errorStreamFromAI.value = '';
  aiResponseStreamFromAI.value = '';
  
  // 重置 streamFromAIEdge 相关响应变量
  successResultStreamFromAIEdge.value = null;
  errorResultStreamFromAIEdge.value = null;
  errorStreamFromAIEdge.value = '';
  aiResponseStreamFromAIEdge.value = '';
};
</script>

<style scoped>
.debug-ai-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.debug-form {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin: 1.5rem 0;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #333;
}

.form-group .preset-select {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-ask, .btn-reset {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-ask {
  background: #28a745;
  color: white;
}

.btn-ask:hover:not(:disabled) {
  background: #218838;
}

.btn-ask:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.btn-reset {
  background: #6c757d;
  color: white;
}

.btn-reset:hover {
  background: #545b62;
}

.service-result-container {
  margin-top: 2rem;
  padding: 1.5rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.service-result-container h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e9ecef;
}

.result-container, .error-container, .success-container, .ai-response-container {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 4px;
}

.success-container {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.error-container {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
}

.ai-response-container {
  background: #e2e3e5;
  border: 1px solid #d6d8db;
  color: #383d41;
}

.ai-response {
  white-space: pre-wrap;
  word-wrap: break-word;
  padding: 1rem;
  background: white;
  border-radius: 4px;
}

.result-container h3, .error-container h3, .success-container h3, .ai-response-container h3 {
  margin-top: 0;
}

.result-container h4, .error-container h4, .success-container h4, .ai-response-container h4 {
  margin-top: 0;
  color: #495057;
  font-size: 1rem;
}

.pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-x: auto;
}

.success {
  background-color: #d4edda;
}

.error {
  background-color: #f8d7da;
}
</style>
```