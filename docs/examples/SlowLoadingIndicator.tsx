/**
 * 慢加载指示器组件
 * 
 * 用于在 Supabase 冷启动时提供更好的用户体验
 * 如果加载超过 3 秒，会显示友好的提示信息
 */

'use client';

import { useState, useEffect } from 'react';
import { Spin } from 'antd';

interface SlowLoadingIndicatorProps {
  /**
   * 显示慢加载提示的延迟时间（毫秒）
   * @default 3000
   */
  delay?: number;
  
  /**
   * 是否正在加载
   */
  isLoading: boolean;
  
  /**
   * 自定义提示消息
   */
  message?: string;
}

export function SlowLoadingIndicator({ 
  delay = 3000, 
  isLoading,
  message = '正在启动数据库连接，首次加载可能需要 10-30 秒...'
}: SlowLoadingIndicatorProps) {
  const [showSlowMessage, setShowSlowMessage] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShowSlowMessage(false);
      return;
    }

    // 如果加载超过指定延迟时间，显示慢加载提示
    const timer = setTimeout(() => {
      setShowSlowMessage(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [isLoading, delay]);

  if (!isLoading) {
    return null;
  }

  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '50px',
      minHeight: '200px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Spin size="large" />
      {showSlowMessage && (
        <div style={{ marginTop: 24, maxWidth: 400 }}>
          <p style={{ 
            fontSize: 14, 
            color: '#666',
            margin: 0 
          }}>
            {message}
          </p>
          <p style={{ 
            fontSize: 12, 
            color: '#999',
            marginTop: 8 
          }}>
            后续访问将会更快 ⚡️
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * 使用示例:
 * 
 * ```tsx
 * 'use client';
 * 
 * import { useState, useEffect } from 'react';
 * import { SlowLoadingIndicator } from '@/components/SlowLoadingIndicator';
 * 
 * export function MyDataComponent() {
 *   const [isLoading, setIsLoading] = useState(true);
 *   const [data, setData] = useState(null);
 * 
 *   useEffect(() => {
 *     fetchData().then(result => {
 *       setData(result);
 *       setIsLoading(false);
 *     });
 *   }, []);
 * 
 *   if (isLoading) {
 *     return <SlowLoadingIndicator isLoading={isLoading} />;
 *   }
 * 
 *   return <div>{/* 渲染数据 *\/}</div>;
 * }
 * ```
 */

