import React from 'react';
import { createRoot } from 'react-dom/client';
import { BikeViewer } from './features/bikes/BikeViewer.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(<BikeViewer />);
