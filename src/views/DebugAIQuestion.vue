<!--
AI问答功能调试页面

功能：
- 提供预设问题选项，方便快速测试
- 支持自定义问题输入
- 实时显示AI响应
- 显示API调用结果和错误信息

使用方法：
1. 选择预设问题或输入自定义问题
2. 点击"询问AI"按钮
3. 在AI响应区域查看AI的回答
4. 在成功/错误响应区域查看API调用详情
-->
<template>
  <div class="debug-ai-container">
    <h2>AI问答功能调试页面</h2>
    
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
          {{ isAsking ? '询问中...' : '询问AI' }}
        </button>
        
        <button @click="resetForm" class="btn-reset">
          重置
        </button>
      </div>
    </div>
    
    <!-- 成功响应容器 -->
    <div v-if="successResult" class="success-container">
      <h3>成功响应:</h3>
      <pre class="success">{{ JSON.stringify(successResult, null, 2) }}</pre>
    </div>
    
    <!-- 错误响应容器 -->
    <div v-if="errorResult" class="error-container">
      <h3>错误响应:</h3>
      <pre class="error">{{ JSON.stringify(errorResult, null, 2) }}</pre>
    </div>
    
    <!-- 其他错误容器 -->
    <div v-if="error" class="error-container">
      <h3>错误信息:</h3>
      <pre class="error">{{ error }}</pre>
    </div>
    
    <!-- AI响应容器 -->
    <div v-if="aiResponse" class="ai-response-container">
      <h3>AI响应:</h3>
      <div class="ai-response">{{ aiResponse }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { streamFromAIEdge } from '@/services/aiService';

const question = ref('');
const selectedPreset = ref('');
const docId = ref('');
const isAsking = ref(false);
const successResult = ref<any>(null);
const errorResult = ref<any>(null);
const error = ref('');
const aiResponse = ref('');

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
  // 重置之前的结果
  successResult.value = null;
  errorResult.value = null;
  error.value = '';
  aiResponse.value = '';
  isAsking.value = true;
  
  try {
    console.log('准备询问AI，问题:', question.value, '文档ID:', docId.value);
    
    // 使用新的AI服务获取响应
    const response = await streamFromAIEdge(
      question.value, 
      (chunk) => {
        // 累积AI响应
        aiResponse.value += chunk;
      },
      docId.value || undefined
    );
    
    // 检查响应是否包含错误字段
    if (response && response.error) {
      // 如果响应中包含 error 字段，说明是错误响应
      errorResult.value = response;
      console.error('AI服务返回错误:', response);
    } else if (response && response.success) {
      // 如果响应中包含 success 字段且为 true，说明是成功响应
      successResult.value = response;
      console.log('AI问答调用成功:', response);
    } else {
      // 其他情况视为未知响应
      console.warn('AI服务返回未知格式响应:', response);
      successResult.value = response;
    }
  } catch (err: any) {
    error.value = err.message || '询问AI过程中发生未知错误';
    console.error('询问AI失败:', err);
  } finally {
    isAsking.value = false;
  }
};

const resetForm = () => {
  question.value = '';
  selectedPreset.value = '';
  docId.value = '';
  successResult.value = null;
  errorResult.value = null;
  error.value = '';
  aiResponse.value = '';
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