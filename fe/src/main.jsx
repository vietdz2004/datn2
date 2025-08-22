import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

/*
  SCSS Toàn cục (`.scss`):
  - File này chứa các style áp dụng cho TOÀN BỘ ứng dụng.
  - Thường dùng để reset CSS, định nghĩa font chữ, màu sắc chung,...
  - Mọi component trong dự án đều bị ảnh hưởng bởi style trong file này.
*/
import './index.scss';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
