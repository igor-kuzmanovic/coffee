import React from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, Navigate, RouterProvider } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { CoffeePage } from './pages/CoffeePage';
import './base.css';

const router = createHashRouter([
  { path: '/', element: <HomePage /> },
  { path: '/coffee/:slug', element: <CoffeePage /> },
  { path: '*', element: <Navigate to="/" replace /> },
]);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Missing root element');
}

createRoot(rootElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
