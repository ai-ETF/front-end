<template>
  <div class="debug-ingest-container">
    <h2>文档处理函数调试页面</h2>
    
    <div class="debug-form">
      <div class="form-group">
        <label for="storagePath">存储路径:</label>
        <input
          id="storagePath"
          v-model="storagePath"
          type="text"
          placeholder="输入文件的存储路径，例如: bucket/folder/filename.pdf"
        />
      </div>
      
      <div class="form-group">
        <label for="fileName">文件名:</label>
        <input
          id="fileName"
          v-model="fileName"
          type="text"
          placeholder="输入文件名，例如: document.pdf"
        />
      </div>
      
      <div class="button-group">
        <button @click="testCallIngestDocumentFunction" :disabled="isCalling" class="btn-call">
          {{ isCalling ? '调用中...' : '调用文档处理函数' }}
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { callIngestDocumentFunction } from '@/services/fileService';

const storagePath = ref('');
const fileName = ref('');
const isCalling = ref(false);
const successResult = ref<any>(null);
const errorResult = ref<any>(null);
const error = ref('');

// 组件挂载时设置默认值
onMounted(() => {
  storagePath.value = 'b978e5f5-2908-4dc5-991e-5c4371cb60b0/uploads/1767274387924-fh8z621.pdf';
  fileName.value = '南方';
});

const testCallIngestDocumentFunction = async () => {
  // 重置之前的结果
  successResult.value = null;
  errorResult.value = null;
  error.value = '';
  isCalling.value = true;
  
  try {
    console.log('准备调用文档处理函数，参数:', { storagePath: storagePath.value, fileName: fileName.value });
    
    const response = await callIngestDocumentFunction(storagePath.value, fileName.value);
    
    // 检查响应是否包含错误字段
    if (response && response.error) {
      // 如果响应中包含 error 字段，说明是错误响应
      errorResult.value = response;
      console.error('文档处理函数返回错误:', response);
    } else if (response && response.success) {
      // 如果响应中包含 success 字段且为 true，说明是成功响应
      successResult.value = response;
      console.log('文档处理函数调用成功:', response);
    } else {
      // 其他情况视为未知响应
      console.warn('文档处理函数返回未知格式响应:', response);
      successResult.value = response;
    }
  } catch (err: any) {
    error.value = err.message || '调用过程中发生未知错误';
    console.error('调用文档处理函数失败:', err);
  } finally {
    isCalling.value = false;
  }
};

const resetForm = () => {
  storagePath.value = '';
  fileName.value = '';
  successResult.value = null;
  errorResult.value = null;
  error.value = '';
};
</script>

<style scoped>
.debug-ingest-container {
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

.btn-call, .btn-reset {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-call {
  background: #007bff;
  color: white;
}

.btn-call:hover:not(:disabled) {
  background: #0056b3;
}

.btn-call:disabled {
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

.result-container, .error-container, .success-container {
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

.result-container h3, .error-container h3, .success-container h3 {
  margin-top: 0;
}

pre {
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