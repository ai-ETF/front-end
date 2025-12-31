/**
 * 验证文件名
 */
export function validateFileName(fileName: string): boolean {
  if (!fileName || fileName.trim().length === 0) {
    return false
  }
  
  // 检查文件名长度
  if (fileName.length > 255) {
    return false
  }
  
  // 检查非法字符（根据操作系统限制）
  const illegalChars = /[<>:"/\\|?*\x00-\x1F]/
  if (illegalChars.test(fileName)) {
    return false
  }
  
  // 检查保留文件名
  const reservedNames = [
    'CON', 'PRN', 'AUX', 'NUL',
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
    'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
  ]
  
  const nameParts = fileName.split('.')
  const nameWithoutExt = nameParts[0] ? nameParts[0].toUpperCase() : ''
  if (reservedNames.includes(nameWithoutExt)) {
    return false
  }
  
  return true
}

/**
 * 验证文件类型
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type)
}

/**
 * 验证文件大小
 */
export function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize
}

/**
 * 验证PDF文件（额外检查）
 */
export async function validatePDF(file: File): Promise<boolean> {
  // 检查MIME类型
  if (file.type !== 'application/pdf') {
    return false
  }
  
  // 可选：读取文件头验证PDF签名
  try {
    const buffer = await file.slice(0, 4).arrayBuffer()
    const header = new Uint8Array(buffer)
    const pdfSignature = [37, 80, 68, 70] // %PDF
    return header[0] === pdfSignature[0] && 
           header[1] === pdfSignature[1] && 
           header[2] === pdfSignature[2] && 
           header[3] === pdfSignature[3]
  } catch {
    return false
  }
}